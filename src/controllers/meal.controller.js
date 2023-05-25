const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/database');
const jwt = require('jsonwebtoken');

const mealController = {
  getAllMeals: (req, res, next) => {
    logger.info('Get all meals');

    let sqlStatement = 'SELECT * FROM `meal`';
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
              message: 'meal getAll endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },
  getMealId: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;
  
    logger.trace('Requested meal id = ', mealId, ' by user id = ', userId);
  
    let sqlStatement = 'SELECT * FROM `meal` WHERE id=?';
  
    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [mealId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results && results.length > 0) {
            logger.trace('Results:', results);
              res.status(200).json({
                code: 200,
                message: 'User with id ' + mealId + ' found',
                data: results
              });
          } else {
            next({
              code: 404,
              message: 'Meal does not exist',
              data: {}
            });
          }
        });
      }
    });
  },
  createMeal: (req, res, next) => {
    logger.trace('Create new meal');

    // De mealgegevens zijn meegestuurd in de request body.
    const meal = req.body;
    const userId = req.userId;
    logger.trace('meal = ', meal);

    // Hier zie je hoe je binnenkomende meal info kunt valideren.
    try {
      logger.info('assert req body')
      assert(typeof meal.name === 'string', 'mealName must be a string');
      assert(typeof meal.description === 'string', 'description must be a string');
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
    'INSERT INTO `meal` (`name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(?, ?, ?, ?, ?, ?, ?);" + 
      'SELECT * FROM `user` WHERE id=?;';

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
              meal.name,
              meal.description,
              meal.imageUrl,
              meal.dateTime,
              meal.maxAmountOfParticipants,
              meal.price,
              userId,
              meal.cookId
            ], (err, results, fields) => {
              if (err) {
                logger.error(err.message);
                next({
                  code: 409,
                  message: err.message
                });
              }
              if (results) {
                logger.trace('Meal successfully added, id = ', results.insertId);
                const newMeal = {
                  id: results[0].insertId,
                  ...meal,
                  cook: results[1]
                }
                res.status(200).json({
                  code: 200,
                  message: 'New meal created',
                  data: newMeal
                })
              }
            }
          )
        }
      })
  },
  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;

    logger.trace('Deleting meal id = ', req.params.mealId, ' by user id = ', userId);

    let sqlStatement = 
    'DELETE FROM `meal` WHERE id=? AND cookId=?';

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.err(err.code, err.syscall, err.address, err.port);
          next({
            code: 500,
            message: err.code
          });
      }
      if (conn) {
        conn.query(
          sqlStatement, [mealId, userId], (err, results, fields) => {
            if (err) {
              logger.err(err.message);
                next({
                  code: 409,
                  message: err.message
                });
            }
            if (results && results.affectedRows === 1) {
              logger.trace('Resuts ', results);
              res.status(200).json({
                code: 200,
                message: 'Meal with id ' + mealId + ' deleted',
                data: {}
              })
            } else {
              next({
                code: 401,
                message: 'Not authorized',
                data: {}
              })
            }
          }
        )
      }
    })
  },
  participateMeal: (req, res, next) => {
  },
  deleteMealParticipate: (req, res, next) => {
  },
  getAllParticipations: (req, res, next) => {
  },
  getParticipationDetails: (req, res, next) => {
  }
};

module.exports = mealController;