const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')

describe('GameLogic', () => {
    let userId, server, gameNonce, input;

    before(async () => {
        try {
            await db.truncateTables();

            const app = await main();
            server = app.listen(3001);
            input = generateSignatures()

            // Replacing login with direct database insertion
            userId = await db.userInsertion(input.userPublicKey, "Lucas");
        } catch (error) {
            console.error('Setup failed:', error);
            throw error; // This will stop the tests if setup fails
        }
    });

    after(async () => {
        try {
            await db.truncateTables();
            server.close();
        } catch (error) {
            console.error('Teardown failed:', error);
            throw error; // This will stop after if teardown fails
        }
    });

    describe('/commitment', () => {
        let res;

        before(async () => {
            try {
                const payload = {
                    userId: userId
                };

                res = await chai
                    .request(server)
                    .post('/game/commitment')
                    .send(payload);
            } catch (error) {
                console.error('Commitment test setup failed:', error);
                throw error;
            }
        });

        it('Should return 200 when calling', async () => {
            expect(res).to.have.status(200);
        });

        it('Should return a commitment and gameNonce', () => {
            expect(res.body.data).to.have.property('commitment');
            expect(res.body.data).to.have.property('gameNonce');
            gameNonce = res.body.data.gameNonce;
        });
    });
});
