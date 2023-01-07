const Debug = require('debug');
const runAbortableJob = require('../utils/jobs/runAbortableJob');
const jobCursors = require('../utils/jobs/jobCursors');
const getStripeClient = require('../lib/stripe/getStripeClient');
const iterateStripeCollection = require('../lib/stripe/iterateStripeCollection');
const ingestStripe = require('../lib/stripe/ingestStripe');

const debug = Debug('ingestStripeCustomers');

/**
 * @param {AbortSignal} abortSignal
 * @param {{ shouldCreateUsers: boolean }} options
 */
async function ingestStripeCustomers(abortSignal, { shouldCreateUsers }) {
  const allStripeCustomersCursor = jobCursors.ingestStripeCustomers('all');

  await iterateStripeCollection({
    abortSignal,
    initialCursor: await allStripeCustomersCursor.get(),
    setCursor: allStripeCustomersCursor.set,

    /**
     *
     * @param {AbortSignal} abortSignal
     * @param {string | undefined} cursor
     * @returns Promise<{ data: unknown[], has_more: boolean }>
     */
    getPage: (_abortSignal, cursor) => {
      return getStripeClient().customers.list({
        starting_after: cursor,
      });
    },

    processRecord: (record) => ingestStripe(record, { shouldCreateUsers }),
  });

  debug('Finished processing Stripe Customers until final record');
}

/**
 * @param {AbortSignal} abortSignal
 */
runAbortableJob((abortSignal) => ingestStripeCustomers(abortSignal, { shouldCreateUsers: true }));
