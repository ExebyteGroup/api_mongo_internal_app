import { MongoClient } from 'mongodb';

async function checkOldPort() {
  const host = "exebyte-bot.duckdns.org";
  const port = 37429;
  const uri = `mongodb://${host}:${port}/exebyte?ssl=false&connectTimeoutMS=3000&serverSelectionTimeoutMS=3000`;
  console.log(`Checking old port ${port}...`);
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log(`SUCCESS on port ${port}!`);
    await client.close();
  } catch (e) {
    console.log(`Port ${port} Error: ${e.message}`);
  }
}

checkOldPort();
