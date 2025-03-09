import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { storePasswordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/passwords", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const passwords = await storage.getPasswordsByUserId(req.user.id);
    res.json(passwords);
  });

  app.post("/api/passwords", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Log the incoming request body for debugging
      console.log('Password creation request:', {
        ...req.body,
        encryptedPassword: '[REDACTED]'
      });

      const validation = storePasswordSchema.safeParse(req.body);

      if (!validation.success) {
        console.error('Validation error:', validation.error);
        return res.status(400).json(validation.error);
      }

      const password = await storage.createPassword({
        ...validation.data,
        userId: req.user.id,
      });

      console.log('Password created successfully:', {
        id: password.id,
        title: password.title,
        userId: password.userId
      });

      res.status(201).json(password);
    } catch (error) {
      console.error('Password creation error:', error);
      res.status(500).json({ message: 'Failed to create password' });
    }
  });

  app.delete("/api/passwords/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const password = await storage.getPassword(id);

    if (!password || password.userId !== req.user.id) {
      return res.sendStatus(404);
    }

    await storage.deletePassword(id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}