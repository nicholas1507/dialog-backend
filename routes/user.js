const userRoute = require('express').Router();
const UserController = require('../controllers/UserController');
const ProfileController = require('../controllers/ProfileController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {uploadProfile} = require('../middleware/upload');

userRoute.use(auth);

// Profile Routes
userRoute.get('/me/profile', ProfileController.getMyProfile);
userRoute.post('/me/profile', uploadProfile.single('image'), ProfileController.createProfile);
userRoute.patch('/me/profile', uploadProfile.single('image'), ProfileController.updateMyProfil);

// Admin Routes
userRoute.get('/', authorize("Admin"), UserController.getAllUsers);
userRoute.post('/', authorize("Admin"), UserController.createUser);
userRoute.put('/:id', authorize("Admin"), UserController.updateUser);
userRoute.put('/profile/:id', authorize("Admin"), uploadProfile.single('image'), ProfileController.updateProfileByAdmin);
userRoute.delete('/:id', authorize("Admin"), UserController.deleteUser);
userRoute.delete('/profile/:id', authorize("Admin"), ProfileController.deleteProfile);

// User Routes
userRoute.get('/me', UserController.getMyUser);
userRoute.get('/:id', UserController.getUserById);
userRoute.patch('/me', UserController.updateMyUser);




module.exports = userRoute;