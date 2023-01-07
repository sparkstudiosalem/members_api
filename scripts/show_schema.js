const { SchemaInspector } = require('knex-schema-inspector');
const knexClient = require('../knex');

const inspector = SchemaInspector(knexClient);

function cleanColumnInfo(rest) {
  return Object.fromEntries(Object.entries(rest).filter(([key, value]) => {
    if (value === null) {
      return false;
    }

    if (key === 'is_nullable') {
      if (value === true) {
        return false;
      }
    } else if ((key.startsWith('is_') || key.startsWith('has_')) && value === false) {
      return false;
    }

    return true;
  }));
}

(async () => {
  const tableNames = await inspector.tables();
  const columnNames = await Promise.all(tableNames.map((tableName) => inspector.columns(tableName)));
  const columnInfos = (await Promise.all(columnNames.map(({ column, table }) => inspector.columnInfo(table, column)))).flatMap((tableColumnInfos) => tableColumnInfos);
  const foreignKeys = await inspector.foreignKeys();

  const result = columnInfos.reduce((acc, columnInfo) => {
    const {
      table,
      name,
      ...rest
    } = columnInfo;

    if (!acc[table]) {
      acc[table] = { columns: {} };
    }

    acc[table].columns[name] = cleanColumnInfo(rest);

    return acc;
  }, {});

  foreignKeys.forEach((foreignKey) => {
    const { table, column, ...rest } = foreignKey;
    if (!result[table].foreignKeys) {
      result[table].foreignKeys = {};
    }
    result[table].foreignKeys[column] = rest;
  });

  await knexClient.destroy();

  console.log(JSON.stringify(result, null, 2));
})();
