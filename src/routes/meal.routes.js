const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// UC-301 Toevoegen van maaltijden
router.post('', authController.validateToken, mealController.createMeal);

// UC-302 Wijzigen van een maaltijd
router.put('/:mealId', authController.validateToken, mealController.updateMeal);

// UC-303 Opvragen van alle maaltijden
router.get('', mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get('/:mealId', mealController.getMealId);

// UC-305 Verwijderen van maaltijd
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);



module.exports = router;