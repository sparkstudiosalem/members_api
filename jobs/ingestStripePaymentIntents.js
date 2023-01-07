const runAbortableJob = require('../utils/jobs/runAbortableJob');
const jobCursors = require('../utils/jobs/jobCursors');
const getStripeClient = require('../lib/stripe/getStripeClient');
const iterateStripeCollection = require('../lib/stripe/iterateStripeCollection');
const ingestStripe = require('../lib/stripe/ingestStripe');
const sleep = require('../utils/sleep');

/**
 * @param {string | undefined} initialCursor
 */
async function getNextCustomerId(initialCursor) {
  return (await getStripeClient().customers.list({
    limit: 1,
    starting_after: initialCursor,
  })).data[0]?.id;
}

async function processCustomPaymentIntents(abortSignal, currentCustomerId) {
  // Use another cursor to keep track of how far through each customer's
  // payment intents we have progressed.
  const perCustomerPaymentIntentCursor = jobCursors.ingestStripePaymentIntents(currentCustomerId);

  return iterateStripeCollection({
    abortSignal,
    initialCursor: await perCustomerPaymentIntentCursor.get(),
    setCursor: perCustomerPaymentIntentCursor.set,
    getPage: (_abortSignal, cursor) => {
      return getStripeClient().paymentIntents.list({
        customer: currentCustomerId,
        starting_after: cursor,
      });
    },
    processRecord: ingestStripe,
  });
}

async function ingestStripePaymentIntents(abortSignal) {
  // Use a cursor to keep track of how far through the list of customers
  // we have progressed.
  const nextCustomerCursor = jobCursors.ingestStripePaymentIntents('nextCustomer');
  let currentCustomerId = await nextCustomerCursor.get() || await getNextCustomerId();

  // Process the customer the cursor is pointing to
  while (currentCustomerId) {
    // Iterate the customer cursor forward before beginning processing on the
    // current customer's payment intents.
    const nextCustomerId = await getNextCustomerId(currentCustomerId);
    await nextCustomerCursor.set(nextCustomerId);

    // Begin processing the current customer's payment intents, starting from their
    // per-customer cursor position.
    await processCustomPaymentIntents(abortSignal, currentCustomerId);

    currentCustomerId = nextCustomerId;

    if (currentCustomerId) {
      await sleep(1);
    }
  }
}

/**
 * @param {AbortSignal} abortSignal
 */
runAbortableJob((abortSignal) => ingestStripePaymentIntents(abortSignal));
