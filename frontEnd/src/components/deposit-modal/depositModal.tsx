import { DepositBTC, DepositARC, WithdrawARC } from "@/api/deposit";
import { GetExchangeAddress } from "@/api/exchange";
import { GetrecentFlickers } from "@/api/recent-flickers";
import { useQuery } from "@tanstack/react-query";
import { FC, useState, useEffect } from "react";
import GetCookie from "@/hooks/cookies/getCookie";
import { sendBtcTransaction } from "sats-connect";
import { enqueueSnackbar } from "notistack";
import Modal from "../modal/modal";
import { playButtonAudio } from "@/sound";
import OutsideClickDetector from "../outsideClickDetector/index";
import axios from "axios";
import * as retry from "async-retry";
import * as bitcoin from "bitcoinjs-lib";

interface DepositModalProps {
  show: boolean;
  handleModal: () => void;
}

const encoder = new TextEncoder();

// individual data pushes may not be larger than 520 bytes
const MAX_CHUNK_SIZE = 520;

interface Inscription {
  // MIME type
  contentType: Buffer;
  content: Buffer;
}

/**
 * Create a basic text inscription.
 */
function createTextInscription(text: string): Inscription {
  return createInscription(
    "text/plain;charset=utf-8",
    Buffer.from(encoder.encode(text))
  );
}

/**
 * Create an inscription.
 */
function createInscription(contentType: string, content: Buffer): Inscription {
  return {
    // e.g. `image/png`
    contentType: Buffer.from(encoder.encode(contentType)),
    content,
  };
}

function chunkContent(data: Buffer) {
  const body: Buffer[] = [];
  let start = 0;
  while (start < data.length) {
    body.push(data.subarray(start, start + MAX_CHUNK_SIZE));
    start += MAX_CHUNK_SIZE;
  }
  return body;
}

