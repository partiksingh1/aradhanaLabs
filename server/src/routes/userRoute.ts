import express from "express"
import { Login, Signup } from "../controllers/userController";

export const userRouter = express.Router();

userRouter.post("/signup", Signup)
userRouter.post("/login", Login)