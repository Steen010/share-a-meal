const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');

// UC-101 Inloggen toevoegen
router.post('/login', authController.validateLogin, authController.login);

module.exports = router;