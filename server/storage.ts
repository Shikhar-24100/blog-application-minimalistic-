import { 
  type BlogPost, 
  type InsertBlogPost, 
  type UpdateBlogPost,
  type User,
  type UpsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoStorage } from "./mongodb-storage";

export interface IStorage {
  // Blog post operations
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  searchBlogPosts(query: string): Promise<BlogPost[]>;
  incrementViews(id: string): Promise<void>;
  
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private blogPosts: Map<string, BlogPost>;
  private users: Map<string, User>;

  constructor() {
    this.blogPosts = new Map();
    this.users = new Map();
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const now = new Date();
    
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = insertPost.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    
    const post: BlogPost = {
      ...insertPost,
      id,
      createdAt: now,
      updatedAt: now,
      readingTime: `${readingTime} min read`,
      views: "0",
    };
    
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) return undefined;

    const updatedPost: BlogPost = {
      ...existingPost,
      ...updates,
      updatedAt: new Date(),
    };

    // Recalculate reading time if content changed
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200));
      updatedPost.readingTime = `${readingTime} min read`;
    }

    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.blogPosts.values())
      .filter(post => 
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async incrementViews(id: string): Promise<void> {
    const post = this.blogPosts.get(id);
    if (post) {
      const currentViews = parseInt(post.views || "0");
      post.views = (currentViews + 1).toString();
      this.blogPosts.set(id, post);
    }
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingUser = this.users.get(userData.id!);
    
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(userData.id!, user);
    return user;
  }
}

// Use in-memory storage for now (MongoDB can be configured later)
export const storage = new MemStorage();
