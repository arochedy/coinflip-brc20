const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { nanoid } = require('nanoid');
const { main } = require('../../api/app');
const db = require('../../utils/database/db');
const { generateSignatures } = require('../../utils/encryptionUtilities')

chai.use(chaiHttp);
const expect = chai.expect;

describe('GameLogic', () => {
    let gameNonce;
    let value
    let signedMessage
    let userPublicKey
    let hash
    let userName
    let server
    let userId
    let app
    let sandbox
    let input;

    before(async () => {
        await db.truncateTables();
        app = await main();
        server = app.listen(3001);
        input = generateSignatures()
        value = input.value
        signedMessage = input.signedMessage
        userPublicKey = input.userPublicKey
        hash = input.hash
        userName = input.userName
        privateKey = input.privateKey
    });

    after(() => {
        server.close();
    });

    describe('Successful reveal attempts', () => {
        let res;

        before(async () => {
            userId = await db.userInsertion(userPublicKey.toString('hex'), "Lucas");

            // TODO: fix this to actually get it to be more unit
            const payloads = { userId: userId };
            res = await chai.request(server).post('/game/commitment').send(payloads);
            gameNonce = res.body.data.gameNonce;

            const { signedMessage } = generateSignatures(gameNonce, privateKey, userPublicKey)

            const payload = {
                gameNonceReceived: gameNonce,
                choice: true,
                amount: 10,
                userPublicKey: userPublicKey.toString('hex'),
                signedMessage: signedMessage.toString('hex')
            };

            res = await chai.request(server).post('/game/reveal').send(payload);
        });

        it('Should return 200 when calling /reveal', async () => {
            expect(res).to.have.status(200);
        });

        it('Should return the correct game data', () => {
            ['outcomeHash', 'vrn', 'didWin', 'outcomeString'].forEach(prop => {
                expect(res.body).to.have.property(prop);
            });
        });
    });

    describe('Successful reveal attempts when theres a referrer', () => {
        let res;

        before(async () => {
            input = generateSignatures(gameNonce, privateKey, userPublicKey)

            const payload = {
                gameNonceReceived: gameNonce,
                choice: true,
                amount: 10,
                userPublicKey: input.userPublicKey.toString('hex'),
                signedMessage: input.signedMessage.toString('hex')
            };

            referrerId = await db.userInsertion(input.userPublicKey, "Lucas");
            referral_code = nanoid(10);
            await db.insertReferralCode(referral_code, referrerId);
            await db.insertReferral(referral_code, referrerId, userId);

            res = await chai.request(server).post('/game/reveal').send(payload);
        });

        it('Should return 200 when calling /reveal', async () => {
            expect(res).to.have.status(200);
        });

        it('Should return the correct game data', () => {
            ['outcomeHash', 'vrn', 'didWin', 'outcomeString'].forEach(prop => {
                expect(res.body).to.have.property(prop);
            });
        });
    });

    describe('Error scenarios', () => {
        it('Should return 400 for an invalid game nonce', async () => {
            input = generateSignatures(gameNonce, privateKey, userPublicKey)

            const payload = {
                gameNonceReceived: "invalidNonce",
                choice: true,
                amount: 10,
                userPublicKey: input.userPublicKey.toString('hex'),
                signedMessage: input.signedMessage.toString('hex')
            };

            const res = await chai.request(server).post('/game/reveal').send(payload);
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal('Invalid request. Game not found');
        });

        it('Should return 400 for non-existent user', async () => {
            input = generateSignatures(gameNonce, undefined, undefined)

            const payload = {
                gameNonceReceived: gameNonce,
                choice: true,
                amount: 10,
                userPublicKey: input.userPublicKey.toString('hex'),
                signedMessage: input.signedMessage.toString('hex')
            };

            const res = await chai.request(server).post('/game/reveal').send(payload);
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal('Invalid request. Users public key not found');
        });

        it('Should return 400 for incorrect signature', async () => {
            input = generateSignatures()

            const payload = {
                gameNonceReceived: gameNonce,
                choice: true,
                amount: 10,
                userPublicKey: input.userPublicKey.toString('hex'),
                signedMessage: input.signedMessage.toString('hex')
            };

            const res = await chai.request(server).post('/game/reveal').send(payload);
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal('Invalid request. Users public key not found');
        });
    });
});
