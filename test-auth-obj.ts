import { MongoClient } from 'mongodb';

async function testAuthObject() {
  const uri = "mongodb://exebyte-bot.duckdns.org:23416/exebyte?ssl=false";
  console.log("Testing with auth object...");
  
  try {
    const client = new MongoClient(uri, {
      auth: {
        username: "exebyteApp",
        password: "$ZrkS5vZnvRiAlave%KJf9Vc"
      },
      authSource: "exebyte",
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    console.log("SUCCESS with auth object and authSource=exebyte");
    await client.close();
  } catch (e) {
    console.log(`FAILED with authSource=exebyte: ${e.message}`);
  }

  try {
    const client = new MongoClient(uri, {
      auth: {
        username: "exebyteApp",
        password: "$ZrkS5vZnvRiAlave%KJf9Vc"
      },
      authSource: "admin",
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    console.log("SUCCESS with auth object and authSource=admin");
    await client.close();
  } catch (e) {
    console.log(`FAILED with authSource=admin: ${e.message}`);
  }
}

testAuthObject();
