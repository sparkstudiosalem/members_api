const ws = require('websocket-stream');
const server = require('./server');
const { mqtt } = require('../lib/mqtt');

ws.createServer({ server: server.listener }, mqtt.handle);
