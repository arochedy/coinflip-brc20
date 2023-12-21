const mempoolJS = require("@mempool/mempool.js")
const axios = require("axios");
const MAIN_TOKEN_TICK = "ACD3"
const utils = require("../logger.js")
const constants = require("../constants.js")
import * as retry from "async-retry";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import * as ECPairFactory from "ecpair";

const ECPair = ECPairFactory.default(ecc);
bitcoin.initEccLib(ecc);

const encoder = new TextEncoder();

// individual data pushes may not be larger than 520 bytes
const MAX_CHUNK_SIZE = 520;

/**
 * Create a basic text inscription.
 */
function createTextInscription(text) {
  return createInscription(
    "text/plain;charset=utf-8",
    Buffer.from(encoder.encode(text))
  );
}

/**
 * Create an inscription.
 */
function createInscription(contentType, content) {
  return {
    // e.g. `image/png`
    contentType: Buffer.from(encoder.encode(contentType)),
    content
  };
}

function chunkContent(data) {
  const body = [];
  let start = 0;
  while (start < data.length) {
    body.push(data.subarray(start, start + MAX_CHUNK_SIZE));
    start += MAX_CHUNK_SIZE;
  }
  return body;
}

function createInscriptionScript(xOnlyPublicKey, inscription) {
  const protocolId = Buffer.from(encoder.encode("ord"));
  return [
    xOnlyPublicKey,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_0,
    bitcoin.opcodes.OP_IF,
    protocolId,
    1,
    1, // NOTE: Buffer.from([1]) is replaced here https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/script.js#L53
    inscription.contentType,
    bitcoin.opcodes.OP_0,
    ...chunkContent(inscription.content),
    bitcoin.opcodes.OP_ENDIF,
  ];
}

function toXOnly(pubkey) {
  return pubkey.subarray(1, 33);
}

/**
 * Create the commit tx of the input public key and inscription data.
 * @dev Requires caller to initialize ECC lib.
 */
async function createCommitTxData(
  network,
  publicKey,
  inscription
) {
  const xOnlyPublicKey = toXOnly(publicKey);
  const script = createInscriptionScript(xOnlyPublicKey, inscription);


  const outputScript = bitcoin.script.compile(script);

  const scriptTree = {
    output: outputScript,
    redeemVersion: 192, // 0xc0
  };

  const scriptTaproot = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPublicKey,
    scriptTree,
    redeem: scriptTree,
    network,
  });

  const cblock = scriptTaproot.witness?.[scriptTaproot.witness.length - 1];

  const tapLeafScript = {
    leafVersion: scriptTaproot.redeemVersion,
    script: outputScript,
    controlBlock: cblock,
  };

  return {
    scriptTaproot,
    tapLeafScript,
  };
}

import * as psbtUtils from "bitcoinjs-lib/src/psbt/psbtutils";

const { witnessStackToScriptWitness } = psbtUtils;

/**
 * Create the reveal tx which spends the commit tx.
 */
function createRevealTx(
  network,
  commitTxData,
  commitTxResult,
  toAddress,
  amount,
) {
  const { scriptTaproot, tapLeafScript } = commitTxData;

  const psbt = new bitcoin.Psbt({ network });

  psbt.addInput({
    hash: commitTxResult.tx.getId(),
    index: commitTxResult.outputIndex,
    witnessUtxo: {
      value: commitTxResult.outputAmount,
      script: scriptTaproot.output,
    },
    nonWitnessUtxo: commitTxResult.tx.toBuffer(),
    tapLeafScript: [tapLeafScript],
  });

  psbt.addOutput({
    value: amount,
    address: toAddress,
  });

  return psbt;
}

const customFinalizer = (commitTxData) => {
  const { tapLeafScript } = commitTxData;

  return (inputIndex, input) => {
    const witness = [input.tapScriptSig[inputIndex].signature]
      .concat(tapLeafScript.script)
      .concat(tapLeafScript.controlBlock);

    return {
      finalScriptWitness: witnessStackToScriptWitness(witness),
    };
  };
}

