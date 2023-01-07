const Debug = require('debug');
const knex = require('../../knex');

const debug = Debug('ingestStripe');

/**
   * @param {{ email: string | undefined, id: string, name: string | undefined}} customer
   */
async function ingestStripeCustomer(customer, { shouldCreateUsers }) {
  debug(
    'Processing customer id: %s email: %s name: %s',
    customer.id,
    customer.email,
    customer.name
  );
  if (!customer.email) {
    debug('Customer has no email, skipping', customer.id);
    return;
  }

  const existingStripeCustomer = await knex('stripe_customers')
    .where({ id: customer.id })
    .select(['id', 'user_id'])
    .first();

  if (existingStripeCustomer) {
    debug('Stripe Customer record already exists; id: %s', customer.id);
    return;
  }

  const user = await knex('users')
    .where({ email: customer.email })
    .select(['id', 'email'])
    .first();

  if (user) {
    debug(
      'Creating Stripe Customer Record for existing user; id: %s',
      user.id
    );
    await knex('stripe_customers').insert({
      id: customer.id,
      user_id: user.id,
    });
  } else if (shouldCreateUsers) {
    debug(
      'Creating new user; email: %s name: %s',
      customer.email,
      customer.name
    );
    const [nextUser] = await knex('users')
      .insert({
        email: customer.email,
        name: customer.name,
      })
      .returning(['id']);

    if (!nextUser) {
      debug(
        'Failed to create user; email: %s name: %s',
        customer.email,
        customer.name
      );
      return;
    }

    debug(
      'Creating Stripe Customer Record for new user; id: %s',
      customer.id
    );
    await knex('stripe_customers').insert({
      id: customer.id,
      user_id: nextUser.id,
    });
  }
}

async function ingestStripePaymentIntent(paymentIntent) {
  if (paymentIntent.status !== 'succeeded') {
    console.log(
      `Skipping. Payment intent status is ${paymentIntent.status}, not "succeeded"`
    );
    return;
  }

  const customer = await knex('stripe_customers')
    .where({ id: paymentIntent.customer })
    .first();

  if (!customer) {
    console.log(
      `Skipping. No Stripe customer found for customer id ${paymentIntent.customer}.`
    );
    return;
  }

  await knex('stripe_payment_intents')
    .insert({
      amount_cents: paymentIntent.amount_received,
      id: paymentIntent.id,
      received_at: new Date(paymentIntent.created * 1000),
      stripe_customer_id: paymentIntent.customer,
      user_id: customer.user_id,
    })
    .onConflict('id')
    .merge();
}

async function ingestStripe(json, ...args) {
  if (json.object === 'list') {
    return Promise.all(json.data.map((data) => {
      return ingestStripe(data, ...args);
    }));
  } if (json.object === 'customer') {
    await ingestStripeCustomer(json, ...args);
  } else if (json.object === 'payment_intent') {
    await ingestStripePaymentIntent(json, ...args);
  }
}

module.exports = ingestStripe;
