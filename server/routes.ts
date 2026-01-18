import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { insertSavedItemSchema, updateSavedItemSchema, chatRequestSchema, type InsertSavedItem, type SavedItem } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "text/html",
      "text/plain",
      "text/markdown",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(html|htm|txt|md|pdf|doc|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload HTML, PDF, TXT, MD, or DOC files."));
    }
  },
});

async function extractContentFromFile(buffer: Buffer, filename: string, mimetype: string): Promise<{ title: string; content: string }> {
  const ext = filename.toLowerCase().split(".").pop() || "";
  
  if (mimetype === "application/pdf" || ext === "pdf") {
    try {
      const data = await pdfParse(buffer);
      const title = filename.replace(/\.pdf$/i, "");
      return {
        title,
        content: data.text.slice(0, 50000),
      };
    } catch (error) {
      throw new Error("Failed to parse PDF file");
    }
  }
  
  if (mimetype === "text/html" || ext === "html" || ext === "htm") {
    const htmlContent = buffer.toString("utf-8");
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.(html|htm)$/i, "");
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      title,
      content: textContent.slice(0, 50000),
    };
  }
  
  if (mimetype === "text/plain" || mimetype === "text/markdown" || ext === "txt" || ext === "md") {
    const textContent = buffer.toString("utf-8");
    const title = filename.replace(/\.(txt|md)$/i, "");
    return {
      title,
      content: textContent.slice(0, 50000),
    };
  }
  
  if (mimetype.includes("msword") || mimetype.includes("wordprocessingml") || ext === "doc" || ext === "docx") {
    const title = filename.replace(/\.(doc|docx)$/i, "");
    return {
      title,
      content: `[Document content from ${filename}. Full extraction requires specialized processing.]`,
    };
  }
  
  throw new Error(`Unsupported file type: ${mimetype}`);
}

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

async function extractContentFromUrl(url: string): Promise<{ title: string; content: string; domain: string; favicon: string; imageUrl?: string }> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    
    return {
      title: `Content from ${domain}`,
      content: `This is captured content from ${url}. In a production environment, we would fetch and parse the actual webpage content here.`,
      domain,
      favicon,
      imageUrl: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800`,
    };
  } catch (error) {
    throw new Error("Invalid URL provided");
  }
}

async function analyzeContentWithAI(content: string, title: string): Promise<{
  summary: string;
  tags: string[];
  concepts: string[];
  intent: "read_later" | "reference" | "inspiration" | "tutorial";
}> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze this web content and provide:
1. A concise 2-3 sentence summary
2. 3-5 relevant tags (single words or short phrases)
3. 3-5 key concepts mentioned (people, technologies, companies, ideas)
4. The most appropriate intent category:
   - "read_later": Articles, blog posts, long-form content to read when you have time
   - "reference": Documentation, API docs, technical references to look up later
   - "inspiration": Design examples, portfolios, creative work, visual inspiration
   - "tutorial": How-to guides, step-by-step instructions, courses, learning materials

Title: ${title}
Content: ${content.slice(0, 2000)}

Respond in JSON format:
{
  "summary": "...",
  "tags": ["...", "..."],
  "concepts": ["...", "..."],
  "intent": "read_later" | "reference" | "inspiration" | "tutorial"
}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      summary: "Content saved for later reading.",
      tags: ["Uncategorized"],
      concepts: [],
      intent: "read_later" as const,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      summary: "Content captured successfully. AI analysis unavailable.",
      tags: ["Uncategorized"],
      concepts: [],
      intent: "read_later" as const,
    };
  }
}

async function findConnectionsWithAI(newItem: { title: string; summary: string; tags: string[]; concepts: string[] }, existingItems: { id: string; title: string; summary: string; tags: string[]; concepts: string[] }[]): Promise<string[]> {
  if (existingItems.length === 0) return [];
  
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Find connections between a new item and existing items based on related topics, concepts, or themes.

New Item:
Title: ${newItem.title}
Summary: ${newItem.summary}
Tags: ${newItem.tags.join(", ")}
Concepts: ${newItem.concepts.join(", ")}

Existing Items:
${existingItems.map((item, i) => `${i + 1}. ID: ${item.id}, Title: ${item.title}, Tags: ${item.tags.join(", ")}`).join("\n")}

Return a JSON array of IDs that are related to the new item (max 3):
["id1", "id2"]`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Connection finding failed:", error);
    return [];
  }
}

