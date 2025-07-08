import { Request, Response } from "express"
import prisma from "../db"
import { BlogSchema } from "../model/Schema";
import { ai } from "../utils/genAi";
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        username: string;
    };
}
export const addComment = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.id) {
        res.status(401).json({ message: "Unauthorized" }); return
    }

    const blogId = req.params.id;
    const { content } = req.body;

    if (!blogId || !content || typeof content !== "string") {
        res.status(400).json({ message: "Blog ID and content are required" }); return
    }

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: Number(blogId) }
        });

        if (!blog) {
            res.status(404).json({ message: "Blog post not found" }); return
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                blogId: blog.id,
                authorId: user.id
            }
        });
        res.status(201).json({ message: "Comment added successfully", comment }); return
    } catch (error) {
        console.error("addComment error:", error);
        res.status(500).json({ message: "Internal server error while adding comment" });
        return
    }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.id) {
        res.status(401).json({ message: "Unauthorized" }); return
    }
    const blogId = req.params.id;
    if (!blogId) {
        res.status(400).json({ message: "Blog ID is required" }); return
    }
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: Number(blogId) }
        });
        if (!blog) {
            res.status(404).json({ message: "Blog not found" }); return
        }
        const existingLike = await prisma.like.findUnique({
            where: {
                authorId_blogId: {
                    authorId: user.id,
                    blogId: blog.id
                }
            }
        });
        if (existingLike) {
            await prisma.like.delete({
                where: {
                    authorId_blogId: {
                        authorId: user.id,
                        blogId: blog.id
                    }
                }
            });
            res.status(200).json({ message: "Post unliked" }); return
        } else {
            const like = await prisma.like.create({
                data: {
                    authorId: user.id,
                    blogId: blog.id
                }
            });
            res.status(201).json({ message: "Post liked", like }); return
        }
    } catch (error) {
        console.error("toggleLike error:", error);
        res.status(500).json({ message: "Internal server error while toggling like" }); return
    }
};

export const generateAiContent = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.id) {
        res.status(401).json({ message: "Unauthorized" }); return
    }

    try {
        const blogIdeas = await getAiBlogIdeas("Give me 2 blog ideas. Each should have a title and a summary. Format:\n1. Title: ...\nSummary: ...");

        if (!blogIdeas || blogIdeas.length === 0) {
            res.status(500).json({ message: "Failed to generate AI blog ideas" }); return
        }

        res.status(200).json({
            message: "Blog ideas generated successfully",
            ideas: blogIdeas,
        });

    } catch (error) {
        console.error("AI content generation error:", error);
        res.status(500).json({ message: "Internal error generating blog ideas" });
    }
};

async function getAiBlogIdeas(prompt: string): Promise<{ title: string; summary: string }[] | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const rawText = response.text;
        if (!rawText) return null;

        const lines = rawText.split("\n").map(line => line.trim()).filter(Boolean);

        const ideas: { title: string; summary: string }[] = [];

        for (let i = 0; i < lines.length; i++) {
            const titleMatch = lines[i].match(/^\d+\.\s+\*\*Title:\s*(.*?)\*\*/i);
            const summaryMatch = lines[i + 1]?.match(/^Summary:\s*(.*)/i);

            if (titleMatch && summaryMatch) {
                ideas.push({
                    title: titleMatch[1].trim(),
                    summary: summaryMatch[1].trim()
                });
                i++; // skip summary line
            }
        }

        return ideas.length > 0 ? ideas : null;

    } catch (error) {
        console.error("getAiBlogIdeas error:", error);
        return null;
    }
}



