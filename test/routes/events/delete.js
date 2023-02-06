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
const server = require('../../../services/server');
const knex = require('../../../knex');
const { getAuthToken, makeUserIdAdmin } = require('../../fixture-client');
const { events, users } = require('../../fixtures');
const prepareDb = require('../../utils/prepareDb');

lab.experiment('DELETE /events/', () => {
  let Authorization;
  let myUserId;

  prepareDb(lab);

  lab.before(async () => {
    const insertedUserIds = await knex('users').insert(users).returning(['id']);
    await knex('events').insert(events);
    myUserId = insertedUserIds[0].id;

    await makeUserIdAdmin(myUserId);

    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.test('should successfully delete an event', async () => {
    const sampleEvent = await knex('events').first('id', 'is_deleted');
    const options = {
      url: url.format(`/events/${sampleEvent.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(sampleEvent.id);
    expect(res.result.is_deleted).to.equal(true);
  });
});
