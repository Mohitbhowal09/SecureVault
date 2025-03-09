import { User, Password, InsertUser, InsertPassword, users, passwords } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPassword(id: number): Promise<Password | undefined>;
  getPasswordsByUserId(userId: number): Promise<Password[]>;
  createPassword(password: { 
    userId: number;
    title: string;
    username: string;
    encryptedPassword: string;
    category: string;
    url?: string | null;
    notes?: string | null;
  }): Promise<Password>;
  deletePassword(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPassword(id: number): Promise<Password | undefined> {
    const [password] = await db.select().from(passwords).where(eq(passwords.id, id));
    return password;
  }

  async getPasswordsByUserId(userId: number): Promise<Password[]> {
    return await db.select().from(passwords).where(eq(passwords.userId, userId));
  }

  async createPassword(password: { 
    userId: number;
    title: string;
    username: string;
    encryptedPassword: string;
    category: string;
    url?: string | null;
    notes?: string | null;
  }): Promise<Password> {
    const [newPassword] = await db.insert(passwords).values(password).returning();
    return newPassword;
  }

  async deletePassword(id: number): Promise<void> {
    await db.delete(passwords).where(eq(passwords.id, id));
  }
}

export const storage = new DatabaseStorage();