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

const debug = require('debug')('errors');
const config = require('../config');
const knex = require('../knex');

async function health() {
  try {
    const [migration] = await knex.raw('SELECT * FROM knex_migrations ORDER BY name DESC LIMIT 1;');

    return {
      status: 'Healthy',
      version: config.version,
      uptime: Math.round(process.uptime() / 60) + ' Minutes',
      migration,
      env: config.env
    };
  } catch (error) {
    debug('health error', error);
    throw error;
  }
}

module.exports = health;
