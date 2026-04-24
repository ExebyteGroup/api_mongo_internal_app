import { MongoClient } from 'mongodb';

const base = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416';
const variations = [
  `${base}/?authSource=admin`,
  `${base}/?authSource=exebyte`,
  `${base}/exebyte?authSource=admin`,
  `${base}/admin?authSource=admin`
];

async function test() {
  for (const uri of variations) {
    console.log(`Testing: ${uri.split('@')[1]}`);
    try {
      const client = new MongoClient(uri, { connectTimeoutMS: 5000 });
      await client.connect();
      console.log('SUCCESS with URI:', uri);
      await client.close();
      return;
    } catch (e) {
      console.log('Failed:', e.message);
    }
  }
}

test();
