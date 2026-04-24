import { MongoClient } from 'mongodb';

async function testMechanisms() {
  const uri = "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false";
  const mechanisms = ["SCRAM-SHA-256", "SCRAM-SHA-1", "MONGODB-CR"];
  
  for (const m of mechanisms) {
    console.log(`\nTesting mechanism: ${m}`);
    try {
      const client = new MongoClient(`${uri}&authMechanism=${m}`, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      });
      await client.connect();
      console.log(`SUCCESS with ${m}`);
      await client.close();
      return;
    } catch (e) {
      console.log(`FAILED with ${m}: ${e.message}`);
    }
  }
}

testMechanisms();
