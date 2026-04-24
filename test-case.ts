import { MongoClient } from 'mongodb';

async function testCase() {
  const host = "exebyte-bot.duckdns.org:23416";
  const user = "exebyteApp";
  const pw = "$ZrkS5vZnvRiAlave%KJf9Vc";
  
  const dbs = ["exebyte", "Exebyte", "EXEBYTE"];
  
  for (const db of dbs) {
    for (const source of dbs) {
      console.log(`Testing db=${db}, authSource=${source}`);
      try {
        const client = new MongoClient(`mongodb://${host}/${db}`, {
          auth: { username: user, password: pw },
          authSource: source,
          ssl: false,
          connectTimeoutMS: 3000,
          serverSelectionTimeoutMS: 3000
        });
        await client.connect();
        console.log("SUCCESS!");
        await client.close();
        return;
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
      }
    }
  }
}

testCase();
