import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
  console.log('Testing raw URI provided by user...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected successfully with raw URI!');
    const db = client.db('exebyte');
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('Failed with raw URI:', err.message);
    
    console.log('\nTesting with authSource=admin...');
    const uri2 = uri.replace('authSource=exebyte', 'authSource=admin');
    const client2 = new MongoClient(uri2);
    try {
      await client2.connect();
      console.log('Connected successfully with authSource=admin!');
      await client2.close();
    } catch (err2) {
      console.error('Failed with authSource=admin:', err2.message);
    }
  }
}

test();
