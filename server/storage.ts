import type { SavedItem, Collection, Concept, InsertSavedItem, InsertCollection, UpdateSavedItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllItems(): Promise<SavedItem[]>;
  getItem(id: string): Promise<SavedItem | undefined>;
  createItem(insertData: InsertSavedItem, enrichedData: Omit<SavedItem, "id" | "savedAt" | "lastAccessed" | "readingProgress" | "notes" | "highlights" | "connections" | "isRead">): Promise<SavedItem>;
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
    this.seedDemoData();
  }

  private seedDemoData() {
    const demoItems: SavedItem[] = [
      {
        id: randomUUID(),
        url: "https://react.dev/learn/thinking-in-react",
        title: "Thinking in React - React Documentation",
        content: "React can change how you think about the designs you look at and the apps you build. When you build a user interface with React, you will first break it apart into pieces called components. Then, you will describe the different visual states for each of your components. Finally, you will connect your components together so that the data flows through them.",
        summary: "A comprehensive guide to understanding React's component-based architecture and how to think about building UIs the React way. Covers breaking down interfaces into components and managing data flow.",
        tags: ["React", "Frontend", "Tutorial", "JavaScript"],
        concepts: ["Components", "State Management", "Data Flow", "UI Design"],
        savedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 1 * 24 * 60 * 60 * 1000,
        readingProgress: 45,
        notes: "",
        highlights: [],
        connections: [],
        intent: "tutorial",
        expiresAt: null,
        domain: "react.dev",
        favicon: "https://react.dev/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        isRead: false,
      },
      {
        id: randomUUID(),
        url: "https://paulgraham.com/startupideas.html",
        title: "How to Get Startup Ideas - Paul Graham",
        content: "The way to get startup ideas is not to try to think of startup ideas. It's to look for problems, preferably problems you have yourself. The very best startup ideas tend to have three things in common: they're something the founders themselves want, that they themselves can build, and that few others realize are worth doing.",
        summary: "Paul Graham's essay on finding startup ideas organically by solving your own problems rather than brainstorming. Emphasizes building what you know and finding underserved markets.",
        tags: ["Startups", "Entrepreneurship", "Ideas", "Business"],
        concepts: ["Startup Ideas", "Problem Solving", "Market Opportunity", "Founder-Market Fit"],
        savedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 3 * 24 * 60 * 60 * 1000,
        readingProgress: 100,
        notes: "Key insight: solve your own problems first",
        highlights: [{ text: "The way to get startup ideas is not to try to think of startup ideas", position: 0 }],
        connections: [],
        intent: "reference",
        expiresAt: null,
        domain: "paulgraham.com",
        favicon: "https://paulgraham.com/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
        isRead: true,
      },
      {
        id: randomUUID(),
        url: "https://web.dev/performance-audits/",
        title: "Web Performance Optimization Guide",
        content: "Performance is about retaining users. It's about respecting users' time and making experiences feel faster. Studies show that 53% of mobile users abandon sites that take longer than 3 seconds to load. Fast sites have better engagement, conversion, and retention.",
        summary: "A practical guide to optimizing web performance covering loading times, core web vitals, and techniques for creating faster user experiences.",
        tags: ["Performance", "Web Development", "Optimization", "UX"],
        concepts: ["Core Web Vitals", "Loading Time", "User Experience", "Conversion"],
        savedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 5 * 24 * 60 * 60 * 1000,
        readingProgress: 0,
        notes: "",
        highlights: [],
        connections: [],
        intent: "read_later",
        expiresAt: null,
        domain: "web.dev",
        favicon: "https://web.dev/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        isRead: false,
      },
      {
        id: randomUUID(),
        url: "https://dribbble.com/shots/trending",
        title: "Trending Design Inspiration - Dribbble",
        content: "Discover the world's top designers & creatives. Dribbble is the leading destination to find & showcase creative work and home to the world's best design professionals.",
        summary: "Collection of trending design shots featuring modern UI patterns, color palettes, and innovative interaction designs from top designers worldwide.",
        tags: ["Design", "Inspiration", "UI/UX", "Visual Design"],
        concepts: ["Visual Design", "UI Patterns", "Color Theory", "Typography"],
        savedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now(),
        readingProgress: 0,
        notes: "",
        highlights: [],
        connections: [],
        intent: "inspiration",
        expiresAt: null,
        domain: "dribbble.com",
        favicon: "https://dribbble.com/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        isRead: false,
      },
      {
        id: randomUUID(),
        url: "https://docs.anthropic.com/claude/docs",
        title: "Claude API Documentation - Anthropic",
        content: "Claude is a family of large language models developed by Anthropic. The API allows you to integrate Claude into your applications for tasks like analysis, question answering, code generation, and creative writing.",
        summary: "Official documentation for integrating Claude AI into applications. Covers API endpoints, prompt engineering, and best practices for building AI-powered features.",
        tags: ["AI", "API", "Documentation", "LLM"],
        concepts: ["Large Language Models", "API Integration", "Prompt Engineering", "AI Safety"],
        savedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 1 * 24 * 60 * 60 * 1000,
        readingProgress: 60,
        notes: "",
        highlights: [],
        connections: [],
        intent: "reference",
        expiresAt: null,
        domain: "anthropic.com",
        favicon: "https://docs.anthropic.com/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        isRead: false,
      },
      {
        id: randomUUID(),
        url: "https://tailwindcss.com/docs/installation",
        title: "Getting Started with Tailwind CSS",
        content: "Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup. It works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles.",
        summary: "Installation guide and introduction to Tailwind CSS, covering setup, configuration, and the utility-first approach to styling web applications.",
        tags: ["CSS", "Tailwind", "Frontend", "Styling"],
        concepts: ["Utility-First CSS", "Responsive Design", "Design Systems", "Component Styling"],
        savedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 2 * 24 * 60 * 60 * 1000,
        readingProgress: 100,
        notes: "Great for rapid prototyping",
        highlights: [],
        connections: [],
        intent: "tutorial",
        expiresAt: null,
        domain: "tailwindcss.com",
        favicon: "https://tailwindcss.com/favicon.ico",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        isRead: true,
      },
    ];

    demoItems[0].connections = [demoItems[5].id];
    demoItems[5].connections = [demoItems[0].id];
    demoItems[1].connections = [demoItems[2].id];
    demoItems[4].connections = [demoItems[0].id, demoItems[5].id];

    demoItems.forEach((item) => this.items.set(item.id, item));
  }

  async getAllItems(): Promise<SavedItem[]> {
    return Array.from(this.items.values()).sort((a, b) => b.savedAt - a.savedAt);
  }

  async getItem(id: string): Promise<SavedItem | undefined> {
    return this.items.get(id);
  }

  async createItem(insertData: InsertSavedItem, enrichedData: Omit<SavedItem, "id" | "savedAt" | "lastAccessed" | "readingProgress" | "notes" | "highlights" | "connections" | "isRead">): Promise<SavedItem> {
    const id = randomUUID();
    const now = Date.now();
    const newItem: SavedItem = {
      id,
      url: insertData.url,
      intent: insertData.intent,
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
