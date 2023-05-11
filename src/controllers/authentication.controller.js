//
// Authentication controller
//
const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/database');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {
  /**
   * login
   * Retourneer een geldig token indien succesvol
   */
  login(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          code: 500,
          message: err.code
        });
      }
      if (connection) {
        /**
         * ToDo:
         * 1. SQL Select, zie of deze user id in de database bestaat.
         *    - Niet gevonden, dan melding Not Authorized
         * 2. Als user gevonden, check dan het password
         *    - Geen match, dan melding Not Authorized
         * 3. Maak de payload en stop de userId daar in
         * 4. Genereer het token en stuur deze terug in de response
         */
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
      res.status(422).json({
        error: ex.toString(),
        datetime: new Date().toISOString()
      });
    }
  },

  //
  //
  //
  validateToken(req, res, next) {
    logger.trace('validateToken called');
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        code: 401,
        message: 'Authorization header missing!',
        data: undefined
      });
    } else {
      /**
       * We hebben de headers. Lees het token daaruit, valideer het token
       * en lees de payload daaruit. De userId uit de payload stop je in de req,
       * en ga naar de volgende endpoint.
       * Zie de Ppt van de les over authenticatie voor tips en tricks.
       */
    }
  }
};