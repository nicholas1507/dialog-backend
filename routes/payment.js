const paymentRoute = require('express').Router();
const PaymentController = require('../controllers/PaymentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

paymentRoute.use(auth);

paymentRoute.get('/', authorize("Admin"), PaymentController.getPayments);
paymentRoute.get('/:id', PaymentController.getPaymentById);

paymentRoute.patch('/:id/verify', authorize("Admin"), PaymentController.verifyPayment);
paymentRoute.delete('/:id', authorize("Admin"), PaymentController.deletePayment);

module.exports = paymentRoute;