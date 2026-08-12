const translatorRoute = require('express').Router();
const ProjectCandidateController = require('../controllers/ProjectCandidateController');
const TranslatorController = require('../controllers/TranslatorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

translatorRoute.use(auth);

translatorRoute.get('/invitations',authorize("Translator"), ProjectCandidateController.getMyInvitations);
translatorRoute.patch('/invitations/:projectId/accept', authorize("Translator"), ProjectCandidateController.acceptInvitation);
translatorRoute.patch('/invitations/:projectId/decline', authorize("Translator"),ProjectCandidateController.declineInvitation);
translatorRoute.get('/me',authorize("Translator"),TranslatorController.getMyTranslator);

translatorRoute.get('/', authorize("Client","Admin"),TranslatorController.getTranslators);
translatorRoute.get('/:id', authorize("Client","Admin"),TranslatorController.getTranslatorById);
translatorRoute.post('/', authorize("Translator","Admin"), TranslatorController.createTranslator);
translatorRoute.patch('/me', authorize("Translator","Admin"), TranslatorController.updateMyTranslator);
// Authorize Routes
translatorRoute.delete('/:id', authorize("Admin"), TranslatorController.deleteTranslator);

module.exports = translatorRoute;