function createInscriptionScript(
  xOnlyPublicKey: Buffer,
  inscription: Inscription
) {
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

interface CommitTxData {
  scriptTaproot: bitcoin.payments.Payment;
  tapLeafScript: {
    leafVersion: number;
    script: Buffer;
    controlBlock: Buffer;
  };
}

function toXOnly(pubkey: Buffer) {
  return pubkey.subarray(1, 33);
}

/**
 * Create the commit tx of the input public key and inscription data.
 * @dev Requires caller to initialize ECC lib.
 */
async function createCommitTxData(
  network: bitcoin.Network,
  publicKey: Buffer,
  inscription: Inscription
): Promise<CommitTxData> {
  const xOnlyPublicKey = toXOnly(publicKey);
  const script = createInscriptionScript(xOnlyPublicKey, inscription);
  const ecc = await import("tiny-secp256k1");

  bitcoin.initEccLib(ecc);

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

  const cblock: any = scriptTaproot.witness?.[scriptTaproot.witness.length - 1];

  const tapLeafScript = {
    leafVersion: scriptTaproot.redeemVersion!,
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

interface CommitTxResult {
  tx: bitcoin.Transaction;
  outputIndex: number;
  outputAmount: number;
}

/**
 * Create the reveal tx which spends the commit tx.
 */
function createRevealTx(
  network: bitcoin.Network,
  commitTxData: CommitTxData,
  commitTxResult: CommitTxResult,
  toAddress: string,
  amount: number
) {
  const { scriptTaproot, tapLeafScript } = commitTxData;

  const psbt = new bitcoin.Psbt({ network });

  psbt.addInput({
    hash: commitTxResult.tx.getId(),
    index: commitTxResult.outputIndex,
    witnessUtxo: {
      value: commitTxResult.outputAmount,
      script: scriptTaproot.output!,
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

const customFinalizer = (commitTxData: CommitTxData) => {
  const { tapLeafScript } = commitTxData;

  return (inputIndex: number, input: any) => {
    const witness = [input.tapScriptSig[inputIndex].signature]
      .concat(tapLeafScript.script)
      .concat(tapLeafScript.controlBlock);

    return {
      finalScriptWitness: witnessStackToScriptWitness(witness),
    };
  };
};

class DummySigner implements bitcoin.Signer {
  publicKey: Buffer;
  constructor(publicKey: Buffer) {
    this.publicKey = publicKey;
  }
  sign(_hash: Buffer, _lowR?: boolean | undefined): Buffer {
    // https://github.com/bitcoin/bitcoin/blob/607d5a46aa0f5053d8643a3e2c31a69bfdeb6e9f/src/script/sign.cpp#L611
    return Buffer.alloc(64, 0);
  }
  signSchnorr(hash: Buffer): Buffer {
    // https://github.com/bitcoin/bitcoin/blob/607d5a46aa0f5053d8643a3e2c31a69bfdeb6e9f/src/script/sign.cpp#L626
    return Buffer.alloc(64, 0);
  }
}

function estimateTxSize(
  network: bitcoin.Network,
  publicKey: Buffer,
  commitTxData: CommitTxData,
  toAddress: string,
  amount: number
) {
  const psbt = new bitcoin.Psbt({ network });

  const { scriptTaproot, tapLeafScript } = commitTxData;
  psbt.addInput({
    hash: Buffer.alloc(32, 0),
    index: 0,
    witnessUtxo: {
      value: amount,
      script: scriptTaproot.output!,
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

const DepositModal: FC<DepositModalProps> = ({ show, handleModal }) => {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("SATS");
  const [showDropDown, setShowDropDown] = useState(false);
  const changeAmount = (value: string) => {
    setAmount(value);
  };

  const handleUnisatDepositTransaction = async () => {
    const depositAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);
    let res = await GetExchangeAddress();
    let accountAddress = res.data.data;
    let walletAddresses = await (window as any).unisat.getAccounts();
    let walletPublicKey = await (window as any).unisat.getPublicKey();
    if (amount != "") {
      console.log(unit);
      if (unit == "SATS") {
        // @ts-ignore
        if (depositAmount < 1000) {
          enqueueSnackbar("Less amount", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
          return;
        }
        try {
          // @ts-ignore
          let txid = await window.unisat.sendBitcoin(
            accountAddress,
            depositAmount
          );
          if (txid) {
            // DepositBTC(false, txid);
            let result = await DepositBTC(txid, accountAddress);
            if (result?.status == 202) {
              enqueueSnackbar("Transaction Success", {
                variant: "success",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
              handleModal();
            } else {
              enqueueSnackbar("Transaction Failure", {
                variant: "error",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
            }
          }
        } catch (e) {
          enqueueSnackbar("Dismissed", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      } else if (unit == "ΛRC") {
        // @ts-ignore
        if (depositAmount < 10) {
          enqueueSnackbar("Less amount", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
          return;
        }
        try {
          const network = bitcoin.networks.bitcoin;

          const publicKey = Buffer.from(walletPublicKey, "hex");
          const getTxHex = async (txId: string) => {
            return await retry(
              async (bail: any) => {
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
          };

          const getAddressUtxos = async (address: any) => {
            return await retry(
              async (bail: any) => {
                const utxoResult = await axios.get(
                  `https://open-api.unisat.io/v1/indexer/address/${address}/utxo-data`,
                  {
                    headers: {
                      Authorization: `Bearer ad863fd45eb93c01a31d364cb5f9165bfcdf4d84873155eec5ed39169a789016`,
                    },
                  }
                );

                console.log(utxoResult);
                if (
                  utxoResult.status == 200 &&
                  utxoResult.data &&
                  utxoResult.data.data &&
                  utxoResult.data.data.utxo
                ) {
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
          };

          const mapUtxos = async (utxosFromMempool: any) => {
            const ret = [];
            if (utxosFromMempool.length > 0) {
              for (const utxoFromMempool of utxosFromMempool) {
                ret.push({
                  txid: utxoFromMempool.txid,
                  vout: utxoFromMempool.vout,
                  value: utxoFromMempool.satoshi,
                  tx: bitcoin.Transaction.fromHex(
                    await getTxHex(utxoFromMempool.txid)
                  ),
                });
              }
            }
            return ret;
          };

          const isP2SHAddress = (
            address: string,
            network: bitcoin.Network
          ): boolean => {
            try {
              const { version, hash } =
                bitcoin.address.fromBase58Check(address);
              return version === network.scriptHash && hash.length === 20;
            } catch (error) {
              return false;
            }
          };

          const calculateTxBytesFee = async (
            vinsLength: number,
            voutsLength: number,
            feeRateTier: string,
            includeChangeOutput: 0 | 1 = 1
          ) => {
            return calculateTxBytesFeeWithRate(
              vinsLength,
              voutsLength,
              70.0,
              includeChangeOutput
            );
          };

          const calculateTxBytesFeeWithRate = async (
            vinsLength: number,
            voutsLength: number,
            feeRate: number,
            includeChangeOutput: 0 | 1 = 1
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
          };

          let inscribeTxid = undefined;
          const utxoResult = await axios.get(
            `https://open-api.unisat.io/v1/indexer/address/${walletAddresses[0]}/brc20/ACD3/info`,
            {
              headers: {
                Authorization: `Bearer ad863fd45eb93c01a31d364cb5f9165bfcdf4d84873155eec5ed39169a789016`,
              },
            }
          );

          console.log(utxoResult);
          if (
            utxoResult.status == 200 &&
            utxoResult.data &&
            utxoResult.data.data &&
            utxoResult.data.data.transferableInscriptions
          ) {
            for (let info in utxoResult.data.data.transferableInscriptions) {
              if (info.confirmations != 0 && info.data.amt == amount) {
                inscribeTxid = info.inscriptionId.slice(0, -2);
                break;
              }
            }
          }

          if (inscribeTxid == undefined) {
            const toAddress = walletAddresses[0];
            const inscription = createTextInscription(
              `{"p":"brc-20","op":"transfer","tick":"ACD3","amt":"${amount}"}`
            );
            const commitTxData = await createCommitTxData(
              network,
              publicKey,
              inscription
            );

            const revealTxSize = estimateTxSize(
              network,
              publicKey,
              commitTxData,
              toAddress,
              546
            );

            const revealFee = revealTxSize * 70.0;
            const commitTxAmount = revealFee + 546;

            const commitAddress = commitTxData.scriptTaproot.address!;
            console.log(
              "Built Inscription Data. Now sending btc for commit Tx to taproot address:",
              commitAddress
            );
            const commitTxId = await window.unisat.sendBitcoin(
              commitAddress,
              commitTxAmount
            );
            console.log("Commit Tx done and txid is :", commitTxId);
            console.log("Now trying to fetching the commit tx data");

            // let commitUtxoResult = await axios.post("https://sparkling-warmhearted-isle.btc.quiknode.pro/7849017420eb0309e9be10a88e02f03d77aa5a00/", {
            // 	"method": "getrawtransaction",
            // 	"params": [
            // 		commitTxId,
            // 		0
            // 	]
            // }, { headers: { "Content-Type": "application/json" } });

            let commitUtxoResult = await getTxHex(commitTxId);
            console.log("Commit Tx Data Fetched :", commitUtxoResult);
            const commitTx = bitcoin.Transaction.fromHex(commitUtxoResult);

            const scriptPubKey = bitcoin.address.toOutputScript(
              commitAddress,
              network
            );
            const commitUtxoIndex = commitTx.outs.findIndex((out) =>
              out.script.equals(scriptPubKey)
            );

            const commitTxResult = {
              tx: commitTx,
              outputIndex: commitUtxoIndex,
              outputAmount: commitTxAmount,
            };

            console.log("Now Creating Revealing Tx Data");
            const revealPsbt = createRevealTx(
              network,
              commitTxData,
              commitTxResult,
              toAddress,
              546
            );

            console.log("Now signing to Revealing PSBT");
            const signedRevealPsbt = bitcoin.Psbt.fromHex(
              await window.unisat.signPsbt(revealPsbt.toHex(), {
                autoFinalized: false,
                toSignInputs: [
                  {
                    index: 0,
                    publicKey: walletPublicKey,
                    disableTweakSigner: true,
                  },
                ],
              })
            );
            console.log("Finalizing Input for PSBT");
            signedRevealPsbt.finalizeInput(0, customFinalizer(commitTxData));
            let finalizedPSBT = signedRevealPsbt.extractTransaction();
            console.log("Now sending PSBT to BTC network");
            const res = await fetch("https://blockstream.info/api/tx", {
              method: "POST",
              body: finalizedPSBT.toHex(),
            });

            inscribeTxid = await res.text();
            console.log("PSBT done and tx id:", inscribeTxid);
          }
          console.log("Temperary- trying to fetch revealing tx data");
          let revealingTxData = await getTxHex(inscribeTxid);
          console.log("Revealing Tx Data Fetched :", revealingTxData);

          const getInscription = async (txid) => {
            return await retry(
              async (bail) => {
                let inscriptionResult = await (
                  window as any
                ).unisat.getInscriptions();
                if (
                  inscriptionResult.list &&
                  inscriptionResult.list.length > 0
                ) {
                  for (let inscription of inscriptionResult.list) {
                    if (inscription.genesisTransaction == txid) {
                      return inscription.inscriptionId;
                    }
                  }
                }
                throw "Retrying to check Inscription";
              },
              {
                retries: 20,
                minTimeout: 2000,
                maxTimeout: 5000,
              }
            );
          };
          let inscriptionId = await getInscription(inscribeTxid);
          console.log("Now trying to send inscription");

          const txid = await (window as any).unisat.sendInscription(
            accountAddress,
            inscriptionId,
            { feeRate: 70 }
          );
          ///////////////////////////////////////////////////////////////////////////////////
          console.log("Transfering Brc-20 done");
          if (txid) {
            // DepositBTC(false, txid);
            let result = await DepositARC(txid, accountAddress);
            if (result?.status == 202) {
              enqueueSnackbar("Transaction Success", {
                variant: "success",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
              handleModal();
            } else {
              enqueueSnackbar("Transaction Failure", {
                variant: "error",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
            }
          }

          // let all_utxos_mempool = await getAddressUtxos(walletAddresses[0]);
          // let all_utxos = await mapUtxos(all_utxos_mempool);

          // let transfer_paymentUTXOs = [];
          // let transfer_sum = 0;
          // for (const utxo of all_utxos) {
          // 	transfer_sum += utxo.value;
          // 	transfer_paymentUTXOs.push(utxo);
          // 	if (transfer_sum > (546 + 36000)) {
          // 		break;
          // 	}
          // }

          // if ((transfer_sum <= (546 + 36000))) {
          // 	enqueueSnackbar('Does not have enough UTXO', { variant: 'error', anchorOrigin: { horizontal: 'left', vertical: 'top' } });
          // } else {
          // 	//PSBT for Sending TransferTX
          // 	const transfer_psbt = new bitcoin.Psbt({ network });

          // 	let transfer_totalInput = 0;

          // 	let revealTxResult = await getTxHex(inscribeTxid);
          // 	const revealTx = bitcoin.Transaction.fromHex(revealTxResult);
          // 	console.log(revealTx);

          // 	// No need to add this witness if the seller is using taproot
          // 	// for (const output in revealTx.outs) {
          // 	// 	try {
          // 	// 		revealTx.setWitness(parseInt(output), []);
          // 	// 	} catch { }
          // 	// }

          // 	const transfer_input = {
          // 		hash: inscribeTxid,
          // 		index: 0,
          // 		nonWitnessUtxo: revealTx.toBuffer(),
          // 		// No problem in always adding a witnessUtxo here
          // 		witnessUtxo: revealTx.outs[0],
          // 	};

          // 	transfer_input.tapInternalKey = toXOnly(revealTx.toBuffer().constructor(walletPublicKey, 'hex'));

          // 	transfer_psbt.addInput(transfer_input);

          // 	transfer_totalInput += 546;

          // 	transfer_psbt.addOutput({
          // 		address: accountAddress,
          // 		value: 546,
          // 	});

          // 	for (const utxo of transfer_paymentUTXOs) {
          // 		const input = {
          // 			hash: utxo.txid,
          // 			index: utxo.vout,
          // 			nonWitnessUtxo: utxo.tx.toBuffer(),
          // 		};

          // 		const p2shInputWitnessUTXOUn: any = {};
          // 		const p2shInputRedeemScriptUn: any = {};

          // 		if (isP2SHAddress(walletAddresses[0], network)) {
          // 			const redeemScript = bitcoin.payments.p2wpkh({
          // 				pubkey: publicKey,
          // 			}).output;
          // 			const p2sh = bitcoin.payments.p2sh({
          // 				redeem: { output: redeemScript },
          // 			});
          // 			p2shInputWitnessUTXOUn.witnessUtxo = {
          // 				script: p2sh.output,
          // 				value: utxo.value,
          // 			};
          // 			p2shInputRedeemScriptUn.redeemScript = p2sh.redeem?.output;
          // 		}

          // 		transfer_psbt.addInput({
          // 			...input,
          // 			...p2shInputWitnessUTXOUn,
          // 			...p2shInputRedeemScriptUn,
          // 		});

          // 		transfer_totalInput += utxo.value;
          // 	}

          // 	const transfer_fee = await calculateTxBytesFee(
          // 		transfer_psbt.txInputs.length,
          // 		transfer_psbt.txOutputs.length, // already taken care of the exchange output bytes calculation
          // 		"70.0",
          // 	);

          // 	const transfer_totalOutput = transfer_psbt.txOutputs.reduce(
          // 		(partialSum, a) => partialSum + a.value,
          // 		0,
          // 	);

          // 	console.log(transfer_totalInput, transfer_totalOutput, transfer_fee);
          // 	const transfer_changeValue = transfer_totalInput - transfer_totalOutput - transfer_fee;

          // 	if (transfer_changeValue < 0) {
          // 		throw `Your wallet address doesn't have enough funds to buy this inscription.`
          // 	}

          // 	// Change utxo
          // 	if (transfer_changeValue > 600) {
          // 		transfer_psbt.addOutput({
          // 			address: walletAddresses[0],
          // 			value: transfer_changeValue,
          // 		});
          // 	}

          // 	const signedTransferPsbt = bitcoin.Psbt.fromHex(await window.unisat.signPsbt(transfer_psbt.toHex()));

          // 	signedTransferPsbt.finalizeAllInputs();
          // 	let finalizedTransferPSBT = signedTransferPsbt.extractTransaction();
          // 	const resTransferTxId = await fetch('https://blockstream.info/api/tx', {
          // 		method: 'POST',
          // 		body: finalizedTransferPSBT.toHex()
          // 	});

          // 	const txid = await resTransferTxId.text();
          // 	///////////////////////////////////////////////////////////////////////////////////
          // 	console.log("Transfering Brc-20 done");
          // 	if (txid) {
          // 		// DepositBTC(false, txid);
          // 		let result = await DepositARC(txid, accountAddress);
          // 		if (result?.status == 202) {
          // 			enqueueSnackbar('Transaction Success', { variant: 'success', anchorOrigin: { horizontal: 'left', vertical: 'top' } })
          // 			handleModal();
          // 		} else {
          // 			enqueueSnackbar('Transaction Failure', { variant: 'error', anchorOrigin: { horizontal: 'left', vertical: 'top' } });
          // 		}
          // 	}
          // }
        } catch (e) {
          console.log(e);
          enqueueSnackbar("Dismissed", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      }
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  const handleXverseDepositTransaction = async () => {
    const depositAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);
    let res = await GetExchangeAddress();
    let accountAddress = res.data.data;
    const senderAddress = GetCookie("address");
    if (senderAddress != "" && amount != "") {
      // @ts-ignore
      if (depositAmount < 1000) {
        enqueueSnackbar("Less amount", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
        return;
      }
      const sendBtcOptions = {
        payload: {
          network: {
            type: "mainnet",
          },
          recipients: [
            {
              address: accountAddress,
              amountSats: depositAmount,
            },
          ],
          senderAddress: accountAddress,
        },
        onFinish: async (response: any) => {
          let result = await DepositBTC(response?.txId, accountAddress);
          if (result?.status == 202) {
            enqueueSnackbar("Transaction Success", {
              variant: "success",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
            handleModal();
          } else {
            enqueueSnackbar("Transaction Failure", {
              variant: "error",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
          }
        },
        onCancel: () =>
          enqueueSnackbar("Dismissed", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          }),
      };
      // @ts-ignore
      await sendBtcTransaction(sendBtcOptions);
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  const handleLeatherDepositTransaction = async () => {
    const depositAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);

    // get wallet from /exchange/generate_address with payload userId
    let res = await GetExchangeAddress();
    let accountAddress = res.data.data;
    // --- end ---
    // const accountAddress = 'bc1pdlee90dye598q502hytgm5nnyxjt46rz9egkfurl5ggyqgx49cssjusy3k';
    if (amount != "") {
      // @ts-ignore
      if (depositAmount < 1000) {
        enqueueSnackbar("Less amount", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
        return;
      }
      try {
        // @ts-ignore
        const resp = await window.btc?.request("sendTransfer", {
          address: accountAddress,
          amount: depositAmount,
        });

        if (resp.result.txid) {
          let result = await DepositBTC(resp.result.txid, accountAddress);
          if (result?.status == 202) {
            enqueueSnackbar("Transaction Success", {
              variant: "success",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
            handleModal();
          } else {
            enqueueSnackbar("Transaction Failure", {
              variant: "error",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
          }
        }
      } catch (e) {
        console.log(e);
        enqueueSnackbar("Dismissed", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
      }
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  const handleUnisatWithdrawTransaction = async () => {
    const withdrawAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);
    let res = await GetExchangeAddress(false);
    let accountAddress = res.data.data;
    let walletAddresses = await (window as any).unisat.getAccounts();
    if (amount != "") {
      console.log(unit);
      if (unit == "SATS") {
        enqueueSnackbar("Only ΛRC can be withdrawn", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
        return;
      } else if (unit == "ΛRC") {
        // @ts-ignore
        if (withdrawAmount < 1000) {
          enqueueSnackbar("Less amount", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
          return;
        }
        try {
          let txid = await (window as any).sendBitcoin(accountAddress, 22000);
          if (txid) {
            // DepositBTC(false, txid);
            let result = await WithdrawARC(
              txid,
              accountAddress,
              walletAddresses[0],
              withdrawAmount
            );
            if (result?.status == 202) {
              enqueueSnackbar("Transaction Success", {
                variant: "success",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
              handleModal();
            } else {
              enqueueSnackbar("Transaction Failure", {
                variant: "error",
                anchorOrigin: { horizontal: "left", vertical: "top" },
              });
            }
          }
        } catch (e) {
          console.log(e);
          enqueueSnackbar("Dismissed", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      }
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  const handleXverseWithdrawTransaction = async () => {
    const depositAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);
    let res = await GetExchangeAddress();
    let accountAddress = res.data.data;
    const senderAddress = GetCookie("address");
    if (senderAddress != "" && amount != "") {
      // @ts-ignore
      if (depositAmount < 1000) {
        enqueueSnackbar("Less amount", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
        return;
      }
      const sendBtcOptions = {
        payload: {
          network: {
            type: "mainnet",
          },
          recipients: [
            {
              address: accountAddress,
              amountSats: depositAmount,
            },
          ],
          senderAddress: accountAddress,
        },
        onFinish: async (response: any) => {
          let result = await DepositBTC(response?.txId, accountAddress);
          if (result?.status == 202) {
            enqueueSnackbar("Transaction Success", {
              variant: "success",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
            handleModal();
          } else {
            enqueueSnackbar("Transaction Failure", {
              variant: "error",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
          }
        },
        onCancel: () =>
          enqueueSnackbar("Dismissed", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          }),
      };
      // @ts-ignore
      await sendBtcTransaction(sendBtcOptions);
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  const handleLeatherWithdrawTransaction = async () => {
    const depositAmount = amount.includes(".")
      ? parseFloat(amount)
      : parseInt(amount);

    // get wallet from /exchange/generate_address with payload userId
    let res = await GetExchangeAddress();
    let accountAddress = res.data.data;
    // --- end ---
    // const accountAddress = 'bc1pdlee90dye598q502hytgm5nnyxjt46rz9egkfurl5ggyqgx49cssjusy3k';
    if (amount != "") {
      // @ts-ignore
      if (depositAmount < 1000) {
        enqueueSnackbar("Less amount", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
        return;
      }
      try {
        // @ts-ignore
        const resp = await window.btc?.request("sendTransfer", {
          address: accountAddress,
          amount: depositAmount,
        });

        if (resp.result.txid) {
          let result = await DepositBTC(resp.result.txid, accountAddress);
          if (result?.status == 202) {
            enqueueSnackbar("Transaction Success", {
              variant: "success",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
            handleModal();
          } else {
            enqueueSnackbar("Transaction Failure", {
              variant: "error",
              anchorOrigin: { horizontal: "left", vertical: "top" },
            });
          }
        }
      } catch (e) {
        console.log(e);
        enqueueSnackbar("Dismissed", {
          variant: "error",
          anchorOrigin: { horizontal: "left", vertical: "top" },
        });
      }
    } else {
      enqueueSnackbar("Wallet address missing", {
        variant: "error",
        anchorOrigin: { horizontal: "left", vertical: "top" },
      });
    }
  };

  return (
    <Modal customClass={"deposit-modal"} show={show} handleModal={handleModal}>
      <div className="deposit">
        <div className="title">Deposit/Withdraw</div>
        <img src="/static/svgs/close.svg" onClick={handleModal} />
        <div className="content">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              changeAmount(e.target.value);
            }}
          />
          <div className="coin-box">
            <div
              className="coin-box-display"
              onClick={() => {
                setShowDropDown(!showDropDown);
              }}
            >
              <div>{unit}</div>
              <img src="/static/svgs/arrow-down.svg" />
            </div>
            {showDropDown && (
              <OutsideClickDetector
                onOutsideClick={() => {
                  setShowDropDown(!showDropDown);
                }}
              >
                <div className="coin-box-content">
                  <div
                    className="item"
                    onClick={() => {
                      setUnit("SATS");
                      setShowDropDown(!showDropDown);
                    }}
                  >
                    SATS
                  </div>
                  <div
                    className="item"
                    onClick={() => {
                      setUnit("ΛRC");
                      setShowDropDown(!showDropDown);
                    }}
                  >
                    ΛRC
                  </div>
                </div>
              </OutsideClickDetector>
            )}
          </div>
        </div>
        <button
          className="btn-outline text-center"
          onClick={() => {
            playButtonAudio();
            const wallet = GetCookie("wallet");
            wallet == "unisat"
              ? handleUnisatDepositTransaction()
              : wallet == "xverse"
              ? handleXverseDepositTransaction()
              : handleLeatherDepositTransaction();
          }}
          disabled={amount == "" ? true : false}
        >
          Deposit
        </button>
        <button
          className="btn-outline text-center"
          onClick={() => {
            playButtonAudio();
            const wallet = GetCookie("wallet");
            wallet == "unisat"
              ? handleUnisatWithdrawTransaction()
              : wallet == "xverse"
              ? handleXverseWithdrawTransaction()
              : handleLeatherWithdrawTransaction();
          }}
          disabled={unit != "ΛRC" || amount == "" ? true : false}
        >
          Withdraw (Fee: 22000 Sats)
        </button>
      </div>
    </Modal>
  );
};

export default DepositModal;
