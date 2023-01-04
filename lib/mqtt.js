const jwt = require('jsonwebtoken');
const { includes } = require('lodash');
const aedes = require('aedes')();
const debug = require('debug')('mqtt');
const config = require('../config');

aedes.authenticate = async (client, username, password, callback) => {
  const myClient = client;
  debug('mqtt auth', username, password);
  try {
    const decoded = jwt.verify(password.toString(), config.jwt.password);
    myClient.user = decoded;
    if (myClient.user) {
      debug('mqtt authed', myClient.user);
      return callback(null, 'ok');
    }
  } catch (e) {
    debug('mqtt error authenticating', e);
    return callback(e);
  }

  return callback('nope');
};

aedes.on('client', (client) => {
  debug('onclient', client.user);
  if (client.user) {
    const topic = `/users/${client.user.id}`;
    client.subscribe({ topic, qos: 0 }, (ok) => {
      debug('user subscribed', topic, ok);
    });

    if (includes(client.user.scope, 'DOOR')) {
      client.subscribe({ topic: '/door/updates', qos: 0 }, (ok) => {
        debug('roor subscribed', topic, ok);
      });
    }

    if (includes(client.user.scope, 'ADMIN')) {
      client.subscribe({ topic: '/admin/updates', qos: 0 }, (ok) => {
        debug('admin subscribed', topic, ok);
      });
    }
  }
});

aedes.authorizeSubscribe = (client, sub, callback) => {
  debug('authorizeSubscribe', client.user, sub);
  const { user } = client;
  if (user) {
    if (sub.topic.startsWith(`/users/${user.id}`)) {
      return callback(null, sub);
    } if (sub.topic.startsWith('/admin/') && includes(user.scope, 'ADMIN')) {
      return callback(null, sub);
    } if (sub.topic.startsWith('/door/') && includes(user.scope, 'DOOR')) {
      return callback(null, sub);
    }
  }

  return callback(new Error('wrong topic'));
};

aedes.on('publish', (packet, client, cb) => {
  debug('publish', packet.topic, packet.payload.length, client ? client.id : 'noclient', cb);
});

function publish(topic, p) {
  let payload = p;
  if (payload && typeof payload === 'object') {
    payload = JSON.stringify(payload);
  } else {
    payload = String(payload);
  }
  aedes.publish({ topic, payload });
}

module.exports = {
  mqtt: aedes,
  publish,
};
