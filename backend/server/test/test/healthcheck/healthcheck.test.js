const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const { main } = require('../../api/app');

describe('Healthcheck File', () => {
    before(async () => {
        const app = await main();
        server = app.listen(3001);
    });

    after(() => {
        server.close();
    });

    describe('/healthcheck', () => {
        var res
        describe('/healthcheck enpdoint', () => {
            before(async () => {
                res = await chai
                    .request(server)
                    .get('/healthcheck')
            })

            it('Should return 200 when calling /healthcheck for the container', async () => {
                expect(res).to.have.status(200)
            })

            it('Should return the correct message', () => {
                expect(res.text).to.eql('{"data":"OK"}');
            })
        })
    })
})