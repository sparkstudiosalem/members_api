const knex = require('../../knex');

/**
 * @param {string} cursorFamily
 */
function createJobCursor(cursorFamily) {
  /**
   * @param {string} cursorId
   */
  return (cursorName) => {
    const cursorId = `${cursorFamily}:${cursorName}`;

    return {
      get: async () => {
        return (
          await knex('job_cursors')
            .where({ id: cursorId })
            .select(['cursor', 'id'])
            .first()
        )?.cursor;
      },
      /**
       * @param {string | undefined} nextCursor
       * @returns Promise<void>
       */
      set: async (nextCursor) => {
        await knex('job_cursors')
          .insert({ cursor: nextCursor, id: cursorId, updated_at: new Date(), })
          .onConflict('id')
          .merge();
      },
    };
  };
}

// Ensure a unique list of cursors namespaces in the `job_cursors` table
// Individual cursors may be one-per job, such as
//   ingestStripeCustomers:all,
// Or per-record such as ingestStripePaymentIntents:cus_12345
/** @type {Record<string, (cursorName: string) => { get: () => Promise<string | undefined>, set: (previousCursor: string | undefined, nextCursor: string | undefined) => Promise<void>}>} */
const jobCursors = [
  'ingestStripeCustomers',
  'ingestStripePaymentIntents',
].reduce((acc, cursorFamily) => {
  acc[cursorFamily] = createJobCursor(cursorFamily);
  return acc;
}, {});

module.exports = jobCursors;
