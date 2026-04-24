import { MongoClient } from 'mongodb';

async function testSimple() {
  const uri = "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/?authSource=exebyte&ssl=false";
  console.log("Testing with no DB in path, authSource=exebyte");
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("SUCCESS!");
    const admin = client.db('admin');
    const info = await admin.command({ ping: 1 });
    console.log("Ping response:", info);
    await client.close();
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }
}

testSimple();