async function chatWithAI(message: string, items: { id: string; title: string; summary: string; tags: string[]; concepts: string[]; url: string }[]): Promise<string> {
  try {
    const itemContext = items.slice(0, 20).map((item) => 
      `- "${item.title}" (${item.tags.join(", ")}): ${item.summary}`
    ).join("\n");

    const aiMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are Eden, an intelligent personal knowledge management assistant. You help users navigate their saved content, find connections, and get insights.

The user has saved these items:
${itemContext || "No items saved yet."}

User question: ${message}

Provide a helpful, conversational response. If referring to specific saved items, mention them by title. Be concise but thorough.`,
        },
      ],
    });

    return aiMessage.content[0].type === "text" ? aiMessage.content[0].text : "I couldn't process that request.";
  } catch (error) {
    console.error("Chat failed:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/items", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.post("/api/items/capture", async (req: Request, res: Response) => {
    try {
      const parseResult = insertSavedItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }

      const insertData: InsertSavedItem = parseResult.data;
      
      const extracted = await extractContentFromUrl(insertData.url);
      
      const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
      
      const existingItems = await storage.getAllItems();
      const connections = await findConnectionsWithAI(
        { title: extracted.title, summary: analysis.summary, tags: analysis.tags, concepts: analysis.concepts },
        existingItems.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          tags: item.tags,
          concepts: item.concepts,
        }))
      );

      const enrichedData = {
        title: extracted.title,
        content: extracted.content,
        summary: analysis.summary,
        tags: analysis.tags,
        concepts: analysis.concepts,
        domain: extracted.domain,
        favicon: extracted.favicon,
        imageUrl: extracted.imageUrl,
        expiresAt: null,
      };

      const newItem = await storage.createItem(insertData, enrichedData);

      if (connections.length > 0) {
        await storage.updateItem(newItem.id, { connections });
        for (const connId of connections) {
          const connItem = await storage.getItem(connId);
          if (connItem && !connItem.connections.includes(newItem.id)) {
            await storage.updateItem(connId, {
              connections: [...connItem.connections, newItem.id],
            });
          }
        }
      }

      const updatedItem = await storage.getItem(newItem.id);
      res.status(201).json(updatedItem);
    } catch (error) {
      console.error("Capture error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to capture URL" });
    }
  });

  app.patch("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const parseResult = updateSavedItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }

      const updated = await storage.updateItem(req.params.id, parseResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const results = await storage.searchItems(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const parseResult = chatRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }

      const { message, items } = parseResult.data;
      const response = await chatWithAI(message, items || []);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  app.get("/api/collections", async (req: Request, res: Response) => {
    try {
      const collections = await storage.getAllCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/concepts", async (req: Request, res: Response) => {
    try {
      const concepts = await storage.getAllConcepts();
      res.json(concepts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch concepts" });
    }
  });

  app.post("/api/items/batch", async (req: Request, res: Response) => {
    try {
      const { urls, intent } = req.body as { urls: string[]; intent: string };
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array is required" });
      }

      if (urls.length > 20) {
        return res.status(400).json({ error: "Maximum 20 URLs per batch" });
      }

      const validIntents = ["read_later", "reference", "inspiration", "tutorial"];
      const safeIntent = validIntents.includes(intent) ? intent : "read_later";

      const results: { url: string; success: boolean; item?: SavedItem; error?: string }[] = [];

      for (const url of urls) {
        try {
          const trimmedUrl = url.trim();
          if (!trimmedUrl) continue;

          const extracted = await extractContentFromUrl(trimmedUrl);
          const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
          
          const existingItems = await storage.getAllItems();
          const connections = await findConnectionsWithAI(
            { title: extracted.title, summary: analysis.summary, tags: analysis.tags, concepts: analysis.concepts },
            existingItems.map((item) => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              tags: item.tags,
              concepts: item.concepts,
            }))
          );

          const enrichedData = {
            title: extracted.title,
            content: extracted.content,
            summary: analysis.summary,
            tags: analysis.tags,
            concepts: analysis.concepts,
            domain: extracted.domain,
            favicon: extracted.favicon,
            imageUrl: extracted.imageUrl,
            expiresAt: null,
          };

          const parseResult = insertSavedItemSchema.safeParse({ url: trimmedUrl, intent: safeIntent });
          if (!parseResult.success) {
            throw new Error(fromZodError(parseResult.error).message);
          }

          const newItem = await storage.createItem(parseResult.data, enrichedData);

          if (connections.length > 0) {
            await storage.updateItem(newItem.id, { connections });
            for (const connId of connections) {
              const connItem = await storage.getItem(connId);
              if (connItem && !connItem.connections.includes(newItem.id)) {
                await storage.updateItem(connId, {
                  connections: [...connItem.connections, newItem.id],
                });
              }
            }
          }

          const updatedItem = await storage.getItem(newItem.id);
          results.push({ url: trimmedUrl, success: true, item: updatedItem! });
        } catch (error) {
          results.push({ 
            url, 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to process URL" 
          });
        }
      }

      res.status(201).json({
        total: urls.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    } catch (error) {
      console.error("Batch import error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Batch import failed" });
    }
  });

  app.post("/api/items/upload", upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results: { fileName: string; success: boolean; item?: SavedItem; error?: string }[] = [];
      const existingItems = await storage.getAllItems();

      for (const file of files) {
        try {
          const extracted = await extractContentFromFile(file.buffer, file.originalname, file.mimetype);
          const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
          
          const connections = await findConnectionsWithAI(
            { title: extracted.title, summary: analysis.summary, tags: analysis.tags, concepts: analysis.concepts },
            existingItems.map((item) => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              tags: item.tags,
              concepts: item.concepts,
            }))
          );

          const fileUrl = `file://${encodeURIComponent(file.originalname)}`;
          
          const parseResult = insertSavedItemSchema.safeParse({ url: fileUrl, intent: analysis.intent });
          if (!parseResult.success) {
            throw new Error(fromZodError(parseResult.error).message);
          }

          const enrichedData = {
            title: extracted.title,
            content: extracted.content,
            summary: analysis.summary,
            tags: analysis.tags,
            concepts: analysis.concepts,
            domain: "local",
            favicon: undefined,
            imageUrl: undefined,
            expiresAt: null,
          };

          const newItem = await storage.createItem(parseResult.data, enrichedData);

          if (connections.length > 0) {
            await storage.updateItem(newItem.id, { connections });
            for (const connId of connections) {
              const connItem = await storage.getItem(connId);
              if (connItem && !connItem.connections.includes(newItem.id)) {
                await storage.updateItem(connId, {
                  connections: [...connItem.connections, newItem.id],
                });
              }
            }
          }

          const updatedItem = await storage.getItem(newItem.id);
          results.push({ fileName: file.originalname, success: true, item: updatedItem! });
        } catch (error) {
          results.push({
            fileName: file.originalname,
            success: false,
            error: error instanceof Error ? error.message : "Failed to process file",
          });
        }
      }

      res.status(201).json({
        total: files.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "File upload failed" });
    }
  });

  return httpServer;
}
