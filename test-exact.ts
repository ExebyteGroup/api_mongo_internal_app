import { MongoClient } from 'mongodb';

const uri = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';

async function test() {
  console.log('Testing exact URI...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('CONNECTED!');
    const db = client.db('exebyte');
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
    await client.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
