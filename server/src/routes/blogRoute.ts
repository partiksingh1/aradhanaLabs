import express from "express"
import { AddBlog, EditBlog, getAllBlogs, getBlogById } from "../controllers/blogController";
import { verifyToken } from "../middleware/verifyToken";

export const blogRouter = express.Router();

blogRouter.post("/blog", verifyToken, AddBlog)
blogRouter.put("/blog/:id", verifyToken, EditBlog)
blogRouter.get("/blogs", getAllBlogs)
blogRouter.get("/blog/:id", getBlogById)