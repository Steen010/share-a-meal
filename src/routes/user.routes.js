const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller');

// UC-201 Registreren als nieuwe user
router.post('', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('', userController.getAllUsers);

// UC-203 Haal het userprofile op van de user die ingelogd is
router.get(
  '/profile',
  authController.validateToken,
  userController.getUserProfile
);

//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', authController.validateToken, userController.getUserId);

//UC-205 Wijzigen van usergegevens
router.put('/:userId', authController.validateToken, userController.updateUser);

//UC-206 Verwijderen van user
router.delete('/:userId', authController.validateToken, userController.deleteUser);

module.exports = router;