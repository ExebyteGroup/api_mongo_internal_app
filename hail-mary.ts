import { MongoClient } from 'mongodb';

async function hailMary() {
  const host = "exebyte-bot.duckdns.org:23416";
  const users = ["exebyteApp", "exebyte", "admin"];
  const pw = "$ZrkS5vZnvRiAlave%KJf9Vc";
  
  for (const user of users) {
    console.log(`Trying user: ${user}`);
    try {
      const client = new MongoClient(`mongodb://${host}/exebyte`, {
        auth: { username: user, password: pw },
        authSource: "exebyte",
        ssl: false,
        connectTimeoutMS: 3000,
        serverSelectionTimeoutMS: 3000
      });
      await client.connect();
      console.log(`SUCCESS with user=${user}`);
      await client.close();
      return;
    } catch (e) {
       console.log(`FAILED with user=${user}: ${e.message}`);
    }
  }
}

hailMary();
