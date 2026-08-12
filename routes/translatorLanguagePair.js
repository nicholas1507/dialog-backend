const translatorLanguagePairRoute = require('express').Router();
const TranslatorLanguagePairController = require('../controllers/TranslatorLanguagePair');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

translatorLanguagePairRoute.use(auth);

translatorLanguagePairRoute.get('/', TranslatorLanguagePairController.getTranslatorLanguagePair);
translatorLanguagePairRoute.get('/:id', TranslatorLanguagePairController.getTranslatorLanguagePairById);

translatorLanguagePairRoute.post('/', authorize("Translator"), TranslatorLanguagePairController.createTranslatorLanguagePair);
translatorLanguagePairRoute.delete('/:id', authorize("Translator"), TranslatorLanguagePairController.deleteTranslatorLanguagePair);

module.exports = translatorLanguagePairRoute;