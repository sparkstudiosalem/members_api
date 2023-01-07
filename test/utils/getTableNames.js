const { SchemaInspector } = require('knex-schema-inspector');
const knex = require('../../knex');

const inspector = SchemaInspector(knex);

async function getTableNames() {
  return (await inspector.tables()).filter((tableName) => {
    return !tableName.startsWith('knex_');
  });
}

module.exports = getTableNames;
