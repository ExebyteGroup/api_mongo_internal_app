import { MongoClient } from 'mongodb';

async function test() {
  const host = 'exebyte-bot.duckdns.org';
  const port = 23416;
  const user = 'exebyte';
  const pwd = '$ZrkS5vZnvRiAlave%KJf9Vc';
  const source = 'admin';

  console.log(`Testing User: ${user}, Source: ${source}`);
  const client = new MongoClient(`mongodb://${host}:${port}`, {
    auth: { username: user, password: pwd },
    authSource: source,
    directConnection: true,
    connectTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log('SUCCESS with exebyte username!');
    await client.close();
  } catch (err) {
    console.log(`Failed with exebyte username: ${err.message}`);
  }
}

test();
