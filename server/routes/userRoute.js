import express from 'express';

import authUser from '../middleware/authUser.js';
import { isAuth, login, logout, signup, updateProfile } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login)
userRouter.get('/is-auth', authUser ,isAuth)
userRouter.get('/logout', logout)
userRouter.put('/update-profile',authUser, updateProfile)







export default userRouter

