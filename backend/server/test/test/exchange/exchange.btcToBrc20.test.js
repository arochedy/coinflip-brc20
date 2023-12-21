const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')


let server;
let userId

describe('Exchange BTC to BRC20', () => {
    before(async () => {
        await db.truncateTables()
        const app = await main();
        server = app.listen(3001);
        const { userPublicKey } = generateSignatures()
        userId = await db.userInsertion(userPublicKey, "Lucas")
        await db.insertInitialBalance(userId)
        await db.updateBalance(userId, 0.1, 0)
    });

    after(async() => {
        await db.truncateTables()
        server.close();
    });

    var res
    describe('Exchange BTC to BRC20 with valid request', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/btc_to_brc')
                .send({
                    userId: userId,
                    amount: 0.01
                });
        });

        it('Should return 200 for a successful exchange', async () => {
            expect(res).to.have.status(200);
        });

        it('Should return the correct success message', () => {
            expect(res.body.data).to.eql('OK');
        });
    });

    describe('Attempt to exchange with insufficient BTC balance', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/btc_to_brc')
                .send({
                    userId: userId,
                    amount: 0.2
                });
        });

        it('Insufficient BTC balance.', async () => {
            expect(res).to.have.status(400);
        });

        it('Insufficient BTC balance.', () => {
            expect(res.body.data).to.eql('Insufficient BTC balance.');
        });
    });
})


