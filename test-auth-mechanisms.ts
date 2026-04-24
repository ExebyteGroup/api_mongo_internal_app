import { MongoClient } from 'mongodb';

async function test() {
  const uri = 'mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
  
  const mechanisms = ['SCRAM-SHA-1', 'SCRAM-SHA-256'];
  
  for (const m of mechanisms) {
    console.log(`Testing authMechanism: ${m}`);
    const client = new MongoClient(uri + `&authMechanism=${m}`);
    try {
      await client.connect();
      console.log(`SUCCESS with ${m}!`);
      await client.close();
      return;
    } catch (err) {
      console.error(`Failed with ${m}:`, err.message);
    }
  }
}

test();
