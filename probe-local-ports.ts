import * as net from 'net';

async function checkPort(port: number) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
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
    socket.connect(port, '127.0.0.1');
  });
}

async function run() {
  const ports = [27017, 37429, 3000, 3001, 5173, 8080];
  for (const p of ports) {
    const open = await checkPort(p);
    console.log(`Port ${p}: ${open ? 'OPEN' : 'CLOSED'}`);
  }
}

run();
