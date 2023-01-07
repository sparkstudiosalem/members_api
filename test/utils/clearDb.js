const Debug = require('debug');
const knex = require('../../knex');
const getTableNames = require('./getTableNames');

const debug = Debug('clearDb');

async function resetDb() {
  debug('Removing all db records');

  const tableNames = await getTableNames();

  while (tableNames.length) {
    const tableName = tableNames.shift();
    try {
      debug('Removing db records from table %s', tableName);
      await knex(tableName).del();
    } catch (error) {
      debug('Failed to remove db records from table %s; re-queueing', tableName);
      tableNames.push(tableName);
    }
  }
}

module.exports = resetDb;
