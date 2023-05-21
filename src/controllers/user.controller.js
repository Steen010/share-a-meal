const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/database');
const jwt = require('jsonwebtoken');

const userController = {
  getAllUsers: (req, res, next) => {
    logger.info('Get all users');

    let sqlStatement = 'SELECT * FROM `user`';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.
    if (req.query.isactive) {
      // voeg de benodigde SQL code toe aan het sql statement
      // bv sqlStatement += " WHERE `isActive=?`"
    }

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'User getAll endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },
  getUserProfile: (req, res, next) => {
    logger.trace('Get user profile for user', req.userId);

    let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [req.userId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.trace('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Get User profile',
              data: results[0]
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },
  createUser: (req, res, next) => {
    logger.trace('Register new user');

    // De mealgegevens zijn meegestuurd in de request body.
    const user = req.body;
    const userId = req.userId;
    logger.trace('user = ', user);

    // Hier zie je hoe je binnenkomende meal info kunt valideren.
    try {
      logger.info('assert req body')
      assert(typeof user.firstName === 'string', 'firstName must be a string');
      assert(typeof user.lastName === 'string', 'lastName must be a string');
      assert(typeof user.street === 'string', 'street must be a string');
      assert(typeof user.city === 'string', 'city must be a string');
      assert(typeof user.emailAdress === 'string', 'emailAdress must be a string');
      assert(typeof user.password === 'string', 'password must be a string');
      assert(
        /^[a-z]{1}\.[a-z]{2,}@[a-z]{2,}\.[a-z]{2,3}$/i.test(req.body.emailAdress),
        'emailAdress must be in the following format: x.xx@xx.xx, with one letter before the dot, a second part with a minimum of two letters, and a domain with a minimum of two letters and a domain extension of two or three letters.'
      );
      assert(
        /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(req.body.password),
        'password must contain at least one uppercase letter, one digit, and be at least 8 characters long.'
      );
      assert(
        /^06[-\s]?\d{8}$/.test(req.body.phoneNumber),
        'phoneNumber must start with 06 have no space a "-" or a white space and be followed by 8 numbers'
      );
    } catch (err) {
      logger.warn(err.message.toString());
      // Als één van de asserts failt sturen we een error response.
      logger.trace('assert failure')
      next({
        code: 400,
        message: err.message.toString(),
        data: {}
      });

      // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
      // wanneer er al een response is teruggestuurd.
      return;
    }

    logger.trace('asserts completed')

    let sqlStatement = 
    'INSERT INTO `user` (`firstName`, `lastName`, `street`, `city`, `emailAdress`, `password`, `phoneNumber`) VALUES' +
    "(?, ?, ?, ?, ?, ?, ?);";

      pool.getConnection(function (err, conn) {
        if (err) {
          logger.error(err.code, err.syscall, err.address, err.port);
          next({
            code: 500,
            message: err.code
          });
        }
        if (conn) {
          logger.trace('conn succesfull')
          conn.query(
            sqlStatement,
            [
              user.firstName,
              user.lastName,
              user.street,
              user.city,
              user.emailAdress,
              user.password,
              user.phoneNumber
            ], (err, results, fields) => {
              if (err) {
                logger.error(err.message);
                next({
                  code: 409,
                  message: err.message
                });
              }
              if (results) {
                logger.trace('User successfully added, id = ', results.insertId);
                const newUser = {
                  id: results.insertId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  street: user.street,
                  city: user.city,
                  emailAdress: user.emailAdress,
                  phoneNumber: user.phoneNumber
                };
                res.status(200).json({
                  code: 200,
                  message: 'New user created',
                  data: newUser
                })
              }
            }
          )
        }
      })
  },
  getUserId: (req, res, next) => {
    const reqUserId = req.params.userId;
    const userId = req.userId;
  
    logger.trace('Requested user id = ', reqUserId, ' by user id = ', userId);
  
    let sqlStatement = 'SELECT * FROM `user` WHERE id=?';
  
    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [reqUserId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results && results.length > 0) {
            logger.trace('Results:', results);
  
            const user = {
              id: results[0].id,
              firstName: results[0].firstName,
              lastName: results[0].lastName,
              street: results[0].street,
              city: results[0].city,
              isActive: results[0].isActive,
              emailAdress: results[0].emailAdress,
              phoneNumber: results[0].phoneNumber
            };
  
            if (userId == reqUserId) {
              user.password = results[0].password;
              res.status(200).json({
                code: 200,
                message: 'User with id ' + reqUserId + ' found and authorized',
                data: user
              });
            } else {
              res.status(200).json({
                code: 200,
                message: 'User with id ' + reqUserId + ' found unauthorized',
                data: user
              });
            }
          } else {
            next({
              code: 404,
              message: 'User does not exist',
              data: {}
            });
          }
        });
      }
    });
  },
  deleteUser: (req, res, next) => {
    const reqUserId = req.params.userId;
    const userId = req.userId;
  
    logger.trace('Deleting user id = ', reqUserId, ' by user id = ', userId);
  
    if (userId != reqUserId) {
      logger.trace(reqUserId, userId);
      return res.status(403).json({
        code: 403,
        message: 'Not authorized'
      });
    }
  
    let sqlStatement = 'DELETE FROM `user` WHERE id=?';
  
    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [reqUserId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results && results.affectedRows === 1) {
            logger.trace('Results ', results);
            res.status(200).json({
              code: 200,
              message: 'User with ID ' + reqUserId + ' is deleted',
              data: {}
            });
          } else {
            logger.trace('Results', results);
            next({
              code: 404,
              message: 'User with ID ' + reqUserId + ' does not exist',
              data: {}
            });
          }
        });
      }
    });
  }
};

module.exports = userController;