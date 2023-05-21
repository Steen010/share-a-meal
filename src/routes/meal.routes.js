const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// UC-301 Toevoegen van maaltijden
router.post('', authController.validateToken, mealController.createMeal);

// UC-303 Opvragen van alle maaltijden
router.get('', mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get('/:mealId', authController.validateToken, mealController.getMealId);

// UC-305 Verwijderen van maaltijd
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

// participation use cases

// UC-401 Aanmelden voor maaltijd
router.post('/:mealId/participate', authController.validateToken, mealController.participateMeal);

// UC-402 Afmelden voor maaltijd
router.delete('/:mealId/participate', authController.validateToken, mealController.deleteMealParticipate)

// UC-403 Opvragen van deelnemers
router.get('/:mealId/participants', mealController.getAllParticipations);

// UC-404 Opvragen van details van deelnemer
router.get('/:mealId/participants/:participantId', mealController.getParticipationDetails);

module.exports = router;