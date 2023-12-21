const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')

let server;
let userId;

describe('Deposit BRC20', () => {
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
    describe('Deposit BRC20', () => {
        before(async () => {
            // This is a random transaction Id to check if it is saved in the database successfully
            const transactionId = 'e6aa60e17ba96d400a888b0d3c41984e5cfd157a191b083573513040387342b7'
            res = await chai
                .request(server)
                .post('/exchange/deposit_brc')
                .send({
                    userId: userId,
                    transactionId: transactionId
                });
        });

        it('Checking transaction status', async () => {
            expect(res).to.have.status(202);
        });

        it('Checking transaction data', () => {
            expect(res.body.data).to.eql('OK');
        });
    });
})


