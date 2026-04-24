import { MongoClient } from 'mongodb';

async function testLiteralEncoding() {
  const uri = "mongodb://exebyteApp:%2524ZrkS5vZnvRiAlave%2525KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false";
  console.log("Testing with literal encoded password string...");
  
  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    console.log("SUCCESS with double-encoded (literal %)");
    await client.close();
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }
}

testLiteralEncoding();
