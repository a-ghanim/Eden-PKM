import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./replit_integrations/auth";
import multer from "multer";
import pLimit from "p-limit";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
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

function isBookmarksFile(htmlContent: string): boolean {
  const lowerContent = htmlContent.toLowerCase();
  return lowerContent.includes("netscape-bookmark-file") || 
         (lowerContent.includes("<dt><a href=") && lowerContent.includes("<dl>")) ||
         (lowerContent.includes("<a href=") && lowerContent.includes("add_date="));
}

function extractBookmarkUrls(htmlContent: string): { url: string; title: string }[] {
  const bookmarks: { url: string; title: string }[] = [];
  const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    const title = match[2].trim() || url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      bookmarks.push({ url, title });
    }
  }
  
  return bookmarks;
}

async function extractContentFromFile(buffer: Buffer, filename: string, mimetype: string): Promise<{ title: string; content: string; isBookmarks?: boolean; bookmarkUrls?: { url: string; title: string }[] }> {
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
    
    if (isBookmarksFile(htmlContent)) {
      const bookmarkUrls = extractBookmarkUrls(htmlContent);
      if (bookmarkUrls.length > 0) {
        return {
          title: "Bookmarks Import",
          content: `Found ${bookmarkUrls.length} bookmarks to import`,
          isBookmarks: true,
          bookmarkUrls,
        };
      }
    }
    
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
  apiKey: process.env.ANTHROPIC_API_KEY,
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
}> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Analyze: "${title}"
${content.slice(0, 1500)}

JSON only: {"summary":"2 sentences max","tags":["3-5 topic tags"],"concepts":["3-5 key entities/ideas"]}`,
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
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      summary: "Content captured successfully. AI analysis unavailable.",
      tags: ["Uncategorized"],
      concepts: [],
    };
  }
}

async function findConnectionsWithAI(newItem: { title: string; summary: string; tags: string[]; concepts: string[] }, existingItems: { id: string; title: string; summary: string; tags: string[]; concepts: string[] }[]): Promise<{ connections: string[]; reasons: Record<string, string> }> {
  if (existingItems.length === 0) return { connections: [], reasons: {} };
  
  try {
    const itemList = existingItems.slice(0, 10).map((item) => 
      `${item.id}|${item.title}|${item.tags.slice(0, 3).join(",")}`
    ).join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `New: "${newItem.title}" [${newItem.tags.join(",")}]
Items:\n${itemList}

