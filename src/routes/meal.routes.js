const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// UC  ...
router.get('', mealController.getAllMeals);

router.get('/:mealId', authController.validateToken, mealController.getMealId);

router.post('', authController.validateToken, mealController.createMeal);

router.delete('/:mealId', authController.validateToken, mealController.deleteMeal)

module.exports = router;