const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../api/app');
const { generateSignatures } = require('../utils/encryptionUtilities')


describe('Flick The Bean End 2 End', function () {
    this.timeout(10000); // Increase timeout if needed

    let server;
    let userId;
    let gameNonce;
    let value 
    let signedMessage
    let userPublicKey
    let hash
    let userName
    let input
    before(async () => {
        const app = await main();
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

    it('should login successfully', async () => {
        const loginPayload = {
            hash: input.hash.toString('hex'),
            value: input.value,
            userPublicKey: input.userPublicKey.toString('hex'),
            signedMessage: input.signedMessage.toString('hex'),
            userName: input.userName
        };

        res = await chai
            .request(server)
            .post('/login')
            .send(loginPayload);

        expect(res).to.have.status(200, 'Expected a 200 OK response for login');
        expect(res.body.data).to.have.property('userId');
        userId = res.body.data.userId;
    });

    it('should create a commitment successfully', async () => {
        const commitmentPayload = {
            userId: userId
        };

        res = await chai
            .request(server)
            .post('/game/commitment')
            .send(commitmentPayload);

        expect(res).to.have.status(200, 'Expected a 200 OK response for creating a commitment');
        expect(res.body.data).to.have.property('commitment');
        expect(res.body.data).to.have.property('gameNonce');
        gameNonce = res.body.data.gameNonce;
    });

    it('should reveal successfully', async () => {
        const { signedMessage } = generateSignatures(gameNonce, privateKey, userPublicKey)

        payload = {
            gameNonceReceived: gameNonce,
            choice: true,
            amount: 10,
            userPublicKey: userPublicKey.toString('hex'),
            signedMessage: signedMessage.toString('hex')
        }
        res = await chai
            .request(server)
            .post('/game/reveal')
            .send(payload);

        expect(res).to.have.status(200, 'Expected a 200 OK response for the reveal operation');
        expect(res.body).to.have.property('outcomeHash');
        expect(res.body).to.have.property('vrn');
        expect(res.body).to.have.property('didWin');
        expect(res.body).to.have.property('outcomeString');
    });
});
