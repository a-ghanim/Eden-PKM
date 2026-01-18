import type { SavedItem, Collection, Concept, InsertSavedItem, InsertCollection, UpdateSavedItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllItems(): Promise<SavedItem[]>;
  getItem(id: string): Promise<SavedItem | undefined>;
  createItem(insertData: InsertSavedItem, enrichedData: { title: string; content: string; summary: string; tags: string[]; concepts: string[]; domain: string; favicon?: string; imageUrl?: string; expiresAt: number | null }): Promise<SavedItem>;
  updateItem(id: string, updates: UpdateSavedItem): Promise<SavedItem | undefined>;
  deleteItem(id: string): Promise<boolean>;
  searchItems(query: string): Promise<SavedItem[]>;
  
  getAllCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  getAllConcepts(): Promise<Concept[]>;
}

export class MemStorage implements IStorage {
  private items: Map<string, SavedItem>;
  private collections: Map<string, Collection>;
  private concepts: Map<string, Concept>;

  constructor() {
    this.items = new Map();
    this.collections = new Map();
    this.concepts = new Map();
  }

  async getAllItems(): Promise<SavedItem[]> {
    return Array.from(this.items.values()).sort((a, b) => b.savedAt - a.savedAt);
  }

  async getItem(id: string): Promise<SavedItem | undefined> {
    return this.items.get(id);
  }

  async createItem(insertData: InsertSavedItem, enrichedData: { title: string; content: string; summary: string; tags: string[]; concepts: string[]; domain: string; favicon?: string; imageUrl?: string; expiresAt: number | null }): Promise<SavedItem> {
    const id = randomUUID();
    const now = Date.now();
    const newItem: SavedItem = {
      id,
      url: insertData.url,
      title: enrichedData.title,
      content: enrichedData.content,
      summary: enrichedData.summary,
      tags: enrichedData.tags,
      concepts: enrichedData.concepts,
      domain: enrichedData.domain,
      favicon: enrichedData.favicon,
      imageUrl: enrichedData.imageUrl,
      expiresAt: enrichedData.expiresAt,
      savedAt: now,
      lastAccessed: now,
      readingProgress: 0,
      notes: "",
      highlights: [],
      connections: [],
      isRead: false,
    };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: string, updates: UpdateSavedItem): Promise<SavedItem | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem: SavedItem = { ...item, ...updates, lastAccessed: Date.now() };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async searchItems(query: string): Promise<SavedItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.summary.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        item.concepts.some((concept) => concept.toLowerCase().includes(lowerQuery))
    );
  }

  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const newCollection: Collection = {
      ...collection,
      id,
      createdAt: Date.now(),
    };
    this.collections.set(id, newCollection);
    return newCollection;
  }

  async getAllConcepts(): Promise<Concept[]> {
    return Array.from(this.concepts.values());
  }
}

export const storage = new MemStorage();
