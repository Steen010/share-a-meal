const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/database');
const jwt = require('jsonwebtoken');
const { type } = require('os');

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
        logger.error(err.status, err.syscall, err.address, err.port);
        next({
          status: 500,
          message: err.status
        });
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.error(err.message);
            next({
              status: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              status: 200,
              message: 'Meal getAll endpoint',
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
        logger.error(err.status, err.syscall, err.address, err.port);
        next({
          status: 500,
          message: err.status
        });
      }
      if (conn) {
        conn.query(sqlStatement, [mealId], (err, results, fields) => {
          if (err) {
            logger.error(err.message);
            next({
              status: 409,
              message: err.message
            });
          }
          if (results && results.length > 0) {
            logger.trace('Results:', results);
              res.status(200).json({
                status: 200,
                message: 'Meal with id ' + mealId + ' found',
                data: results[0]
              });
          } else {
            next({
              status: 404,
              message: 'Meal not found',
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
      assert(typeof meal.name === 'string', 'missing meal name');
      assert(typeof meal.description === 'string', 'description must be a string');
      assert(typeof meal.dateTime === 'string', 'dateTime must be a string');
      assert(typeof meal.maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
      assert(typeof meal.price === 'number', 'price must be a number');
      assert(typeof meal.imageUrl === 'string', 'imageUrl must be a string');
    } catch (err) {
      logger.warn(err.message.toString());
      // Als één van de asserts failt sturen we een error response.
      logger.trace('assert failure')
      next({
        status: 400,
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
                logger.err(err.message);
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
  updateMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;
    logger.info('USER ID:', userId);
    logger.info('MEAL ID:', mealId);

    try {
      logger.info('assert req body')
      assert(typeof req.body.name === 'string', 'missing meal name');
      assert(typeof req.body.description === 'string', 'description must be a string');
      assert(typeof req.body.dateTime === 'string', 'dateTime must be a string');
      assert(typeof req.body.maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
      assert(typeof req.body.imageUrl === 'string', 'imageUrl must be a string');
    } catch (err) {
      logger.warn(err.message.toString());
      // Als één van de asserts failt sturen we een error response.
      logger.trace('assert failure')
      next({
        status: 400,
        message: err.message.toString(),
        data: {}
      });

      // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
      // wanneer er al een response is teruggestuurd.
      return;
    }

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      logger.debug('Database connection established');

      conn.query(
        'SELECT * FROM meal WHERE id = ?',
        [mealId],
        function (error, results, fields) {
          if (error) {
            logger.error('Database query error:', error);
            conn.release();
            return res.status(500).json({
              status: 500,
              message: error.message,
              data: {},
            });
          }
          logger.debug('Retrieved meal information');

          // Check if meal exists
          if (results.length === 0) {
            logger.info('Meal not found');
            conn.release();
            return res.status(404).json({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }

          // Check if user is updating their own meal
          if (results[0].cookId != userId) {
            logger.info('User is not the creator of the meal');
            conn.release();
            return res.status(403).json({
              status: 403,
              message: 'You can only update your own meals',
              data: {},
            });
          }

          // Combine current meal values with new ones from request body
          let updatedMeal = {
            ...results[0],
            ...req.body,
          };
          logger.info(typeof(updatedMeal.allergenes));
        
          // If updatedMeal.allergenes is an array, join it into a string
          if (Array.isArray(updatedMeal.allergenes)) {
            updatedMeal.allergenes = updatedMeal.allergenes.join(',');
          }


          const sql = `
            UPDATE meal
            SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, allergenes = ?
            WHERE id = ?
          `;
          const values = [
            updatedMeal.name,
            updatedMeal.description,
            updatedMeal.isActive,
            updatedMeal.isVega,
            updatedMeal.isVegan,
            updatedMeal.isToTakeHome,
            updatedMeal.dateTime,
            updatedMeal.maxAmountOfParticipants,
            updatedMeal.price,
            updatedMeal.imageUrl,
            updatedMeal.allergenes,
            mealId,
          ];

          
          conn.query(sql, values, function (error, results, fields) {
            if (error) {
              logger.error('Database query error:', error);
              conn.release();
              return res.status(500).json({
                status: 500,
                message: error.message,
                data: {},
              });
            }

            logger.info('Meal updated in the database');

            // Nieuwe informatie ophalen
            conn.query(
              'SELECT * FROM meal WHERE id = ?',
              [mealId],
              function (error, results, fields) {
                if (error) {
                  logger.error('Database query error:', error);
                  conn.release();
                  return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {},
                  });
                }

                logger.info('Retrieved updated meal information');

                res.status(200).json({
                  status: 200,
                  message: `Meal successfully updated`,
                  data: results[0],
                });

                conn.release();
                logger.info('Database connection released');
              }
            );
          });
        }
      );
    });
  },
  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;

    logger.info(`Attempting to delete meal ${mealId} by user ${userId}`);

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }

      const firstQuery = 'SELECT * FROM `meal` WHERE id = ?';

      conn.query(firstQuery, [mealId], function (err, results) {
          logger.debug('Retrieved meal information');
          if (err) {
            logger.error('Database query error:', err);
            conn.release();
            return res.status(500).json({
              status: 500,
              message: err.message,
              data: {},
            });
          }

          if (results.length > 0) {
            logger.debug('Meal found');
            if (results[0].cookId !== userId) {
              logger.debug('User not authorized to delete this meal');
              next({
                status: 403,
                message: 'Not authorized to delete this meal',
                data: {},
              });
              return;
            }

            const secondQuery = 'DELETE FROM meal WHERE id = ? AND cookId = ?';

            conn.query(secondQuery, [mealId, userId], function (err, results) {
                if (err) {
                  logger.error('Database query error:', err);
                  conn.release();
                  return res.status(500).json({
                    status: 500,
                    message: err.message,
                    data: {},
                  });
                }
                if (results.affectedRows > 0) {
                  logger.debug('Meal deleted successfully');
                  res.status(200).json({
                    status: 200,
                    message: `Meal with id ${mealId} deleted`,
                    data: {},
                  });
                }
              }
            );
          } else {
            logger.debug('Meal not found');
            conn.release();
            next({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }
        }
      );
    });
  }
};

module.exports = mealController;