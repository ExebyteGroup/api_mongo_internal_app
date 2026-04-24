require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:37429/exebyte';
const DB_NAME = 'exebyte';

let db;

MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Be sure it is running at the configured MONGODB_URI.', err);
  });

// GET /api/customers?page=1&limit=50&search=query&posta=BA-78000
app.get('/api/customers', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.naziv = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.posta) {
      query.posta = req.query.posta;
    }

    const customers = await db.collection('customers')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
      
    const total = await db.collection('customers').countDocuments(query);

    res.json({ 
      data: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers/:sifra
app.get('/api/customers/:sifra', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const customer = await db.collection('customers').findOne({ sifra: req.params.sifra });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const data = req.body;
    if (!data.sifra) {
      return res.status(400).json({ error: 'Field "sifra" is required' });
    }
    
    // Check for uniqueness
    const existing = await db.collection('customers').findOne({ sifra: data.sifra });
    if (existing) {
      return res.status(409).json({ error: 'Customer with this sifra already exists' });
    }

    await db.collection('customers').insertOne(data);
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/customers/:sifra
app.put('/api/customers/:sifra', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const data = req.body;
    delete data._id; // Prevent updating the immutable _id

    const result = await db.collection('customers').updateOne(
      { sifra: req.params.sifra },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', updatedFields: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/customers/:sifra
app.delete('/api/customers/:sifra', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const result = await db.collection('customers').deleteOne({ sifra: req.params.sifra });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
