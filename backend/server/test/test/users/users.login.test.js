const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { nanoid } = require('nanoid');
const { generateSignatures } = require('../../utils/encryptionUtilities')

describe('Users', () => {
    let server;
    let userId

    before(async () => {
        await db.truncateTables()
        const app = await main();
        server = app.listen(3001);
    });

    after(async () => {
        await db.truncateTables()
        server.close();
    });

    describe('LogIn Endpoint', () => {
        describe('Successful login attempts', () => {
            it('Should return 200 and have a userId when calling /login', async () => {
                const { value, signedMessage, userPublicKey, hash, userName } = generateSignatures()
                const loginPayload = {
                    hash: hash.toString('hex'),
                    value: value,
                    userPublicKey: userPublicKey.toString('hex'),
                    signedMessage: signedMessage.toString('hex'),
                    userName: userName
                };
                const res = await chai.request(server).post('/login').send(loginPayload);
                expect(res).to.have.status(200);
                expect(res.body.data).to.have.property('userId');
            });
        });

        describe('Error scenarios', () => {
            it('Should return 500 for incorrect hash', async () => {
                let input = await generateSignatures()
                let changes = await generateSignatures()
                const payload = {
                    hash: changes.hash.toString('hex'),
                    value: input.value,
                    userPublicKey: input.userPublicKey.toString('hex'),
                    signedMessage: input.signedMessage.toString('hex'),
                    userName: "Lucas"
                };
                const res = await chai.request(server).post('/login').send(payload);
                expect(res).to.have.status(400);
            });

            it('Should return 500 for incorrect signature', async () => {
                let input = await generateSignatures()
                let changes = await generateSignatures()
                const payload = {
                    hash: input.hash.toString('hex'),
                    value: input.value,
                    userPublicKey: input.userPublicKey.toString('hex'),
                    signedMessage: changes.signedMessage.toString('hex'),
                    userName: "Lucas"
                };
                const res = await chai.request(server).post('/login').send(payload);
                expect(res).to.have.status(400);
            });

            it('Should return an error for Missing Parameters in Payload', async () => {
                let input = await generateSignatures()
                const payload = {
                    userPublicKey: input.userPublicKey.toString('hex'),
                    signedMessage: "dummy_signature",
                    userName: "Lucas"
                };
                const res = await chai.request(server).post('/login').send(payload);
                expect(res).to.have.status(550);
            });
        });

        describe('Referral scenarios', () => {
            let referral_code;
            before(async () => {
                await db.truncateTables()

                let input = await generateSignatures()

                userId = await db.userInsertion(input.userPublicKey.toString('hex'), "Lucas");
                referral_code = nanoid(10);
                await db.insertReferralCode(referral_code, userId);
            });

            it('Should process valid referral code when present', async () => {
                const referral_code = nanoid(10);
                await db.insertReferralCode(referral_code, userId);
                const { value, signedMessage, userPublicKey, hash, userName } = generateSignatures()
                const loginPayload = {
                    hash: hash.toString('hex'),
                    value: value,
                    userPublicKey: userPublicKey.toString('hex'),
                    signedMessage: signedMessage.toString('hex'),
                    userName: userName
                };
                const res = await chai.request(server).post('/login').send(loginPayload).set('Cookie', `referral=${referral_code}`);
                expect(res).to.have.status(200);
            });

            it('Should process referral code when present', async () => {
                const { value, signedMessage, userPublicKey, hash, userName } = generateSignatures()

                const loginPayload = {
                    hash: hash.toString('hex'),
                    value: value,
                    userPublicKey: userPublicKey.toString('hex'),
                    signedMessage: signedMessage.toString('hex'),
                    userName: userName
                };
                const referral_code = nanoid(10)
                const res = await chai.request(server).post('/login').send(loginPayload).set('Cookie', `referral=${referral_code}`); // Setting referral code as cookie
                expect(res).to.have.status(200);
            });
            it('Should handle absence or invalidity of referral code gracefully', async () => {
                const { value, signedMessage, userPublicKey, hash, userName } = generateSignatures()

                const loginPayload = {
                    hash: hash.toString('hex'),
                    value: value,
                    userPublicKey: userPublicKey.toString('hex'),
                    signedMessage: signedMessage.toString('hex'),
                    userName: userName
                };
                const res = await chai.request(server).post('/login').send(loginPayload);
                expect(res).to.have.status(200);
            });
        });
    });
});
