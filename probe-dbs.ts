import { MongoClient } from 'mongodb';

async function test() {
  const host = 'exebyte-bot.duckdns.org';
  const port = 23416;
  
  console.log('Probing for unprotected databases...');
  const client = new MongoClient(`mongodb://${host}:${port}`);
  
  try {
    await client.connect();
    console.log('Connected!');
    const admin = client.db('admin');
    try {
      const dbs = await admin.command({ listDatabases: 1 });
      console.log('Open Databases:', dbs.databases.map(d => d.name));
    } catch (e) {
      console.log('listDatabases failed (Requires Auth)');
    }
    await client.close();
  } catch (err) {
    console.log('Connection failed:', err.message);
  }
}

test();
