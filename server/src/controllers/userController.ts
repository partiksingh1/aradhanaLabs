import { Request, Response } from "express";
import { LoginSchema, SignupSchema } from "../model/Schema";
import prisma from "../db"
import bcrypt from 'bcrypt'
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
const saltRounds = 10;
dotenv.config();
export const Signup = async (req: Request, res: Response) => {
    const validation = SignupSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({
            message: "signup validation error",
            err: validation.error.format()
        })
        return;
    }
    try {
        const { username, email, password } = validation.data;
        const existingUser = await prisma.user.findFirst({
            where: { email }
        })
        if (existingUser) {
            res.status(400).json({
                message: "User already exists with this email",
            })
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = await prisma.user.create({
            data: {
                password: hashedPassword,
                email,
                username,
            }
        })
        if (user) {
            res.status(201).json({
                message: "User successfully created",
                user
            })
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            message: "Internal server Error in signup"
        })
    }
}
export const Login = async (req: Request, res: Response) => {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({
            message: "login validation failed",
            err: validation.error.format
        })
        return
    }
    try {
        const { email, password } = validation.data
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            res.status(404).json({
                message: "No user exists with this email, please check your email again"
            })
            return
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                message: "Incorrect Password, please try again"
            })
            return
        }
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            `${process.env.JWT_SECRET}`
        )
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })


    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            message: "Internal server Error in Login"
        })
    }
}
