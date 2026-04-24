import { MongoClient } from 'mongodb';

const passwords = [
  "$ZrkS5vZnvRiAlave%KJf9Vc",
  "%24ZrkS5vZnvRiAlave%25KJf9Vc"
];

async function testFinal() {
  const host = "exebyte-bot.duckdns.org:23416";
  const user = "exebyteApp";
  
  for (const pw of passwords) {
    console.log(`\n--- Testing Password: ${pw} ---`);
    const variations = [
      { name: "authSource=exebyte, ssl=false", opt: { authSource: "exebyte", ssl: false, directConnection: true } },
      { name: "authSource=admin, ssl=false", opt: { authSource: "admin", ssl: false, directConnection: true } },
      { name: "authSource=exebyte, tls=true, allowInvalid", opt: { authSource: "exebyte", tls: true, tlsAllowInvalidCertificates: true, directConnection: true } },
    ];
    
    for (const v of variations) {
      console.log(`Variation: ${v.name}`);
      try {
        const client = new MongoClient(`mongodb://${host}/exebyte`, {
          auth: { username: user, password: pw },
          ...v.opt,
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000
        });
        await client.connect();
        console.log(`SUCCESS!`);
        await client.close();
        return;
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
      }
    }
  }
}

testFinal();
