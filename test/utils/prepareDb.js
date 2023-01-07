const knex = require('../../knex');

function prepareDb(lab) {
  lab.before(async () => {
    await knex.migrate.rollback(true);
    await knex.migrate.latest();
  });

  lab.after(async () => {
    await knex.migrate.rollback(true);
  });
}

module.exports = prepareDb;
