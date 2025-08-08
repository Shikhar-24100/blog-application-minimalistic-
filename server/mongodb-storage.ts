import { MongoClient, Db, Collection } from 'mongodb';
import { type BlogPost, type InsertBlogPost, type UpdateBlogPost } from "@shared/schema";
import { IStorage } from "./storage";
import { randomUUID } from "crypto";

interface BlogPostDoc {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  readingTime?: string | null;
  views: string;
}

export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<BlogPostDoc> | null = null;
  private isConnected = false;

  constructor(private connectionString: string = 'mongodb://localhost:27017/miniblog') {}

  private async connect(): Promise<void> {
    if (this.isConnected && this.collection) return;

    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db();
      this.collection = this.db.collection<BlogPostDoc>('blog_posts');
      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async ensureConnection(): Promise<Collection<BlogPostDoc>> {
    if (!this.isConnected || !this.collection) {
      await this.connect();
    }
    if (!this.collection) {
      throw new Error('Failed to establish MongoDB connection');
    }
    return this.collection;
  }

  private docToBlogPost(doc: BlogPostDoc): BlogPost {
    return {
      id: doc._id,
      title: doc.title,
      content: doc.content,
      excerpt: doc.excerpt,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      readingTime: doc.readingTime,
      views: doc.views,
    };
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    const collection = await this.ensureConnection();
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(doc => this.docToBlogPost(doc));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const collection = await this.ensureConnection();
    const doc = await collection.findOne({ _id: id });
    return doc ? this.docToBlogPost(doc) : undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const collection = await this.ensureConnection();
    const id = randomUUID();
    const now = new Date();
    
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = insertPost.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    
    const doc: BlogPostDoc = {
      _id: id,
      ...insertPost,
      createdAt: now,
      updatedAt: now,
      readingTime: `${readingTime} min read`,
      views: "0",
    };
    
    await collection.insertOne(doc);
    return this.docToBlogPost(doc);
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const collection = await this.ensureConnection();
    const updateDoc: Partial<BlogPostDoc> = {
      ...updates,
      updatedAt: new Date(),
    };

    // Recalculate reading time if content changed
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200));
      updateDoc.readingTime = `${readingTime} min read`;
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    return result ? this.docToBlogPost(result) : undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const collection = await this.ensureConnection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const collection = await this.ensureConnection();
    const regex = new RegExp(query, 'i');
    const docs = await collection.find({
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { excerpt: { $regex: regex } }
      ]
    }).sort({ createdAt: -1 }).toArray();
    
    return docs.map(doc => this.docToBlogPost(doc));
  }

  async incrementViews(id: string): Promise<void> {
    const collection = await this.ensureConnection();
    const post = await collection.findOne({ _id: id });
    if (post) {
      const currentViews = parseInt(post.views || "0");
      await collection.updateOne(
        { _id: id },
        { $set: { views: (currentViews + 1).toString() } }
      );
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }
}