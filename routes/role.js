const roleRoute = require('express').Router();
const RoleController = require('../controllers/RoleController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

roleRoute.use(auth);

roleRoute.get('/', authorize("Admin"),RoleController.getAllRoles);
roleRoute.get('/:id', RoleController.getRoleById);

// Authorize Routes
roleRoute.post('/', authorize("Admin"), RoleController.createRole);
roleRoute.put('/:id', authorize("Admin"), RoleController.updateRole);
roleRoute.delete('/:id', authorize("Admin"), RoleController.deleteRole);

module.exports = roleRoute;