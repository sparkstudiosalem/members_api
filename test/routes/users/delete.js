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

const server = require('../../..');
const { destroyRecords, getAuthToken } = require('../../fixture-client');
const { users } = require('../../fixtures');
const knex = require('../../../knex');

lab.experiment('DELETE /users/', () => {
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users });
  });

  lab.test('should fail if trying to delete an unauthorized user', async () => {
    const user2 = await knex('users').offset(1).first('id');
    const options = {
      url: url.format(`/users/${user2.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(403);
  });

  lab.test('should successfully delete a user', async () => {
    const user1 = await knex('users').offset(0).first('id');
    const options = {
      url: url.format(`/users/${user1.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(user1.id);
    expect(res.result.is_deleted).to.equal(true);
  });
});