class DummySigner {
  publicKey;
  constructor(publicKey) {
    this.publicKey = publicKey;
  }
  sign(_hash, _lowR) {
    // https://github.com/bitcoin/bitcoin/blob/607d5a46aa0f5053d8643a3e2c31a69bfdeb6e9f/src/script/sign.cpp#L611
    return Buffer.alloc(64, 0);
  }
  signSchnorr(hash) {
    // https://github.com/bitcoin/bitcoin/blob/607d5a46aa0f5053d8643a3e2c31a69bfdeb6e9f/src/script/sign.cpp#L626
    return Buffer.alloc(64, 0);
  }
}

function estimateTxSize(
  network,
  publicKey,
  commitTxData,
  toAddress,
  amount,
) {
  const psbt = new bitcoin.Psbt({ network });

  const { scriptTaproot, tapLeafScript } = commitTxData;
  psbt.addInput({
    hash: Buffer.alloc(32, 0),
    index: 0,
    witnessUtxo: {
      value: amount,
      script: scriptTaproot.output,
    },
    tapLeafScript: [tapLeafScript],
  });

  psbt.addOutput({
    value: amount,
    address: toAddress,
  });

  psbt.signInput(0, new DummySigner(publicKey));
  psbt.finalizeInput(0, customFinalizer(commitTxData));

  const tx = psbt.extractTransaction();
  return tx.virtualSize();
}

