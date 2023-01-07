/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  // Add new Stripe-related tables
  await knex.schema.createTable('stripe_customers', (t) => {
    t.string('id').primary();
    t.uuid('user_id').references('id').inTable('users')
      .notNullable();
  });

  await knex.schema.createTable('stripe_payment_intents', (t) => {
    t.string('id').primary();
    t.string('stripe_customer_id').references('id').inTable('stripe_customers').notNullable();
    t.uuid('user_id').references('id').inTable('users')
      .notNullable();
    t.integer('amount_cents').notNullable();
    t.dateTime('received_at').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('stripe_payment_intents');
  await knex.schema.dropTable('stripe_customers');
};
