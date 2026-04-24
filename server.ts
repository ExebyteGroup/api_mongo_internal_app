import express from 'express';
import { createServer as createViteServer } from 'vite';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
const DB_NAME = 'exebyte';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });
  app.use(cors()); // Allow all origins by default
  app.use(express.json());

  // MongoDB Initialization (Non-blocking)
  let db;
  const MONGODB_URI_INTERNAL = 'mongodb://exebyteApp:qmoxtjU0rM9w5sl7fWIUQ2OyK8qt@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
  
  const client = new MongoClient(MONGODB_URI_INTERNAL);

  client.connect()
    .then(async (client) => {
      db = client.db(DB_NAME);
      const collections = await db.listCollections().toArray();
      const msg = `SUCCESS: Connected to "${DB_NAME}". Collections: ${collections.map(c => c.name).join(', ')}`;
      console.log(`[DB] ${msg}`);
    })
    .catch((err) => {
      console.error(`[DB] FAILED: ${err.message}`);
    });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: db ? 'Connected' : 'Disconnected',
      dbInitialized: !!db,
      timestamp: new Date()
    });
  });

  // --- AUTH MIDDLEWARE ---
  const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (e) {
      // Allow demo token
      if (token === 'demo-token') {
        req.admin = { username: 'admin (demo)' };
        return next();
      }
      
      // Try Device API Key
      if (db) {
        try {
          const device = await db.collection('devices').findOne({ apiKey: token });
          if (device) {
            req.device = device;
            return next();
          }
        } catch(err) {}
      }

      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API ROUTES ---

  // Get all collections
  app.get('/api/stats', authMiddleware, async (req, res) => {
    if (!db) {
      return res.json({ customers: 0, collections: 0 });
    }
    try {
      const customers = await db.collection('customers').countDocuments();
      const collections = await db.listCollections().toArray();
      
      const collectionsWithDetails = await Promise.all(collections.map(async (col) => {
        const firstDoc = await db.collection(col.name).findOne({});
        return {
          name: col.name,
          count: await db.collection(col.name).countDocuments(),
          fields: firstDoc ? Object.keys(firstDoc) : []
        };
      }));

      res.json({ 
        customers, 
        collections: collections.length,
        collectionsList: collections.map(c => c.name),
        collectionsDetails: collectionsWithDetails
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Get all collections
  app.get('/api/db/collections', authMiddleware, async (req, res) => {
    if (!db) {
      // Fallback for demo
      return res.json(['customers', 'devices', 'admins', 'logs', 'settings']);
    }
    try {
      const collections = await db.listCollections().toArray();
      res.json(collections.map(c => c.name));
    } catch (e) {
      res.status(500).json({ error: 'Failed to list collections' });
    }
  });

  // Generic query endpoint
  app.get('/api/db/collection/:name', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!db) {
      // Mock data for demo
      const mockData = Array.from({ length: 10 }).map((_, i) => ({ 
        _id: `mock-${i}`, 
        name: `Mock Record ${i}`, 
        status: 'Offline',
        info: 'Database Connection Pending' 
      }));
      return res.json({ data: mockData, meta: { page, limit, total: 10, totalPages: 1 } });
    }
    
    try {
      let query: any = {};
      if (req.query.query) {
        query = JSON.parse(req.query.query as string);
      } else if (req.query.search) {
        // Build a broad search across likely fields
        const searchVal = req.query.search as string;
        const firstDoc = await db.collection(req.params.name).findOne({});
        if (firstDoc) {
          const stringFields = Object.keys(firstDoc).filter(k => typeof firstDoc[k] === 'string');
          if (stringFields.length > 0) {
            query.$or = stringFields.map(field => ({ [field]: { $regex: searchVal, $options: 'i' } }));
          }
        }
      }
      
      let cursor = db.collection(req.params.name).find(query);
      if (req.query.sortField) {
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        cursor = cursor.sort({ [req.query.sortField as string]: sortOrder });
      }
      const data = await cursor.skip(skip).limit(limit).toArray();
      const total = await db.collection(req.params.name).countDocuments(query);
      res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch collection data' });
    }
  });

  // Create a record in a collection
  app.post('/api/db/collection/:name', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB offline' });
    try {
      const result = await db.collection(req.params.name).insertOne(req.body);
      res.json({ success: true, insertedId: result.insertedId });
    } catch (e) {
      res.status(500).json({ error: 'Failed to create record' });
    }
  });

  // Update a record in a collection
  app.put('/api/db/collection/:name/:id', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB offline' });
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData._id;

      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
      const result = await db.collection(req.params.name).updateOne(
        filter,
        { $set: updateData }
      );
      res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update record' });
    }
  });

  // Delete a record from a collection
  app.delete('/api/db/collection/:name/:id', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB offline' });
    try {
      const { id } = req.params;
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
      const result = await db.collection(req.params.name).deleteOne(filter);
      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

  // Auth: Setup initial admin (if none exists)
  app.post('/api/auth/setup', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized. Please check MongoDB status.' });
    const count = await db.collection('admins').countDocuments();
    if (count > 0) return res.status(400).json({ error: 'Admin already exists' });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = { username: 'admin', password: hashedPassword, createdAt: new Date() };
    await db.collection('admins').insertOne(admin);
    res.json({ message: 'Default admin created (admin / admin123)' });
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    // DEMO FALLBACK ONLY IF DB IS DOWN
    if (!db) {
      if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username: 'admin (demo)' }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ token, username: 'admin (demo)', isDemo: true });
      }
      return res.status(503).json({ error: 'Database Offline' });
    }

    try {
      const admin = await db.collection('admins').findOne({ username });
      if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
      
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, username: admin.username });
    } catch (err) {
      res.status(500).json({ error: 'Internal auth error' });
    }
  });

  // Customers (Protected)
  app.get('/api/customers', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!db) {
      return res.json({ 
        data: [{ sifra: 'DEMO', naziv: 'Demo Customer (DB Unavailable)', naslov: '123 Fake St' }], 
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 } 
      });
    }

    try {
      let query: any = {};
      if (req.query.query) {
        query = JSON.parse(req.query.query as string);
      } else {
        if (req.query.search) query.naziv = { $regex: req.query.search as string, $options: 'i' };
        if (req.query.posta) query.posta = req.query.posta;
      }

      let cursor = db.collection('customers').find(query);
      if (req.query.sortField) {
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        cursor = cursor.sort({ [req.query.sortField as string]: sortOrder });
      }
      const customers = await cursor.skip(skip).limit(limit).toArray();
      const total = await db.collection('customers').countDocuments(query);

      res.json({ data: customers, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  app.post('/api/customers', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized' });
    try {
      const data = req.body;
      if (!data.sifra) return res.status(400).json({ error: 'Field "sifra" required' });
      const existing = await db.collection('customers').findOne({ sifra: data.sifra });
      if (existing) return res.status(409).json({ error: 'Customer already exists' });

      await db.collection('customers').insertOne(data);
      res.status(201).json(data);
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  // Devices (Protected)
  app.get('/api/devices', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized' });
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      let cursor = db.collection('devices').find({});
      if (req.query.sortField) {
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        cursor = cursor.sort({ [req.query.sortField as string]: sortOrder });
      }
      const devices = await cursor.skip(skip).limit(limit).toArray();
      const total = await db.collection('devices').countDocuments({});
      res.json({ data: devices, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  });

  app.post('/api/devices', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized' });
    const { deviceId, name } = req.body;
    if (!deviceId || !name) return res.status(400).json({ error: 'deviceId and name required' });
    try {
      const existing = await db.collection('devices').findOne({ deviceId });
      if (existing) return res.status(409).json({ error: 'Device already exists' });
      
      const apiKey = crypto.randomBytes(32).toString('hex');
      const newDevice = { deviceId, name, assignedTo: null, apiKey, createdAt: new Date() };
      await db.collection('devices').insertOne(newDevice);
      res.status(201).json(newDevice);
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  app.put('/api/devices/:id/apikey', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized' });
    try {
      const apiKey = crypto.randomBytes(32).toString('hex');
      const result = await db.collection('devices').updateOne(
        { deviceId: req.params.id },
        { $set: { apiKey, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Device not found' });
      res.json({ message: 'Device API key generated successfully', apiKey });
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  app.put('/api/devices/:id/assign', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB not initialized' });
    const { sifra } = req.body;
    try {
      if (sifra) {
        const customer = await db.collection('customers').findOne({ sifra });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
      }
      
      const result = await db.collection('devices').updateOne(
        { deviceId: req.params.id },
        { $set: { assignedTo: sifra || null, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Device not found' });
      res.json({ message: 'Device assigned successfully' });
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });


  // --- SWAGGER API DOCS ---
  const swaggerDocument = {
    openapi: "3.0.0",
    info: { 
      title: "Customer Manager API", 
      version: "1.0.0",
      description: "API Documentation for Customer Manager.\\n\\n[Download OpenAPI JSON](/api-docs.json)"
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/auth/login": {
        post: {
          summary: "Admin Login",
          tags: ["Auth"],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { username: { type: "string" }, password: { type: "string" } } } } } },
          responses: { "200": { description: "Success" } }
        }
      },
      "/api/customers": {
        get: {
          summary: "Get Customers",
          tags: ["Customers"],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "search", schema: { type: "string" } }
          ],
          responses: { "200": { description: "Success" } }
        }
      },
      "/api/devices": {
        get: { summary: "Get Devices", tags: ["Devices"], responses: { "200": { description: "Success" } } },
        post: { 
          summary: "Create Device", 
          tags: ["Devices"],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { deviceId: { type: "string" }, name: { type: "string" } } } } } },
          responses: { "201": { description: "Created" } }
        }
      },
      "/api/devices/{id}/assign": {
        put: {
          summary: "Assign Device to Customer",
          tags: ["Devices"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { sifra: { type: "string", description: "Customer sifra, or null to unassign" } } } } } },
          responses: { "200": { description: "Assigned" } }
        }
      },
      "/api/db/collections": {
        get: {
          summary: "List all Database Collections",
          tags: ["Database Explorer"],
          responses: { "200": { description: "Array of collection names" } }
        }
      },
      "/api/db/collection/{name}": {
        get: {
          summary: "Query a Database Collection",
          tags: ["Database Explorer"],
          parameters: [
            { in: "path", name: "name", required: true, schema: { type: "string" }, description: "Collection Name" },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "sortField", schema: { type: "string" } },
            { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "query", schema: { type: "string" }, description: "JSON stringified advanced query" }
          ],
          responses: { "200": { description: "Success" } }
        },
        post: {
          summary: "Insert into a Collection",
          tags: ["Database Explorer"],
          parameters: [{ in: "path", name: "name", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", additionalProperties: true } } } },
          responses: { "200": { description: "Success" } }
        }
      },
      "/api/db/collection/{name}/{id}": {
        put: {
          summary: "Update a record in a Collection",
          tags: ["Database Explorer"],
          parameters: [
            { in: "path", name: "name", required: true, schema: { type: "string" } },
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          requestBody: { content: { "application/json": { schema: { type: "object", additionalProperties: true } } } },
          responses: { "200": { description: "Success" } }
        },
        delete: {
          summary: "Delete a record from a Collection",
          tags: ["Database Explorer"],
          parameters: [
            { in: "path", name: "name", required: true, schema: { type: "string" } },
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: { "200": { description: "Success" } }
        }
      }
    }
  };
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));


  // --- MCP SERVER (Model Context Protocol) ---
  const mcp = new McpServer({
    name: "Customer_Device_MCP",
    version: "1.0.0"
  });

  mcp.tool(
    "list_collections",
    "List all available collections in the database",
    {},
    async () => {
      if (!db) throw new Error("DB not attached");
      const collections = await db.listCollections().toArray();
      return { content: [{ type: "text", text: JSON.stringify(collections.map(c => c.name), null, 2) }] };
    }
  );

  mcp.tool(
    "query_collection",
    "Query any collection in the database",
    {
      collection: z.string().describe("The name of the collection to query"),
      query: z.string().optional().describe("JSON string representing the MongoDB query filter"),
      limit: z.number().optional().default(10).describe("Number of documents to return")
    },
    async ({ collection, query, limit }) => {
      if (!db) throw new Error("DB not attached");
      const filter = query ? JSON.parse(query) : {};
      const data = await db.collection(collection).find(filter).limit(limit).toArray();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  mcp.tool(
    "get_customers",
    "Search and retrieve customers",
    {
      search: z.string().optional().describe("Search string targeting the naziv field"),
    },
    async ({ search }) => {
      if (!db) throw new Error("DB not attached");
      let query = search ? { naziv: { $regex: search, $options: 'i' } } : {};
      const customers = await db.collection("customers").find(query).limit(10).toArray();
      return { content: [{ type: "text", text: JSON.stringify(customers, null, 2) }] };
    }
  );

  mcp.tool(
    "assign_device",
    "Assign a device to a customer login (sifra)",
    {
      deviceId: z.string().describe("The ID of the device"),
      sifra: z.string().describe("The customer sifra to assign to"),
    },
    async ({ deviceId, sifra }) => {
      if (!db) throw new Error("DB not attached");
      const res = await db.collection("devices").updateOne(
        { deviceId },
        { $set: { assignedTo: sifra } }
      );
      if (res.matchedCount === 0) return { content: [{ type: "text", text: `Error: Device ${deviceId} not found.` }] };
      return { content: [{ type: "text", text: `Success: Device ${deviceId} assigned to customer ${sifra}.` }] };
    }
  );

  let mcpTransport;
  app.get("/mcp/sse", (req, res) => {
    mcpTransport = new SSEServerTransport("/mcp/messages", res);
    mcp.connect(mcpTransport);
  });
  app.post("/mcp/messages", (req, res) => {
    if (mcpTransport) mcpTransport.handlePostMessage(req, res);
    else res.status(503).json({ error: "MCP not initialized" });
  });

  // --- VITE MIDDLEWARES (Runs React Dashboard) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Fallback for production builds
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs at http://localhost:${PORT}/api-docs`);
    console.log(`MCP SSE at http://localhost:${PORT}/mcp/sse`);
  });
}

startServer();
