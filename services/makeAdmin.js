const knex = require('../knex');

/**
 * @param {string} email
 */
module.exports = async function makeAdmin(email) {
  if (!email) {
    return;
  }

  const user = await knex('users')
    .where({ email })
    .select(['email', 'id'])
    .first();

  if (!user) {
    return;
  }

  const groupMembership = await knex('memberships')
    .where({ group_id: 'ADMIN', user_id: user.id })
    .first();

  if (!groupMembership) {
    const now = new Date();
    await knex('memberships')
      .insert({
        group_id: 'ADMIN',
        user_id: user.id,
        created_at: now,
        updated_at: now
      });
  }
};
