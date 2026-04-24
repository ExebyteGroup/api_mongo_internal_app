import { MongoClient } from 'mongodb';

async function test() {
  const host = 'exebyte-bot.duckdns.org';
  const port = 23416;
  const user = 'exebyteApp';
  
  // Variations of the password
  const passwords = [
    '$ZrkS5vZnvRiAlave%KJf9Vc',
    '$ZrkS5vZnvRiAlave%25KJf9Vc',
    '%24ZrkS5vZnvRiAlave%25KJf9Vc',
    '$ZrkS5vZnvRiAlaveKJf9Vc'
  ];
  
  const authSources = ['exebyte', 'admin'];

  for (const pwd of passwords) {
    for (const source of authSources) {
      console.log(`Testing User: ${user}, Pwd: ${pwd}, Source: ${source}`);
      const client = new MongoClient(`mongodb://${host}:${port}`, {
        auth: { username: user, password: pwd },
        authSource: source,
        directConnection: true,
        connectTimeoutMS: 2000
      });
      
      try {
        await client.connect();
        console.log('SUCCESS!');
        await client.close();
        return;
      } catch (err) {
        console.log(`Failed: ${err.message}`);
      }
    }
  }
  console.log('All variations failed.');
}

test();
