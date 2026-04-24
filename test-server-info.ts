import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyte-bot.duckdns.org:23416';
  console.log('Connecting without auth to check server info...');
  const client = new MongoClient(uri, { connectTimeoutMS: 5000 });
  
  try {
    await client.connect();
    console.log('Connected (No Auth)');
    const admin = client.db('admin');
    const info = await admin.command({ isMaster: 1 });
    console.log('Server Info:', info);
    await client.close();
  } catch (err) {
    console.error('Failed (No Auth):', err.message);
  }
}

test();
