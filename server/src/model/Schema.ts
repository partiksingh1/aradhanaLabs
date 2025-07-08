import { z } from 'zod'

export const SignupSchema = z.object({
    username: z.string().min(4).max(20),
    email: z.string().email(),
    password: z.string().min(3),
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3)
})

export const BlogSchema = z.object({
    title: z.string().min(3),
    content: z.string(),
    imgUrl: z.string().optional()
})