const authRoute = require('express').Router();
const AuthController = require('../controllers/AuthController');

authRoute.post('/register', AuthController.register);
authRoute.post('/login', AuthController.login);

module.exports = authRoute;