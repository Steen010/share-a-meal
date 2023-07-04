const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/database');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {

  login(req, res, next) {
    logger.trace('login called');

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          status: 500,
          message: err.status
        });
      }
      if (connection) {
        logger.trace('Database connection success');

        const sqlStatement = 'SELECT * FROM `user` WHERE `emailAdress` =?';

        connection.query(sqlStatement, [req.body.emailAdress], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              status: 409,
              message: err.message,
              data: {}
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            if (results.length === 1 && results[0].password === req.body.password) {

              const {password, id, ...userInfo} = results[0];
              const payload = {
                userId: id
              }

              jwt.sign(payload, 
                jwtSecretKey, 
                { expiresIn: '2d' }, 
                (err, token) => {
                  if (token) {
                    res.status(200).json({
                      status: 200,
                      message: 'Login endpoint',
                      data: {
                        id,
                        ...userInfo,
                        token
                      }
                    });
                  }
              })

            } else {
              next({
                status: 404,
                message: 'User not found',
                data: {}
              })
            }
          }
        });
        pool.releaseConnection(connection);
      }
    });
  },

  /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    if (req.body.password === undefined || req.body.password === '') {
      return res.status(400).json({
        status: 400,
        message: 'Invalid password.',
        data: {},
      });
    }
    if (req.body.emailAdress === undefined || req.body.emailAdress === '') {
      return res.status(400).json({
        status: 400,
        message: 'Invalid email address.',
        data: {},
      });
    }

    try {
      logger.info('assert req body');
      assert(typeof req.body.emailAdress === 'string', 'Invalid email address.');
      assert(typeof req.body.password === 'string', 'Invalid email password.');
      next();
    } catch (err) {
      logger.warn(err.message.toString());
      logger.trace('assert failure');
      next({
        status: 400,
        message: err.message.toString(),
        data: {}
      });
    
      return;
    }
  },


  validateToken(req, res, next) {
    console.log('validate token bereikt');
    logger.trace('validateToken called');

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        status: 401,
        message: 'Authorization header missing!',
        data: undefined
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      logger.trace('token', token);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          next({
            status: 401,
            message: 'Invalid token.',
            data: undefined
          });
        }
        if (payload) {
          req.userId = payload.userId;
          next();
        }
      })

    }
  }
};