import express from "express";
import { login, logout, register } from "../controllers/authController.js";
import validateBody from "../middlewares/validateBody.js";
import { registerSchema } from "../schemas/userSchema.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post('/register', validateBody(registerSchema), register)
authRouter.post('/login', login);
authRouter.post('/logout', authenticate ,logout);


export default authRouter;
