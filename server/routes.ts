import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBlogPostSchema, updateBlogPostSchema } from "@shared/schema";
import { z } from "zod";

// Simple authentication middleware
const isOwner = (req: any, res: any, next: any) => {
  const authKey = req.headers['x-auth-key'] || req.query.key;
  const ownerKey = process.env.OWNER_KEY;
  
  if (!ownerKey) {
    return res.status(500).json({ message: "Owner key not configured" });
  }
  
  if (authKey !== ownerKey) {
    return res.status(403).json({ message: "Access denied. Owner only." });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if user is owner (for frontend)
  app.get("/api/auth/check", (req, res) => {
    const authKey = req.headers['x-auth-key'] || req.query.key;
    const ownerKey = process.env.OWNER_KEY;
    const isOwner = ownerKey && authKey === ownerKey;
    res.json({ isOwner });
  });
  // Get all blog posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Search blog posts
  app.get("/api/posts/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const posts = await storage.searchBlogPosts(query);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Get single blog post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementViews(id);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create new blog post (owner only)
  app.post("/api/posts", isOwner, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update blog post (owner only)
  app.patch("/api/posts/:id", isOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete blog post (owner only)
  app.delete("/api/posts/:id", isOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(id);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
