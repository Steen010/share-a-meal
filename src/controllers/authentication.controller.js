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
          code: 500,
          message: err.code
        });
      }
      if (connection) {
        logger.trace('Database connection success');

        const sqlStatement = 'SELECT * FROM `user` WHERE `emailAdress` =?';

        connection.query(sqlStatement, [req.body.emailAdress], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
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
                      code: 200,
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
                code: 404,
                message: 'User does not exist',
                data: undefined
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
    try {
      assert(
        typeof req.body.emailAdress === 'string',
        'emailAdress must be a string.'
      );
      assert(
        typeof req.body.password === 'string',
        'password must be a string.'
      );
      next();
    } catch (ex) {
      res.status(400).json({
        code: 400,
        error: ex.toString(),
        datetime: new Date().toISOString()
      });
    }
  },


  validateToken(req, res, next) {
    console.log('validate token bereikt');
    logger.trace('validateToken called');

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        code: 401,
        message: 'Authorization header missing!',
        data: undefined
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      logger.trace('token', token);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          next({
            code: 401,
            message: 'Not authorized',
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