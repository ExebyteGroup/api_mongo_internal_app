import * as net from 'net';

async function checkPort(host: string, port: number) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function run() {
  const host = 'exebyte-bot.duckdns.org';
  const ports = [27017, 23416, 37429, 27018, 27019];
  for (const p of ports) {
    const open = await checkPort(host, p);
    console.log(`Port ${p}: ${open ? 'OPEN' : 'CLOSED'}`);
  }
}

run();
