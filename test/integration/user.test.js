process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';
process.env.LOGLEVEL = 'warn';

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const database = require('../../src/util/database');
require('tracer').setLevel('error');

chai.should();
chai.use(chaiHttp);

const { describe } = require('mocha');
const { updateUser } = require('../../src/controllers/user.controller');

const bcrypt = require('bcrypt');
let token = '';

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
let INSERT_USER = '';

bcrypt.hash('Secret123', 10, function(err, hash) {
  INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "Koen", "Steen", "k.steen@gmail.com", "' + hash + '", "testStreet", "testCity"),' +
    '(2, "Maudy", "Bezems", "m.bezems@gmail.com", "' + hash + '", "testStreet2", "testCity");';

  describe('Manager users', () => {
    beforeEach((done) => {
      database.getConnection(function(err, connection) {
        if (err) throw err;

        connection.query(CLEAR_DB + INSERT_USER, function(error, results, fields) {
          connection.release();

          if (error) throw error;
          done();
        });
      });
    });

    describe('UC-101 Inloggen', () => {
      it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
          .post('/api/login')
          .send({
            // Emailaddress is missing
            password: 'Secret123'
          })
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('emailAdress must be a String');
          done();
        }
      );
    });

    it('TC-101-2 Invalide e-mail adress', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          emailAdress: 'wrong@gmail',
          password: 'Secret123'
        })
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('emailAdress must be a String');
          done();
        }
      );
    });

    it('TC-101-3 Invalide wachtwoord', (done) => {
      let user = {
        emailAdress: 'john@gmail',
        password: 'wrong'
      }
      chai.request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql(`password with value ${user.password} fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
          done();
        }
      );
    });

    it('TC-101-4 Gebruiker bestaat niet', (done) => {
      let user = {
        emailAdress: 'w.rong@hotmail.com',
        password: 'Secret123'
      }
      chai.request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(404);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-101-5 Gebruiker succesvol ingelogd', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          emailAdress: 'k.steen@gmail.com',
          password: 'Secret123'
        })
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('object');
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          result.should.have.property('token');
          token = result.token;
          done();
        }
      );
    });
  });

  describe('UC-201 Nieuwe gebruiker registreren', () => {
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
      let user = {
        firstName: "Koen",
        lastName: "Steen",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        // Password mist
        emailAdress: 'k.test@gmail.com',
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql("password is required");
          done();
        }
      );
    });

    it('TC-201-2 niet valide email-adress', (done) => {
      let user = {
        firstName: "Koen",
        lastName: "Steen",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "TestPassword55533",
        emailAdress: "wrongEmail"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql("emailAdress must be a valid email");
          done();
        }
      );
    });

    it('TC-201-3 invalide password', (done) => {
      let user = {
        firstName: "Koen",
        lastName: "Steen",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "wrong",
        emailAdress: "k.test@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('password with value "wrong" fails to match the required pattern: /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/');
          done();
        }
      );
    });

    it('TC-201-4 | User already exists', (done) => {
      let user = {
        firstName: "Koen",
        lastName: "Steen",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret123",
        emailAdress: "k.steen@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(409);
          message.should.be.a('string').eql('Emailaddress is already taken');
          done();
        }
      );
    });

    it('TC-201-5 | User successfully registered', (done) => {
      let user = {
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret123",
        emailAdress: "johnbeton@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(201);
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('UC-202 Overzicht van alle gebruikers', () => {
    it('TC-202-1 Toon alle gebruikers', (done) => {
      chai.request(server)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.an('array');
          done();
        }
      );
    });
  });

  describe('UC-203 Request profiel gebruiker', () => {
    it('TC-203-1 Invalide token', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalidToken')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Invalid token.');
          done();
        }
      );
    });

    it('TC-203-2 Valide token en gebruiker bestaat', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('object');
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          done();
        }
      );
    });
  });

  describe('UC-204 Details van gebruiker', () => {
    it('TC-204-1 Invalide token', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('Authorization', 'Bearer invalidToken')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Invalid token.');
          done();
        }
      );
    });

    it('TC-204-2 Gebruiker bestaat niet', (done) => {
      chai.request(server)
        .get('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(404);
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-204-3 Gebruiker ID bestaat', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          done();
        }
      );
    });
  });

  describe('UC-206 Verwijder gebruiker', () => {
    it('TC-206-1 Gebruiker bestaat niet', (done) => {
      chai.request(server)
        .delete('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
      chai.request(server)
        .delete('/api/user/2')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(403);
          message.should.be.a('string').eql('Logged in user is not allowed to delete this user.');
          done();
        }
      );
    });

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('array');
          done();
        }
      );
    });
  });
});
});