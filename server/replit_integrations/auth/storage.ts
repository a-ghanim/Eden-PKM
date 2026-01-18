import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByApiToken(token: string): Promise<User | undefined>;
  getOrCreateApiToken(userId: string): Promise<string>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByApiToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.apiToken, token));
    return user;
  }

  async getOrCreateApiToken(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.apiToken) {
      return user.apiToken;
    }
    const newToken = `eden_${randomUUID().replace(/-/g, "")}`;
    await db.update(users).set({ apiToken: newToken }).where(eq(users.id, userId));
    return newToken;
  }
}

export const authStorage = new AuthStorage();
