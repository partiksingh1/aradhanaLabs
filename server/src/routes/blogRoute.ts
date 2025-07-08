import express from "express"
import { AddBlog, EditBlog, getAllBlogs, getBlogById } from "../controllers/blogController";
import { verifyToken } from "../middleware/verifyToken";
import { addComment, toggleLike } from "../controllers/activityController";

export const blogRouter = express.Router();

blogRouter.post("/blog", verifyToken, AddBlog)
blogRouter.put("/blog/:id", verifyToken, EditBlog)
blogRouter.get("/blogs", getAllBlogs)
blogRouter.get("/blog/:id", getBlogById)
blogRouter.post("/blog/:id/comment", verifyToken, addComment)
blogRouter.post("/blog/:id/like", verifyToken, toggleLike)