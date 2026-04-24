import { MongoClient } from 'mongodb';

async function testIP() {
  const ip = "188.246.84.221";
  const port = 23416;
  const user = "exebyteApp";
  const pw = "$ZrkS5vZnvRiAlave%KJf9Vc";
  
  const uri = `mongodb://${user}:${encodeURIComponent(pw)}@${ip}:${port}/exebyte?authSource=exebyte&ssl=false`;
  console.log(`Testing with IP ${ip}...`);
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("SUCCESS on IP!");
    await client.close();
  } catch (e) {
    console.log(`FAILED on IP: ${e.message}`);
  }
}

testIP();
