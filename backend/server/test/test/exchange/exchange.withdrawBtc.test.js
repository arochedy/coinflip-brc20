const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')


let server;
let userId

describe('Widrawh BTC', () => {
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
    describe('BTC withdrawn successfully', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/withdraw_btc')
                .send({
                    userId: userId,
                    amount: 0.01
                });
        });

        // This following commnets related with the real action for sending bitcoin. This test will always return 400 and sending error since we can't send real btc. 
        // it('BTC withdrawn successfully', async () => {
        //     expect(res).to.have.status(200);
        // });

        // it('BTC withdrawn successfully', () => {
        //     expect(res.body.data).to.eql('BTC withdrawn successfully');
        // });

        it('BTC sending error', async () => {
            expect(res).to.have.status(400);
        });

        it('BTC sending error', () => {
            expect(res.body.data).to.eql('BTC sending error');
        });

        it('BTC sending error', () => {
            expect(res.body.data).to.eql('BTC sending error');
        });
    });

    describe('Insufficient BTC balance.', () => {
        before(async () => {
            res = await chai
                .request(server)
                .post('/exchange/withdraw_btc')
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


