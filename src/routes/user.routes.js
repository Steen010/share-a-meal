const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

//these call functions in ../controllers/user.controller.js
//all the use case function can be seen in this js document
router.post('', userController.createUser);

router.get('', userController.getAllUsers);

router.get('/profile', userController.getUserProfile);

router.get('/:userId', userController.getUser);

router.put('/:userId', userController.updateUser)

router.delete('/:userId', userController.deleteUser);

module.exports = router;