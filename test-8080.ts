import { MongoClient } from 'mongodb';

async function test() {
  console.log('Testing localhost:8080 for MongoDB...');
  const client = new MongoClient('mongodb://localhost:8080');
  try {
    await client.connect();
    console.log('SUCCESS on localhost:8080!');
    await client.close();
  } catch (err) {
    console.log('Failed on localhost:8080:', err.message);
  }
}

test();
