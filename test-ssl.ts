import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=true&tlsAllowInvalidCertificates=true';
  console.log('Testing URI with ssl=true and tlsAllowInvalidCertificates=true...');
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
