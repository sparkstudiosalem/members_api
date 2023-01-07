const Debug = require('debug');
const { add } = require('date-fns');
const runAbortableJob = require('../utils/jobs/runAbortableJob');
const knex = require('../knex');

const debug = Debug('synchronizeAccessControlUnits');

async function synchronizeAccessControlUnit(abortSignal, accessControlUnit) {
  console.log(
    `Processing access control unit (${accessControlUnit.type}) ${accessControlUnit.url}`
  );

  return 'meow';
}

const minimumContributionToUnlockDoorsCents = 5_000;

async function synchronizeAccessControlUnits(abortSignal) {
  debug('Synchronizing access control units');

  const accessControlUnits = await knex('access_control_units')
    .where({ type: 'ACCX 4.0' })
    .select(['type', 'url']);

  const now = new Date();
  const sixtyDaysAgo = add(now, { days: -60 });
  const paidUpUserCards = (
    await knex('users')
      .leftJoin('stripe_payment_intents', 'users.id', 'stripe_payment_intents.user_id')
      .where('received_at', '>=', sixtyDaysAgo)
      .groupBy('stripe_payment_intents.user_id', 'users.id')
      .select('users.id', 'cards.card_number')
      .rightJoin('cards', 'cards.user_id', 'stripe_payment_intents.user_id')
      .having(knex.raw('SUM(amount_cents)'), '>=', minimumContributionToUnlockDoorsCents)
  )
    .map(({ id }) => id);

  const cards = await knex('cards')
    .whereIn('user_id', paidUpUserCards)
    .select(['card_number', 'permissions']);

  console.log(JSON.stringify({ paidUpUserCards, cards }, null, 2));

  try {
    await Promise.all(accessControlUnits.map((accessControlUnit) => {
      return synchronizeAccessControlUnit(abortSignal, accessControlUnit);
    }));
  } catch (error) {
    console.log(error);
  }

  // await Promise.all(
  //   accessControlUnits.map((accessControlUnit) => {
  //     return synchronizeAccessControlUnit(abortSignal, accessControlUnit);
  //   })
  // );
}

/**
 * @param {AbortSignal} abortSignal
 */
runAbortableJob((abortSignal) => synchronizeAccessControlUnits(abortSignal));
