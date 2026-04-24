import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?ssl=false';
  console.log('Testing URI without explicit authSource parameter...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('SUCCESS!');
    await client.close();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

test();
