import { MongoClient } from 'mongodb';

const configs = [
  {
    name: "User Provided URI",
    uri: "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false"
  },
  {
    name: "AuthSource Admin",
    uri: "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=admin&ssl=false"
  },
  {
    name: "No AuthSource (Default)",
    uri: "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?ssl=false"
  },
  {
     name: "Direct Connection",
     uri: "mongodb://exebyteApp:%24ZrkS5vZnvRiAlave%25KJf9Vc@exebyte-bot.duckdns.org:23416/exebyte?authSource=exebyte&ssl=false&directConnection=true"
  }
];

async function testAll() {
  for (const config of configs) {
    console.log(`\nTesting: ${config.name}`);
    console.log(`URI: ${config.uri}`);
    try {
      const client = new MongoClient(config.uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      });
      await client.connect();
      console.log(`SUCCESS: ${config.name}`);
      const dbs = await client.db().admin().listDatabases();
      console.log(`Available DBs:`, dbs.databases.map(d => d.name));
      await client.close();
      return; // Exit if one succeeds
    } catch (e) {
      console.log(`FAILED: ${config.name} - ${e.message}`);
    }
  }
}

testAll();