const checkConfirmation = async (transactionId) => {
  const {
    bitcoin: { transactions }
  } = mempoolJS({
    hostname: "mempool.space"
  })
  let txData
  try {
    txData = await transactions.getTx({ txid: transactionId })
  } catch (error) {
    if (error.response.status == 400) {
      return {
        status: 400,
        body: {
          data: "Transaction not found"
        }
      }
    }
    return {
      status: 400,
      body: {
        data: "Transaction Id is not valid"
      }
    }
  }
  if (!txData.status.confirmed) {
    return {
      status: 400,
      body: {
        data: "Transaction is not confirmed"
      }
    }
  } else {
    return {
      status: 200,
      body: {
        data: "Transaction is confirmed"
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const analyze = async (transactionId, address) => {
  try {
    const {
      bitcoin: { transactions }
    } = mempoolJS({
      hostname: "mempool.space"
    });
    await sleep(30000)

    const txData = await transactions.getTx({ txid: transactionId });
    let inscriptionTxs = [];
    let bitcoinTxs = [];

    for (let index = 0; index < txData.vout.length; index++) {
      const out_utxo = txData.vout[index];
      const outputAddress = out_utxo.scriptpubkey_address;
      if (outputAddress === address) {
        const in_utxo = txData.vin.filter(
          (utxo) => utxo.vout == index && utxo.prevout.value == 546
        );
        if (in_utxo.length > 0 && out_utxo.value == 546) {
          inscriptionTxs = inscriptionTxs.concat(in_utxo);
          utils.logEvent("", constants.LOG_LEVELS.info, constants.RESPONSE_CODES.LOG_MESSAGE_ONLY, `Inscription found`)
        } else {
          bitcoinTxs.push(out_utxo);
        }
      }
    }

    if (inscriptionTxs.length > 0) {
      utils.logEvent("", constants.LOG_LEVELS.info, constants.RESPONSE_CODES.LOG_MESSAGE_ONLY, `Transaction for inscription with ID ${transactionId} is for address ${address} is ${txData.status.confirmed ? 'confirmed, balance can now be withdrawn' : 'not confirmed, wait 60 seconds for the next check'}`)
      const transferResult = await axios.get(`https://open-api.unisat.io/v1/indexer/brc20/${MAIN_TOKEN_TICK}/tx/${transactionId}/history`, {
        headers: {
          'Authorization': `Bearer ad863fd45eb93c01a31d364cb5f9165bfcdf4d84873155eec5ed39169a789016`
        }
      });

      if (transferResult.status == 200) {
        if (transferResult.data.msg == "ok") {
          if (transferResult.data.data.detail.length > 0) {
            if (transferResult.data.data.detail[0].valid === true &&
              transferResult.data.data.detail[0].type === "transfer" &&
              transferResult.data.data.detail[0].to === address) {
              if (txData.status.confirmed) {
                return {
                  status: 200,
                  body: {
                    data: Number.parseFloat(transferResult.data.data.detail[0].amount),
                  }
                };
              }
              else {
                return {
                  status: 201,
                  body: {
                    data: Number.parseFloat(transferResult.data.data.detail[0].amount),
                  },
                }
              }
            }
          }
        }
      }
      return {
        status: 400,
        body: {
          data: "No Inscription sent",
        },
      };
      // const inscription_witnesses = await Promise.all(
      //   inscriptionTxs.map((inscriptionTx) =>
      //     axios.get(`https://blockchain.info/rawtx/${inscriptionTx.txid}`)
      //   )
      // );

      // const regularStrings = inscription_witnesses.map((witness) =>
      //   Buffer.from(witness.data.inputs[0].witness, "hex").toString()
      // );

      // let inscriptionIds_sent = [];
      // regularStrings.map((regularString, index) => {
      //   if (regularString.includes('{"p":"brc-20","op":"transfer","tick"')) {
      //     const regex = /{"p":"brc-20","op":"transfer","tick".*?}/s;
      //     const match = regularString.match(regex);
      //     const jsonStr = match ? match[0] : "";
      //     const json = JSON.parse(jsonStr);
      //     if (json.tick == MAIN_TOKEN_TICK)
      //       inscriptionIds_sent.push(inscriptionTxs[index].txid + "i0");
      //   }
      // });
      // if (inscriptionIds_sent.length > 0) {
      //   let totalReceived = 0;
      //   const promises = inscriptionIds_sent.map(async (e) => {
      //     const res = await openapiService.getInscriptionContent(e);
      //     if (res.tick == MAIN_TOKEN_TICK) {

      //       totalReceived += Number(res.amt);
      //     }
      //   });
      //   await Promise.all(promises);

      //   return {
      //     status: 200,
      //     body: {
      //       data: totalReceived,
      //     },
      //   };
      // } else {
      //   return {
      //     status: 400,
      //     body: {
      //       data: "No Inscription sent",
      //     },
      //   };
      // }
    }

    if (bitcoinTxs.length > 0) {
      const receivedBTC = bitcoinTxs.reduce((acc, tx) => acc + tx.value, 0);
      utils.logEvent("", constants.LOG_LEVELS.info, constants.RESPONSE_CODES.LOG_MESSAGE_ONLY, `Transaction with ID ${transactionId} is for address ${address} is ${txData.status.confirmed ? 'confirmed, balance can now be withdrawn' : 'not confirmed, wait 60 seconds for the next check'}`)
      if (txData.status.confirmed) {
        return {
          status: 200,
          body: {
            data: receivedBTC
          }
        };
      }
      else {
        return {
          status: 201,
          body: {
            data: receivedBTC
          },
        }
      }
    } else {
      console.log(`No transactions found for address: ${address}`);
      return { status: 404, body: { message: "Transaction not found for this address." } };
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return { status: 500, body: { message: "An error occurred." } };
  }
};

const analyzeForWithdraw = async (transactionId, address) => {
  try {
    const {
      bitcoin: { transactions }
    } = mempoolJS({
      hostname: "mempool.space"
    });
    await sleep(30000)

    const txData = await transactions.getTx({ txid: transactionId });
    let inscriptionTxs = [];
    let bitcoinTxs = [];

    for (let index = 0; index < txData.vout.length; index++) {
      const out_utxo = txData.vout[index];
      const outputAddress = out_utxo.scriptpubkey_address;
      if (outputAddress === address) {
        bitcoinTxs.push(out_utxo);
      }
    }

    if (bitcoinTxs.length > 0) {
      const receivedBTC = bitcoinTxs.reduce((acc, tx) => acc + tx.value, 0);
      utils.logEvent("", constants.LOG_LEVELS.info, constants.RESPONSE_CODES.LOG_MESSAGE_ONLY, `Transaction with ID ${transactionId} is for address ${address} is ${txData.status.confirmed ? 'confirmed, withdraw request will be processed' : 'not confirmed, wait 60 seconds for the next check'}`)
      if (receivedBTC >= 22000) {
        if (txData.status.confirmed) {
          return {
            status: 200,
            body: {
              data: true
            }
          };
        }
        else {
          return {
            status: 201,
            body: {
              data: true
            },
          }
        }
      } else {
        console.log(`Wrong amount of fee is deposited for address: ${address}`);
        return { status: 404, body: { message: "Wrong amount of fee is deposited for this address." } };
      }
    } else {
      console.log(`No transactions found for address: ${address}`);
      return { status: 404, body: { message: "Transaction not found for this address." } };
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return { status: 500, body: { message: "An error occurred." } };
  }
};

const getTxHex = async (txId) => {
  return await retry(
    async (bail) => {
      // if anything throws, we retry
      const res = await fetch(
        `https://blockstream.info/api/tx/${txId}/hex`
      );
      if (res.status === 403) {
        // don't retry upon 403
        bail(new Error("Unauthorized"));
        throw "Unauthorized";
      } else if (res.status === 404) {
        throw "Could find tx";
      }

      return res.text();
    },
    {
      retries: 20,
      minTimeout: 2000,
      maxTimeout: 5000,
    }
  );
}

const getAddressUtxos = async (address) => {
  return await retry(
    async (bail) => {
      const utxoResult = await axios.get(`https://open-api.unisat.io/v1/indexer/address/${address}/utxo-data`, {
        headers: {
          'Authorization': `Bearer ad863fd45eb93c01a31d364cb5f9165bfcdf4d84873155eec5ed39169a789016`
        }
      });

      if (utxoResult.status == 200 && utxoResult.data && utxoResult.data.data && utxoResult.data.data.utxo) {
        return utxoResult.data.data.utxo;
      }

      if (utxoResult.status === 403) {
        // don't retry upon 403
        bail(new Error("Unauthorized"));
        throw "Unauthorized";
      } else if (res.status === 404) {
        throw "Could find tx";
      }
    },
    {
      retries: 20,
      minTimeout: 2000,
      maxTimeout: 5000,
    }
  );
}

const mapUtxos = async (utxosFromMempool) => {
  const ret = [];
  if (utxosFromMempool.length > 0) {
    for (const utxoFromMempool of utxosFromMempool) {
      ret.push({
        txid: utxoFromMempool.txid,
        vout: utxoFromMempool.vout,
        value: utxoFromMempool.satoshi,
        tx: bitcoin.Transaction.fromHex(await getTxHex(utxoFromMempool.txid)),
      });
    }
  }
  return ret;
}

const isP2SHAddress = (address, network) => {
  try {
    const { version, hash } = bitcoin.address.fromBase58Check(address);
    return version === network.scriptHash && hash.length === 20;
  } catch (error) {
    return false;
  }
}

const calculateTxBytesFee = async (
  vinsLength,
  voutsLength,
  feeRateTier,
  includeChangeOutput= 1,
) => {
  return calculateTxBytesFeeWithRate(
    vinsLength,
    voutsLength,
    70.0,
    includeChangeOutput,
  );
}

const calculateTxBytesFeeWithRate = async (
  vinsLength,
  voutsLength,
  feeRate,
  includeChangeOutput = 1,
) => {
  const baseTxSize = 10;
  const inSize = 180;
  const outSize = 34;

  const txSize =
    baseTxSize +
    vinsLength * inSize +
    voutsLength * outSize +
    includeChangeOutput * outSize;
  const fee = txSize * feeRate;
  return fee;
}

const withdrawARC = async (withdrawAddress, amount) => {
  const {
    bitcoin: { addresses }
  } = mempoolJS({
    hostname: "mempool.space"
  })

  const network = bitcoin.networks.bitcoin;
  const treasuryPublicKey = process.env.TREASURY_PUBLICKEY
  const treasuryPrivateKey = process.env.TREASURY_PPRIVATEKEY
  const privateKey = Buffer.from(treasuryPrivateKey, "hex");
  const keyPair = ECPair.fromPrivateKey(privateKey);
  const treasuryAddress = process.env.TREASURY_ADDRESS
  const publicKey = Buffer.from(treasuryPublicKey, "hex");
  const toAddress = treasuryAddress;
  const inscription = createTextInscription(`{"p":"brc-20","op":"transfer","tick":"ACD3","amt":"${amount}"}`);
  const commitTxData = await createCommitTxData(network, publicKey, inscription);

  const revealTxSize = estimateTxSize(network, publicKey, commitTxData, toAddress, 546);

  const revealFee = revealTxSize * 70.0;
  const commitTxAmount = revealFee + 546;

  const commitAddress = commitTxData.scriptTaproot.address;

  //PSBT for Sending CommitTX
  const commit_psbt = new bitcoin.Psbt({ network });

  let commit_totalInput = 0;

  let all_utxos_mempool = await getAddressUtxos(treasuryAddress);
  let all_utxos = await mapUtxos(all_utxos_mempool);

  let commit_paymentUTXOs = [];
  let commit_sum = 0;
  let transfer_paymentUTXOs = [];
  let transfer_sum = 0;
  for (const utxo of all_utxos) {
    if (commit_sum <= (commitTxAmount + 12000)) {
      commit_sum += utxo.value;
      commit_paymentUTXOs.push(utxo);
    } else {
      transfer_sum += utxo.value;
      transfer_paymentUTXOs.push(utxo);
      if (transfer_sum > (546 + 12000)) {
        break;
      }
    }
  }

  if ((commit_sum <= (commitTxAmount + 12000)) || (transfer_sum <= (546 + 12000)))
    return "";

  for (const utxo of commit_paymentUTXOs) {
    const input = {
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: utxo.tx.toBuffer(),
    };

    const p2shInputWitnessUTXOUn = {};
    const p2shInputRedeemScriptUn = {};

    if (isP2SHAddress(treasuryAddress, network)) {
      const redeemScript = bitcoin.payments.p2wpkh({
        pubkey: publicKey,
      }).output;
      const p2sh = bitcoin.payments.p2sh({
        redeem: { output: redeemScript },
      });
      p2shInputWitnessUTXOUn.witnessUtxo = {
        script: p2sh.output,
        value: utxo.value,
      };
      p2shInputRedeemScriptUn.redeemScript = p2sh.redeem?.output;
    }

    commit_psbt.addInput({
      ...input,
      ...p2shInputWitnessUTXOUn,
      ...p2shInputRedeemScriptUn,
    });

    commit_totalInput += utxo.value;
  }

  commit_psbt.addOutput({
    address: commitAddress,
    value: commitTxAmount,
  });

  const commit_fee = await calculateTxBytesFee(
    commit_psbt.txInputs.length,
    commit_psbt.txOutputs.length, // already taken care of the exchange output bytes calculation
    "70.0",
  );

  const commit_totalOutput = commit_psbt.txOutputs.reduce(
    (partialSum, a) => partialSum + a.value,
    0,
  );
  const commit_changeValue = commit_totalInput - commit_totalOutput - commit_fee;

  if (commit_changeValue < 0) {
    throw `Your wallet address doesn't have enough funds to buy this inscription.`
  }

  // Change utxo
  if (commit_changeValue > 600) {
    commit_psbt.addOutput({
      address: treasuryAddress,
      value: commit_changeValue,
    });
  }

  const signedCommitPsbt = await commit_psbt.signAllInputs(keyPair);

  signedCommitPsbt.finalizeAllInputs();
  let finalizedCommitPSBT = signedCommitPsbt.extractTransaction();
  const resCommitTxId = await fetch('https://blockstream.info/api/tx', {
    method: 'POST',
    body: finalizedCommitPSBT.toHex()
  });

  const commitTxId = await resCommitTxId.text();

  // let commitUtxoResult = await axios.post("https://sparkling-warmhearted-isle.btc.quiknode.pro/7849017420eb0309e9be10a88e02f03d77aa5a00/", {
  // 	"method": "getrawtransaction",
  // 	"params": [
  // 		commitTxId,
  // 		0
  // 	]
  // }, { headers: { "Content-Type": "application/json" } });

  let commitUtxoResult = await getTxHex(commitTxId);
  console.log(commitUtxoResult);
  const commitTx = bitcoin.Transaction.fromHex(
    commitUtxoResult
  );

  const scriptPubKey = bitcoin.address.toOutputScript(commitAddress, network);
  const commitUtxoIndex = commitTx.outs.findIndex(out => out.script.equals(scriptPubKey));

  const commitTxResult = {
    tx: commitTx,
    outputIndex: commitUtxoIndex,
    outputAmount: commitTxAmount,
  };

  const revealPsbt = createRevealTx(
    network,
    commitTxData,
    commitTxResult,
    toAddress,
    546,
  );

  const signedRevealPsbt = await revealPsbt.signInput(0, keyPair);

  signedRevealPsbt.finalizeInput(0, customFinalizer(commitTxData));
  let finalizedPSBT = signedRevealPsbt.extractTransaction();
  const res = await fetch('https://blockstream.info/api/tx', {
    method: 'POST',
    body: finalizedPSBT.toHex()
  });

  let revealTxid = await res.text();

  //PSBT for Sending TransferTX
  const transfer_psbt = new bitcoin.Psbt({ network });

  let transfer_totalInput = 0;

  let revealTxResult = await getTxHex(revealTxid);
  const revealTx = bitcoin.Transaction.fromHex(revealTxResult);

  // No need to add this witness if the seller is using taproot
  for (const output in revealTx.outs) {
    try {
      revealTx.setWitness(parseInt(output), []);
    } catch { }
  }

  const transfer_input = {
    hash: revealTxid,
    index: 0,
    nonWitnessUtxo: revealTx.toBuffer(),
    // No problem in always adding a witnessUtxo here
    witnessUtxo: revealTx.outs[0],
  };

  transfer_psbt.addInput(transfer_input);

  transfer_totalInput += 546;

  transfer_psbt.addOutput({
    address: withdrawAddress,
    value: 546,
  });

  for (const utxo of transfer_paymentUTXOs) {
    const input = {
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: utxo.tx.toBuffer(),
    };

    const p2shInputWitnessUTXOUn = {};
    const p2shInputRedeemScriptUn = {};

    if (isP2SHAddress(treasuryAddress, network)) {
      const redeemScript = bitcoin.payments.p2wpkh({
        pubkey: publicKey,
      }).output;
      const p2sh = bitcoin.payments.p2sh({
        redeem: { output: redeemScript },
      });
      p2shInputWitnessUTXOUn.witnessUtxo = {
        script: p2sh.output,
        value: utxo.value,
      };
      p2shInputRedeemScriptUn.redeemScript = p2sh.redeem?.output;
    }

    transfer_psbt.addInput({
      ...input,
      ...p2shInputWitnessUTXOUn,
      ...p2shInputRedeemScriptUn,
    });

    transfer_totalInput += utxo.value;
  }

  const transfer_fee = await calculateTxBytesFee(
    transfer_psbt.txInputs.length,
    transfer_psbt.txOutputs.length, // already taken care of the exchange output bytes calculation
    "70.0",
  );

  const transfer_totalOutput = transfer_psbt.txOutputs.reduce(
    (partialSum, a) => partialSum + a.value,
    0,
  );
  const transfer_changeValue = transfer_totalInput - transfer_totalOutput - transfer_fee;

  if (transfer_changeValue < 0) {
    throw `Your wallet address doesn't have enough funds to buy this inscription.`
  }

  // Change utxo
  if (transfer_changeValue > 600) {
    transfer_psbt.addOutput({
      address: treasuryAddress,
      value: transfer_changeValue,
    });
  }

  const signedTransferPsbt = await transfer_psbt.signAllInputs(keyPair);

  signedTransferPsbt.finalizeAllInputs();
  let finalizedTransferPSBT = signedTransferPsbt.extractTransaction();
  const resTransferTxId = await fetch('https://blockstream.info/api/tx', {
    method: 'POST',
    body: finalizedTransferPSBT.toHex()
  });

  const transferTxId = await resTransferTxId.text();
  ///////////////////////////////////////////////////////////////////////////////////
  return transferTxId;
}
module.exports = {
  checkConfirmation,
  analyze,
  analyzeForWithdraw,
  withdrawARC
}
