import { users, type User, type InsertUser } from "@shared/models/auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User>;
  getUserByApiToken(token: string): Promise<User | undefined>;
  getOrCreateApiToken(userId: string): Promise<string>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
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
