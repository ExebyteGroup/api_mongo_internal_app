import { MongoClient } from 'mongodb';

const variations = [
  'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false',
  'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=admin&ssl=false',
  'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?ssl=false'
];

async function test() {
  for (const uri of variations) {
    console.log(`Testing: ${uri.split('@')[1]}`);
    const client = new MongoClient(uri, { connectTimeoutMS: 5000 });
    try {
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
