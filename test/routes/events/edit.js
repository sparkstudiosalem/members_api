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
const { omit } = require('lodash');
const { getAuthToken, makeUserIdAdmin } = require('../../fixture-client');
const server = require('../../../services/server');
const { events, users } = require('../../fixtures');
const knex = require('../../../knex');
const prepareDb = require('../../utils/prepareDb');

lab.experiment('PUT /events/', () => {
  let Authorization;

  prepareDb(lab);

  lab.before(async () => {
    const insertedUserIds = await knex('users').insert(users).returning(['id']);
    const myUserId = insertedUserIds[0].id;
    await knex('events').insert(events);

    await makeUserIdAdmin(myUserId);

    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.test('should successfully edit an event', async () => {
    const eventsToEdit = await knex('events');
    eventsToEdit[0].name = 'fookie';

    const options = {
      url: url.format(`/events/${eventsToEdit[0].id}`),
      method: 'PUT',
      headers: { Authorization },
      payload: omit(eventsToEdit[0], ['id', 'created_by', 'created_at', 'updated_at', 'deleted_at', 'is_deleted']),
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(eventsToEdit[0].id);
    expect(res.result.name).to.equal('fookie');
  });
});
