const projectCandidateRoute = require('express').Router();
const ProjectApplicationController = require('../controllers/ProjectCandidateController');
const auth = require('../middleware/auth');

projectCandidateRoute.use(auth);

// projectCandidateRoute.post('/',ProjectApplicationController.createApplication);
// projectCandidateRoute.get('/me',ProjectApplicationController.getMyApplication);

module.exports = projectCandidateRoute;