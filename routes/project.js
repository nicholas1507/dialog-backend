const projectRoute = require('express').Router();
const ProjectController = require('../controllers/ProjectController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {sourceDoc,uploadPayment,translatedDoc} = require('../middleware/upload');
const ProjectCandidateController = require('../controllers/ProjectCandidateController');
const PaymentController = require('../controllers/PaymentController');
const ProjectDocumentController = require('../controllers/ProjectDocumentController');
projectRoute.use(auth);

// Login Only
projectRoute.get('/translatorProject',authorize("Translator"),ProjectController.getTranslatorProjects);
projectRoute.get('/availableProjects',authorize("Translator"),ProjectController.getAvailableProjects);
projectRoute.post('/:projectId/applications', authorize("Translator"), ProjectCandidateController.createApplication);

// Client Routes
projectRoute.get('/me',authorize("Client"),ProjectController.getMyProjects);
projectRoute.get('/:id', authorize("Client","Translator","Admin"),ProjectController.getProjectById);
projectRoute.post('/', authorize("Client"), sourceDoc.single('file'),ProjectController.createProject);
projectRoute.patch('/:projectId/:candidateId/approved', authorize("Client"), ProjectController.approveCandidate);
projectRoute.patch('/:projectId/approved', authorize("Client"), ProjectController.approveProject);
projectRoute.patch('/:projecrId', authorize("Client"), ProjectController.editProject);
projectRoute.post('/:translatorId/invitations', authorize("Client"), ProjectCandidateController.createInvitation);
projectRoute.post('/:projectId/payment', authorize("Client"), uploadPayment.single('image'),PaymentController.createPayment);
projectRoute.get('/:projectId/candidates', authorize("Client","Translator"), ProjectCandidateController.getMyProjectCandidate);

// Translator Routes
projectRoute.post('/:projectId/documents', authorize("Translator"),translatedDoc.single('file'), ProjectDocumentController.translatorProjectDocument);

// Admin Routes
// projectRoute.put('/:id/status', authorize("Admin"), ProjectController.updateProjectStatus);
projectRoute.get('/', authorize("Admin"),ProjectController.getProject);

module.exports = projectRoute;