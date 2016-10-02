'use strict';

// 检测port是否存在

const net = require('net');
function probe(port, callback) {
  let server = net.createServer().listen(port);
  let timer;

  server.on('listening', ()=> {
    if(!server) {
      return;
    }
    server.close();
    clearTimeout(timer);
    callback(undefined, port);
  });


  server.on('error', (err)=> {
    clearTimeout(timer);
    if(err.code === 'EADDRINUSE') {
      return callback(err, port);
    }

    return callback(undefined, port);
  });

  timer = setTimeout(()=> {
    server.close();
    server = null;
    callback(new Error('timeout'));
  }, 1000);

  timer.unref();
}

module.exports = probe;