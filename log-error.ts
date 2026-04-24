import { MongoClient } from 'mongodb';

async function logErrorDetails() {
  const uri = "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false";
  console.log("Connecting with full URI...");
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected!");
    await client.close();
  } catch (e) {
    console.log("Error Name:", e.name);
    console.log("Error Message:", e.message);
    if (e.code) console.log("Error Code:", e.code);
    if (e.codeName) console.log("Error Code Name:", e.codeName);
    console.dir(e);
  }
}

logErrorDetails();
