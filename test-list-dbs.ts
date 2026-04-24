import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyte-bot.duckdns.org:23416';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const admin = client.db('admin');
    const dbs = await admin.command({ listDatabases: 1 });
    console.log('Databases:', dbs);
    await client.close();
  } catch (err) {
    console.error('Failed to list databases without auth:', err.message);
  }
}

test();
