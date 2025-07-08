import { Request, Response } from "express"
import prisma from "../db"
import { BlogSchema } from "../model/Schema";
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        username: string;
    };
}
export const AddBlog = async (req: AuthenticatedRequest, res: Response) => {
    const validation = BlogSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({
            message: "blog addition validation error",
            err: validation.error.format()
        })
        return
    }
    try {
        const user = req.user;
        if (!user || !user.id) {
            res.status(401).json({ message: "Unauthorized" }); return;
        }
        const { title, content, imgUrl } = validation.data
        const blog = await prisma.blog.create({
            data: {
                title: title,
                content: content,
                authorId: user.id,
                imgUrl: imgUrl
            }
        })
        if (!blog) {
            res.status(400).json({ message: "Not able to add blog" })
        }
        else {
            res.status(201).json({ message: "Blog added successfully", blog })
        }

    } catch (error) {
        res.status(500).send({ message: "Internal server error in adding the blog" })
    }
}
export const EditBlog = async (req: AuthenticatedRequest, res: Response) => {
    const blogId = req.params.id;
    if (!blogId) {
        res.status(400).json({ message: "Blog ID is required in the URL" });
        return
    }

    const validation = BlogSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({
            message: "Blog update validation error",
            err: validation.error.format()
        });
        return
    }

    try {
        const user = req.user;

        if (!user || !user.id) {
            res.status(401).json({ message: "Unauthorized" }); return;
        }

        const { title, content, imgUrl } = validation.data;

        const existingBlog = await prisma.blog.findUnique({
            where: { id: Number(blogId) },
        });

        if (!existingBlog) {
            res.status(404).json({ message: "Blog not found" });
            return
        }
        if (existingBlog.authorId !== user.id) {
            res.status(403).json({ message: "Unauthorized to edit this blog" });
            return
        }

        const updatedBlog = await prisma.blog.update({
            where: { id: Number(blogId) },
            data: {
                title,
                content,
                imgUrl,
            },
        });

        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
        return

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error in editing the blog" });
        return
    }
};
export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await prisma.blog.findMany({
            include: {
                author: {
                    select: { id: true, username: true, email: true }
                },
                comments: true,
                like: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ blogs });
        return;
    } catch (error) {
        console.error("getAllBlogs error:", error);
        res.status(500).json({ message: "Internal server error while fetching blogs" });
        return;
    }
};
export const getBlogById = async (req: Request, res: Response) => {
    const blogId = req.params.id;

    if (!blogId) {
        res.status(400).json({ message: "Blog ID is required" });
        return;
    }

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: Number(blogId) },
            include: {
                author: {
                    select: { id: true, username: true, email: true }
                },
                comments: {
                    include: {
                        author: {
                            select: { id: true, username: true }
                        }
                    }
                },
                like: true,
            }
        });

        if (!blog) {
            res.status(404).json({ message: "Blog not found" }); return;
        }

        res.status(200).json({ blog });
    } catch (error) {
        console.error("getBlogById error:", error);
        res.status(500).json({ message: "Internal server error while fetching blog" }); return;
    }
};
export const deleteBlog = async (req: AuthenticatedRequest, res: Response) => {
    const blogId = req.params.id;

    if (!blogId) {
        res.status(400).json({ message: "Blog ID is required" }); return;
    }

    try {
        const user = req.user;
        if (!user || !user.id) {
            res.status(401).json({ message: "Unauthorized" }); return;
        }

        const existingBlog = await prisma.blog.findUnique({
            where: { id: Number(blogId) }
        });

        if (!existingBlog) {
            res.status(404).json({ message: "Blog not found" }); return
        }

        if (existingBlog.authorId !== user.id) {
            res.status(403).json({ message: "You are not authorized to delete this blog" }); return
        }
        await prisma.blog.delete({
            where: { id: Number(blogId) }
        });
        res.status(200).json({ message: "Blog deleted successfully" }); return

    } catch (error) {
        console.error("deleteBlog error:", error);
        res.status(500).json({ message: "Internal server error while deleting blog" }); return
    }
};



