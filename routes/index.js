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

const allUsers = require('./all_users');
const accessControlUnits = require('./access_control_units');
const auth = require('./auth');
const cards = require('./cards');
const certs = require('./certs');
const events = require('./events');
const health = require('./health');
const instructors = require('./instructors');
const jobs = require('./jobs');
const memberships = require('./memberships');
const noticeComments = require('./notice_comments');
const notices = require('./notices');
const postalCodes = require('./postal_codes');
const stats = require('./stats');
const userCerts = require('./user_certs');
const users = require('./users');

// Routes - Exports a default for routes to be used in index.js
module.exports = [].concat(
  allUsers,
  auth,
  accessControlUnits,
  cards,
  certs,
  events,
  health,
  instructors,
  jobs,
  memberships,
  noticeComments,
  notices,
  postalCodes,
  stats,
  userCerts,
  users,
);
