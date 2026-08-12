const router = require('express').Router();

// Import routes
const authRoute = require('./auth');
const userRoute = require('./user');
const roleRoute = require('./role');
const translatorRoute = require('./translator');
const languageRoute = require('./language');
const specializationRoute = require('./specialization');
const projectRoute = require('./project');
const projectDocumentRoute = require('./projectDocument');
const projectCandidateRoute = require('./projectCandidate');
const paymentRoute = require('./payment');

// Dashboard info
router.get('/', (req, res) => {
    res.json({ message: "DASHBOARD DIALOG" });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);
router.use('/translators', translatorRoute);
router.use('/languages', languageRoute);
router.use('/specializations', specializationRoute);
router.use('/projects', projectRoute);
router.use('/payments', paymentRoute);
router.use('/project-documents', projectDocumentRoute);
// router.use('/reviews', reviewRoute);

module.exports = router;