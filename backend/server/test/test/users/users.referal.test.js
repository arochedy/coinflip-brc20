const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { nanoid } = require('nanoid');
const { generateSignatures } = require('../../utils/encryptionUtilities')



chai.use(chaiHttp);

describe('Users', () => {
    let res;
    let server;
    let referralCode;

    before(async () => {
        try {
            await db.truncateTables();
            const app = await main();
            server = app.listen(3001);

        } catch (error) {
            console.error('Setup failed', error);
        }
    });

    after(async () => {
        try {
            await db.truncateTables();
            server.close();
        } catch (error) {
            console.error('Teardown failed', error);
        }
    });

    describe('/ endpoint', () => {
        before(async () => {
            res = await chai.request(server).get('/');
        });

        it('Should return 200 when calling /healthcheck for the container', async () => {
            expect(res).to.have.status(200, 'Response status should be 200');
        });

        it('Should return the correct message', () => {
            expect(res.text).to.eql('{"data":[]}', 'Response message should be {"data":"OK"}');
        });
    });

    describe('/?ref= endpoint with a valid referral', () => {

        before(async () => {
            const { userPublicKey } = generateSignatures()

            const userId = await db.userInsertion(userPublicKey, "Lucas");

            referralCode = nanoid(10);
            await db.insertReferralCode(referralCode, userId);

            res = await chai.request(server).get(`/?ref=${referralCode}`);
        });

        it('Should return 200 when calling / with a referral code', async () => {
            expect(res).to.have.status(200, 'Response status should be 200');
        });

        it('Should set the referral cookie with the correct value', () => {
            expect(res).to.have.cookie('referral', referralCode, 'Referral cookie should have the correct value');
        });

        it('Should return the correct message', () => {
            expect(res.body.data).to.eql([], 'Response message should be OK');
        });
    });
    describe('/?ref= endpoint without a referral', () => {

        before(async () => {
            referralCode = nanoid(10);
            res = await chai.request(server).get(`/?ref=${referralCode}`);
        });

        it('Should return 200 when calling / with a referral code', async () => {
            expect(res).to.have.status(200, 'Response status should be 200');
        });

        it('Should return the correct message', () => {
            expect(res.body.data).to.eql([], 'Response message should be OK');
        });
    });
});
