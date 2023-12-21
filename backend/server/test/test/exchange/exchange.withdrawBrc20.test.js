const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')

let server;
let userId

describe('Withdraw BRC20', () => {
    before(async () => {
        const app = await main();
        server = app.listen(3001);
        const { userPublicKey } = generateSignatures()
        userId = await db.userInsertion(userPublicKey, "Lucas")
        await db.insertInitialBalance(userId)
        await db.updateBalance(userId, 0.1, 1000)
    });

    after(() => {
        server.close();
    });

    var res
    describe('Withdraw success', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/withdraw_brc')
                .send({
                    userId: userId,
                    amount: 100.0
                });
        });

        it('Withdraw requested', async () => {
            expect(res).to.have.status(200);
        });

        it('Withdraw requested', () => {
            expect(res.body.data).to.eql('OK');
        });
    });
    
    describe('Insufficient BRC balance', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/withdraw_brc')
                .send({
                    userId: userId,
                    amount: 2000.0
                });
        });

        it('Invalid request data', async () => {
            expect(res).to.have.status(400);
        });

        it('Invalid request data', () => {
            expect(res.body.data).to.eql('Insufficient BRC balance.');
        });
    });
})


