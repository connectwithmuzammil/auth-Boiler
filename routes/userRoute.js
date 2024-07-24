import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

// ROUTE LEVEL MIDDLWARE - TO CHECK IF USER IS AUTHENTICATED
router.use('/changepassword', checkUserAuth);

//Public routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);

//Protected routes
router.post('/changepassword', UserController.changeUserPassword);

export default router;