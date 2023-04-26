const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
chai.should();
chai.use(chaiHttp);

const { describe } = require('node:test');
const { updateUser } = require('../../src/controllers/user.controller');

describe('TC-20x user', ()=>{
    describe('TC 201 Registreren als nieuwe user', ()=>{
        it('TC-201-1 Verplicht veld ontbreekt', (done)=>{
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'Davide',
                lastName: 'Ambesi',
            })
            .end((err, res)=>{
                res.body.should.be.an('object');
                res.body.should.has.property('status').to.be.equal(400),
                res.body.should.has.property('message'),
                res.body.should.has.property('data').empty;
                done();
            });
        });
        it('TC-201-5 Gebruiker succesvol geregistreerd', (done)=>{
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'Jan',
                lastName: 'Montizaan',
                emailAddress: 'j.montizaan@avans.nl',
            })
            .end((err, res)=>{
                res.body.should.be.an('object')
                res.body.should.has.property('status', 201);
                res.body.should.has.property('message');
                res.body.should.has.property('data').to.not.be.empty;
                let{firstName,lastName,emailAddress} = res.body.data;
                firstName.should.be.a('string').to.be.equal('Jan');
                lastName.should.be.a('string').to.be.equal('Montizaan');
                emailAddress.should.be.a('string').to.be.equal('j.montizaan@avans.nl');
                done();
            })
        });
        it('TC-201-2', (done) => {
            const newUser = {
                firstname: 'John',
                  lastname: 'Doe',
                  emailaddress: 'john.doe@.example', // Ongeldig e-mailadres
                };
            
            chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(400);
                res.body.should.have.property('message').to.be.equal('Ongeldig e-mailadres');
                res.body.should.have.property('data');
                done();
            });
        });
        it('TC-202-1', (done) => {
            chai
            .request(server)
            .get('/api/users')
            .end((err, res) => {
                assert(err === null);
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(200);
                res.body.should.have.property('message');
                res.body.should.have.property('data');
                let { data, message, status } = res.body;
                data.should.be.an('array');
                data.length.should.be.equal(database.users.length);
                done();
            });
        });
        it('UC-204-2', (done) => {
            const userId = 'invalid';
            chai
            .request(server)
            .get(`/api/users/${userId}`)
            .end((err, res) => {
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(404);
                res.body.should.have.property('message').to.be.equal('Ongeldig gebruikers-ID');
                res.body.should.have.property('data');
                done();
            });
        });
        it('UC-204-3', (done) => {
            const userId = 0; // Change this to the appropriate user ID
            chai
            .request(server)
            .get(`/api/users/${userId}`)
            .end((err, res) => {
                assert(err === null);
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(200);
                res.body.should.have.property('message');
                res.body.should.have.property('data');
                res.body.data.should.have.property('firstname');
                res.body.data.should.have.property('lastname');
                res.body.data.should.have.property('emailaddress');
                done();
            });
        });
        it('TC-205-6', (done) => {
                const updateData = {
                    firstname: 'UpdatedName',
                    lastname: 'UpdatedLastName',
                }
            chai
            .request(server)
            .put('/api/users/update')
            .send(updateData)
            .end((err, res) => {
                assert(err === null);
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(200);
                res.body.should.have.property('message');
                res.body.should.have.property('data');
            
                let { data, message, status } = res.body;
                data.should.be.an('object');
                data.should.have.property('firstname').to.be.equal(updateData.firstname);
                data.should.have.property('lastname').to.be.equal(updateData.lastname);
                done();
            });
        });
        it('TC-205-4', (done) => {
            const updateData = {
                firstname: 'UpdatedName',
            };
            chai
            .request(server)
            .put('/api/users/update')
            .send(updateData)
            .end((err, res) => {
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(404);
                res.body.should.have.property('message').to.be.equal('Not Found');
                res.body.should.have.property('data');
                done();
            });
        });
        it('TC-206-1', (done) => {
            const credentials = {
                emailaddress: 'nonexistentuser@example.com',
            };
            chai
            .request(server)
            .delete('/api/users/delete')
            .send(credentials)
            .end((err, res) => {
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(404);
                res.body.should.have.property('message').to.be.equal('Not Found');
                res.body.should.have.property('data');
                done();
            });
        });
        it('TC-206-4', (done) => {
            const credentials = {
                emailaddress: 'testuser@gmail.com',
            };
            chai
            .request(server)
            .delete('/api/users/delete')
            .send(credentials)
            .end((err, res) => {
                console.log('Response body:', res.body);
                assert(err === null);
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(200);
                res.body.should.have.property('message');
                res.body.should.have.property('data');
                done();
            });
        });
    });
});