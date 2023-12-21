const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')

let server;
let userId

describe('Exchange BRC20 to BTC', () => {
    before(async () => {
        const app = await main();
        server = app.listen(3001);
        const { userPublicKey } = generateSignatures()
        userId = await db.userInsertion(userPublicKey, "Lucas")
        await db.insertInitialBalance(userId)
        await db.updateBalance(userId, 0, 15)
    });

    after(() => {
        server.close();
    });

    var res
    describe('BRC20 exchanged for BTC successfully', () => {
        before(async () => {
            const payload = {
                userId: userId,
                amount: 10
            };
            res = await chai
                .request(server)
                .post('/exchange/brc_to_btc')
                .send(payload);
        });

        it('Should return 200 for a successful exchange', async () => {
            expect(res).to.have.status(200);
        });

        it('Should return the correct success message', () => {
            expect(res.body.data).to.eql('OK');
        });
    });

    describe('Attempt to exchange with insufficient BRC20 balance', () => {
        before(async () => {
            const payload = {
                userId: userId,
                amount: 50
            };
            res = await chai
                .request(server)
                .post('/exchange/brc_to_btc')
                .send(payload);
        });

        it('Should return 400 for insufficient balance', async () => {
            expect(res).to.have.status(400);
        });

        it('Should return the correct error message', () => {
            expect(res.body.data).to.eql('Insufficient BRC20 balance.');
        });
    });
})


