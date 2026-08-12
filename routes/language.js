const languageRoute = require('express').Router();
const LanguageController = require('../controllers/LanguageController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

languageRoute.use(auth);
languageRoute.get('/',LanguageController.getLanguages);

// Authorize Routes
languageRoute.post('/',authorize("Admin"), LanguageController.createLanguage);
languageRoute.patch('/:id', authorize("Admin"), LanguageController.updateLanguage);
languageRoute.delete('/:id', authorize("Admin"), LanguageController.deleteLanguage);

module.exports = languageRoute;