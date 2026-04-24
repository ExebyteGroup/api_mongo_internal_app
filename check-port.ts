import { MongoClient } from 'mongodb';

async function checkPort27017() {
  const uri = "mongodb://exebyte-bot.duckdns.org:27017/exebyte?ssl=false&connectTimeoutMS=3000&serverSelectionTimeoutMS=3000";
  console.log("Checking port 27017...");
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("SUCCESS on 27017!");
    await client.close();
  } catch (e) {
    console.log(`Port 27017 Error: ${e.message}`);
  }
}

checkPort27017();
