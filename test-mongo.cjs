const { MongoClient } = require('mongodb');
const uri = 'mongodb://exebyteApp:qmoxtjU0rM9w5sl7fWIUQ2OyK8qt@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db('exebyte');
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Check customers
    const customers = await db.collection('customers').find({}).limit(2).toArray();
    console.log("Customers:", customers.length);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
