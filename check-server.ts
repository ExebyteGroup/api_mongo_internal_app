import { MongoClient } from 'mongodb';

async function checkServer() {
  const uri = "mongodb://exebyteApp:qmoxtjU0rM9w5sl7fWIUQ2OyK8qt@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&tls=false";
  console.log("Checking server response without auth...");
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("SUCCESS: Initial connection established.");
    
    try {
      const db = client.db('exebyte');
      const colls = await db.listCollections().toArray();
      console.log("Collections:", colls.map(c => c.name));
    } catch (err) {
      console.log("Error listing collections:", err.message);
    }
    
    await client.close();
  } catch (e) {
    console.log(`Connection error: ${e.message}`);
  }
}

checkServer();
