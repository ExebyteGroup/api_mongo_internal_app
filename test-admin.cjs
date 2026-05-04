const { MongoClient } = require('mongodb');
const uri = 'mongodb://exebyteApp:qmoxtjU0rM9w5sl7fWIUQ2OyK8qt@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('exebyte');
    const admins = await db.collection('admins').find({}).toArray();
    console.log("Admins:", admins);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
