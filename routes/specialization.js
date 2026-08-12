const specializationRoute = require('express').Router();
const SpecializationController = require('../controllers/SpecializationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

specializationRoute.use(auth);

specializationRoute.get('/', SpecializationController.getSpecialization);
specializationRoute.get('/:id', SpecializationController.getSpecializationById);

// Authorize Routes
specializationRoute.post('/', authorize("Admin"), SpecializationController.createSpecialization);
specializationRoute.put('/:id', authorize("Admin"), SpecializationController.updateSpecialization);
specializationRoute.delete('/:id', authorize("Admin"), SpecializationController.deleteSpecialization);

module.exports = specializationRoute;