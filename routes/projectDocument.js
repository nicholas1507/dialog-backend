const projectDocument = require('express').Router();
const ProjectDocument = require('../controllers/ProjectDocumentController');
const {translatedDoc} = require('../middleware/upload');
const authorize = require('../middleware/authorize');
const auth = require('../middleware/auth');

projectDocument.use(auth);

// projectDocument.post('/', authorize("Translator"),translatedDoc.single('image'), ProjectDocument.translatorProjectDocument);

module.exports = projectDocument;