JSON: {"connections":{"id":"why connected"}} max 3`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.connections && typeof parsed.connections === "object") {
        return {
          connections: Object.keys(parsed.connections),
          reasons: parsed.connections,
        };
      }
    }
    return { connections: [], reasons: {} };
  } catch (error) {
    console.error("Connection finding failed:", error);
    return { connections: [], reasons: {} };
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
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/auth/token", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const token = await authStorage.getOrCreateApiToken(userId);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: "Failed to get API token" });
    }
  });

  app.get("/api/items", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getItemsByUser(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const id = req.params.id as string;
      const item = await storage.getItem(id, userId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.get("/api/bookmarklet/save", async (req: Request, res: Response) => {
    const url = req.query.url as string;
    const title = req.query.title as string;
    const callback = req.query.callback as string;
    const token = req.query.token as string;

    if (callback) {
      const safeCallbackRegex = /^[_$a-zA-Z][_$0-9a-zA-Z]*$/;
      if (!safeCallbackRegex.test(callback)) {
        res.status(400).send("Invalid callback parameter");
        return;
      }

      res.setHeader("Content-Type", "application/javascript");

      if (!token) {
        res.send(`${callback}(${JSON.stringify({ success: false, error: "API token required. Get your token from Settings." })})`);
        return;
      }

      const user = await authStorage.getUserByApiToken(token);
      if (!user) {
        res.send(`${callback}(${JSON.stringify({ success: false, error: "Invalid API token" })})`);
        return;
      }

      const userId = user.id;
      
      if (!url || !url.startsWith("http")) {
        res.send(`${callback}(${JSON.stringify({ success: false, error: "Invalid URL" })})`);
        return;
      }

      try {
        const parseResult = insertSavedItemSchema.safeParse({ url });
        if (!parseResult.success) {
          res.send(`${callback}(${JSON.stringify({ success: false, error: "Invalid URL format" })})`);
          return;
        }

        const extracted = await extractContentFromUrl(url);
        const analysis = await analyzeContentWithAI(extracted.content, title || extracted.title);

        const enrichedData = {
          title: title || extracted.title,
          content: extracted.content,
          summary: analysis.summary,
          tags: analysis.tags,
          concepts: analysis.concepts,
          domain: extracted.domain,
          favicon: extracted.favicon,
          imageUrl: extracted.imageUrl,
          expiresAt: null,
        };

        const newItem = await storage.createItem(userId, parseResult.data, enrichedData);

        storage.getItemsByUser(userId).then(async (existingItems) => {
          if (existingItems.length > 1) {
            const connectionResult = await findConnectionsWithAI(
              { title: newItem.title, summary: newItem.summary, tags: newItem.tags, concepts: newItem.concepts },
              existingItems.filter(i => i.id !== newItem.id).slice(0, 10).map((item) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                tags: item.tags,
                concepts: item.concepts,
              }))
            );
            if (connectionResult.connections.length > 0) {
              await storage.updateItem(newItem.id, userId, { 
                connections: connectionResult.connections,
                connectionReasons: connectionResult.reasons,
              });
            }
          }
        }).catch(() => {});

        res.send(`${callback}(${JSON.stringify({ 
          success: true, 
          item: { id: newItem.id, title: newItem.title, summary: newItem.summary }
        })})`);
      } catch (error) {
        res.send(`${callback}(${JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to save" 
        })})`);
      }
      return;
    }

    res.redirect(`/?saved=${encodeURIComponent(url || "")}`);
  });

  app.post("/api/items/capture", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const parseResult = insertSavedItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }

      const insertData: InsertSavedItem = parseResult.data;
      
      const extracted = await extractContentFromUrl(insertData.url);
      
      const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
      
      const existingItems = await storage.getItemsByUser(userId);
      const connectionResult = await findConnectionsWithAI(
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

      const newItem = await storage.createItem(userId, insertData, enrichedData);

      if (connectionResult.connections.length > 0) {
        await storage.updateItem(newItem.id, userId, { 
          connections: connectionResult.connections,
          connectionReasons: connectionResult.reasons,
        });
        for (const connId of connectionResult.connections) {
          const connItem = await storage.getItem(connId, userId);
          if (connItem && !connItem.connections.includes(newItem.id)) {
            await storage.updateItem(connId, userId, {
              connections: [...connItem.connections, newItem.id],
            });
          }
        }
      }

      const updatedItem = await storage.getItem(newItem.id, userId);
      res.status(201).json(updatedItem);
    } catch (error) {
      console.error("Capture error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to capture URL" });
    }
  });

  app.patch("/api/items/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const id = req.params.id as string;
      const parseResult = updateSavedItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }

      const updated = await storage.updateItem(id, userId, parseResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const id = req.params.id as string;
      const deleted = await storage.deleteItem(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  app.get("/api/search", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const results = await storage.searchItems(userId, query);
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

  app.post("/api/items/batch/stream", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const { urls } = req.body as { urls: string[] };
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        sendEvent({ type: "error", message: "URLs array is required" });
        res.end();
        return;
      }

      const validUrls = urls.slice(0, 50).map(u => u.trim()).filter(Boolean);
      sendEvent({ type: "start", total: validUrls.length });

      const limit = pLimit(3);
      let successCount = 0;
      let failCount = 0;

      const processUrl = async (url: string, index: number) => {
        try {
          const extracted = await extractContentFromUrl(url);
          const analysis = await analyzeContentWithAI(extracted.content, extracted.title);

          const parseResult = insertSavedItemSchema.safeParse({ url });
          if (!parseResult.success) {
            throw new Error("Invalid URL");
          }

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

          const newItem = await storage.createItem(userId, parseResult.data, enrichedData);
          successCount++;
          
          sendEvent({ 
            type: "item", 
            index, 
            item: newItem,
            progress: { success: successCount, failed: failCount, total: validUrls.length }
          });

          const existingItems = await storage.getItemsByUser(userId);
          if (existingItems.length > 1) {
            const connectionResult = await findConnectionsWithAI(
              { title: newItem.title, summary: newItem.summary, tags: newItem.tags, concepts: newItem.concepts },
              existingItems.filter(i => i.id !== newItem.id).map((item) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                tags: item.tags,
                concepts: item.concepts,
              }))
            );

            if (connectionResult.connections.length > 0) {
              await storage.updateItem(newItem.id, userId, { 
                connections: connectionResult.connections,
                connectionReasons: connectionResult.reasons,
              });
              for (const connId of connectionResult.connections) {
                const connItem = await storage.getItem(connId, userId);
                if (connItem && !connItem.connections.includes(newItem.id)) {
                  await storage.updateItem(connId, userId, {
                    connections: [...connItem.connections, newItem.id],
                  });
                }
              }
              const updatedItem = await storage.getItem(newItem.id, userId);
              sendEvent({ type: "connections", itemId: newItem.id, connections: connectionResult.connections, item: updatedItem });
            }
          }
        } catch (error) {
          failCount++;
          sendEvent({ 
            type: "error", 
            index, 
            url, 
            message: error instanceof Error ? error.message : "Failed",
            progress: { success: successCount, failed: failCount, total: validUrls.length }
          });
        }
      };

      await Promise.all(validUrls.map((url, i) => limit(() => processUrl(url, i))));
      
      sendEvent({ type: "complete", success: successCount, failed: failCount, total: validUrls.length });
      res.end();
    } catch (error) {
      sendEvent({ type: "error", message: error instanceof Error ? error.message : "Batch import failed" });
      res.end();
    }
  });

  app.post("/api/items/batch", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { urls } = req.body as { urls: string[] };
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array is required" });
      }

      const validUrls = urls.slice(0, 50).map(u => u.trim()).filter(Boolean);
      const limit = pLimit(3);
      const results: { url: string; success: boolean; item?: SavedItem; error?: string }[] = [];

      const processUrl = async (url: string) => {
        try {
          const extracted = await extractContentFromUrl(url);
          const analysis = await analyzeContentWithAI(extracted.content, extracted.title);

          const parseResult = insertSavedItemSchema.safeParse({ url });
          if (!parseResult.success) {
            throw new Error(fromZodError(parseResult.error).message);
          }

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

          const newItem = await storage.createItem(userId, parseResult.data, enrichedData);

          const existingItems = await storage.getItemsByUser(userId);
          if (existingItems.length > 1) {
            const connectionResult = await findConnectionsWithAI(
              { title: newItem.title, summary: newItem.summary, tags: newItem.tags, concepts: newItem.concepts },
              existingItems.filter(i => i.id !== newItem.id).map((item) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                tags: item.tags,
                concepts: item.concepts,
              }))
            );

            if (connectionResult.connections.length > 0) {
              await storage.updateItem(newItem.id, userId, { 
                connections: connectionResult.connections,
                connectionReasons: connectionResult.reasons,
              });
              for (const connId of connectionResult.connections) {
                const connItem = await storage.getItem(connId, userId);
                if (connItem && !connItem.connections.includes(newItem.id)) {
                  await storage.updateItem(connId, userId, {
                    connections: [...connItem.connections, newItem.id],
                  });
                }
              }
            }
          }

          const updatedItem = await storage.getItem(newItem.id, userId);
          results.push({ url, success: true, item: updatedItem! });
        } catch (error) {
          results.push({ 
            url, 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to process URL" 
          });
        }
      };

      await Promise.all(validUrls.map(url => limit(() => processUrl(url))));

      res.status(201).json({
        total: validUrls.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    } catch (error) {
      console.error("Batch import error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Batch import failed" });
    }
  });

  app.post("/api/items/upload/stream", isAuthenticated, upload.array("files", 10), async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        sendEvent({ type: "error", message: "No files uploaded" });
        res.end();
        return;
      }

      for (const file of files) {
        const extracted = await extractContentFromFile(file.buffer, file.originalname, file.mimetype);
        
        if (extracted.isBookmarks && extracted.bookmarkUrls && extracted.bookmarkUrls.length > 0) {
          const bookmarks = extracted.bookmarkUrls.slice(0, 100);
          sendEvent({ type: "start", total: bookmarks.length, fileName: file.originalname });

          const limit = pLimit(3);
          let successCount = 0;
          let failCount = 0;

          const processBookmark = async (bookmark: { url: string; title: string }, index: number) => {
            try {
              const urlExtracted = await extractContentFromUrl(bookmark.url);
              const analysis = await analyzeContentWithAI(urlExtracted.content, bookmark.title || urlExtracted.title);

              const parseResult = insertSavedItemSchema.safeParse({ url: bookmark.url });
              if (!parseResult.success) {
                throw new Error("Invalid URL");
              }

              const enrichedData = {
                title: bookmark.title || urlExtracted.title,
                content: urlExtracted.content,
                summary: analysis.summary,
                tags: analysis.tags,
                concepts: analysis.concepts,
                domain: urlExtracted.domain,
                favicon: urlExtracted.favicon,
                imageUrl: urlExtracted.imageUrl,
                expiresAt: null,
              };

              const newItem = await storage.createItem(userId, parseResult.data, enrichedData);
              successCount++;
              
              sendEvent({ 
                type: "item", 
                index, 
                item: newItem,
                progress: { success: successCount, failed: failCount, total: bookmarks.length }
              });

              const existingItems = await storage.getItemsByUser(userId);
              if (existingItems.length > 1) {
                const connectionResult = await findConnectionsWithAI(
                  { title: newItem.title, summary: newItem.summary, tags: newItem.tags, concepts: newItem.concepts },
                  existingItems.filter(i => i.id !== newItem.id).slice(0, 10).map((item) => ({
                    id: item.id,
                    title: item.title,
                    summary: item.summary,
                    tags: item.tags,
                    concepts: item.concepts,
                  }))
                );

                if (connectionResult.connections.length > 0) {
                  await storage.updateItem(newItem.id, userId, { 
                    connections: connectionResult.connections,
                    connectionReasons: connectionResult.reasons,
                  });
                }
              }
            } catch (error) {
              failCount++;
              sendEvent({ 
                type: "error", 
                index, 
                url: bookmark.url, 
                message: error instanceof Error ? error.message : "Failed",
                progress: { success: successCount, failed: failCount, total: bookmarks.length }
              });
            }
          };

          await Promise.all(bookmarks.map((b, i) => limit(() => processBookmark(b, i))));
          sendEvent({ type: "complete", success: successCount, failed: failCount, total: bookmarks.length });
        } else {
          sendEvent({ type: "start", total: 1, fileName: file.originalname });
          
          const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
          const fileUrl = `file://${encodeURIComponent(file.originalname)}`;
          
          const parseResult = insertSavedItemSchema.safeParse({ url: fileUrl });
          if (!parseResult.success) {
            sendEvent({ type: "error", message: "Invalid file" });
            continue;
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

          const newItem = await storage.createItem(userId, parseResult.data, enrichedData);
          sendEvent({ type: "item", index: 0, item: newItem, progress: { success: 1, failed: 0, total: 1 } });
          sendEvent({ type: "complete", success: 1, failed: 0, total: 1 });
        }
      }
      res.end();
    } catch (error) {
      sendEvent({ type: "error", message: error instanceof Error ? error.message : "Upload failed" });
      res.end();
    }
  });

  app.post("/api/items/upload", isAuthenticated, upload.array("files", 10), async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results: { fileName: string; success: boolean; item?: SavedItem; items?: SavedItem[]; error?: string; bookmarksProcessed?: number }[] = [];

      for (const file of files) {
        try {
          const extracted = await extractContentFromFile(file.buffer, file.originalname, file.mimetype);
          
          if (extracted.isBookmarks && extracted.bookmarkUrls && extracted.bookmarkUrls.length > 0) {
            const bookmarks = extracted.bookmarkUrls.slice(0, 100);
            console.log(`Detected bookmark file with ${extracted.bookmarkUrls.length} URLs, processing ${bookmarks.length}`);
            
            const limit = pLimit(3);
            let successCount = 0;
            let failCount = 0;
            const importedItems: SavedItem[] = [];

            const processBookmark = async (bookmark: { url: string; title: string }) => {
              try {
                const urlExtracted = await extractContentFromUrl(bookmark.url);
                const analysis = await analyzeContentWithAI(urlExtracted.content, bookmark.title || urlExtracted.title);

                const parseResult = insertSavedItemSchema.safeParse({ url: bookmark.url });
                if (!parseResult.success) {
                  failCount++;
                  return;
                }

                const enrichedData = {
                  title: bookmark.title || urlExtracted.title,
                  content: urlExtracted.content,
                  summary: analysis.summary,
                  tags: analysis.tags,
                  concepts: analysis.concepts,
                  domain: urlExtracted.domain,
                  favicon: urlExtracted.favicon,
                  imageUrl: urlExtracted.imageUrl,
                  expiresAt: null,
                };

                const newItem = await storage.createItem(userId, parseResult.data, enrichedData);
                importedItems.push(newItem);
                successCount++;
              } catch (err) {
                console.log(`Failed to process bookmark: ${bookmark.url}`);
                failCount++;
              }
            };

            await Promise.all(bookmarks.map(b => limit(() => processBookmark(b))));
            
            results.push({
              fileName: file.originalname,
              success: successCount > 0,
              items: importedItems,
              bookmarksProcessed: successCount,
              error: failCount > 0 ? `${failCount} bookmarks failed to import` : undefined,
            });
          } else {
            const existingItems = await storage.getItemsByUser(userId);
            const analysis = await analyzeContentWithAI(extracted.content, extracted.title);
            
            const connectionResult = await findConnectionsWithAI(
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
            
            const parseResult = insertSavedItemSchema.safeParse({ url: fileUrl });
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

            const newItem = await storage.createItem(userId, parseResult.data, enrichedData);

            if (connectionResult.connections.length > 0) {
              await storage.updateItem(newItem.id, userId, { 
                connections: connectionResult.connections,
                connectionReasons: connectionResult.reasons,
              });
              for (const connId of connectionResult.connections) {
                const connItem = await storage.getItem(connId, userId);
                if (connItem && !connItem.connections.includes(newItem.id)) {
                  await storage.updateItem(connId, userId, {
                    connections: [...connItem.connections, newItem.id],
                  });
                }
              }
            }

            const updatedItem = await storage.getItem(newItem.id, userId);
            results.push({ fileName: file.originalname, success: true, item: updatedItem! });
          }
        } catch (error) {
          results.push({
            fileName: file.originalname,
            success: false,
            error: error instanceof Error ? error.message : "Failed to process file",
          });
        }
      }

      const totalBookmarks = results.reduce((sum, r) => sum + (r.bookmarksProcessed || 0), 0);
      
      res.status(201).json({
        total: files.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        bookmarksImported: totalBookmarks,
        results,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "File upload failed" });
    }
  });

  return httpServer;
}
