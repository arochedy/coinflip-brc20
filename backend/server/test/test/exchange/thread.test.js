const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const db = require("../../utils/database/db");
const { updateConfirming } = require("../../api/utils/thread");
const { generateSignatures } = require('../../utils/encryptionUtilities')

let userId;
let userId1;

describe("Thread to complete pending transactions", () => {
    before(async () => {
        const { userPublicKey } = generateSignatures()
        userId = await db.userInsertion(userPublicKey, "Lucas");
        await db.insertInitialBalance(userId);

        await db.updateBalance(userId, 0, 15);

        await db.insertBRC20DepositTransaction(
            userId,
            "dbd2c046887ee3a2c82ec97bd123a06df4c3ef9a119a5a3cfa62261e327eb5cc",
            "BRC20"
        );

        await db.insertBRC20DepositTransaction(
            userId,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BRC20"
        )

        await db.insertBRC20DepositTransaction(
            userId,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5fff",
            "BRC20"
        );

        userId1 = await db.userInsertion("bc1q9n0a30prscmzkt4t42dehzghmqwkghhngxlg8e", "LLL");
        await db.insertBRC20DepositTransaction(
            userId,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BTC"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "4a9ba84e45ee948f786dedd57832712c301c5399d1a291877cc6dee2326e7a78",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "a81e86fab8bd2ec8983fadbdf471176d0713d61abdbec47c71fb89f6d5535c5e",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "5386abfe00c6a509071527b8a47f91b6de24462dc7852751a10d0de330cf091f",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BRC20"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "5386abfe00c6a509071527b8a47f91b6de24462dc7852751a10d0de330cf091f",
            "BTC"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "0154497eee1be788458bcdb2e48af2063116f043aca3bef7b20e7437a89b5f79",
            "BTC"
        );
        await db.insertConfirmedTransaction(
            userId1,
            "45aeadfd079c1d17d5e5c9adc342b80f7fbc5df58e8cc2c942f7e4c6a70fd518",
            "BTC"
        );
    });

    it("updateConfirming", async () => {
        await updateConfirming();
    });
});
