// Copyright 2019 Iced Development, LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { expect } = require('@hapi/code');
// eslint-disable-next-line
const lab = exports.lab = require('@hapi/lab').script();
const url = require('url');
const { getAuthToken } = require('../../fixture-client');
const server = require('../../../services/server');
const { users } = require('../../fixtures');
const knex = require('../../../knex');
const prepareDb = require('../../utils/prepareDb');

lab.experiment('GET /users/', () => {
  let user;
  let Authorization;

  prepareDb(lab);

  lab.before(async () => {
    await knex('users').insert(users);
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.test('should retrieve my information when logged in', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          email: users[0].email,
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result[0].email).to.equal(user.email);
      done();
    });
  });

  lab.test('should error with invalid query', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          kaboom: users[0].email,
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });
  lab.test('should return empty array if none found', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          email: 'hardyharharharhar',
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result).to.be.empty();
      done();
    });
  });

  lab.test('should error with no auth', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          email: users[0].email,
        },
      }),
      method: 'GET',
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
});
