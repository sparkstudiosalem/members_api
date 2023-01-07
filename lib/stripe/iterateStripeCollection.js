const Debug = require('debug');
const sleep = require('../../utils/sleep');

const debug = Debug('iterateStripeCollection');

/**
 * @param {{
 *   abortSignal: AbortSignal
 *   initialCursor: string | undefined
 *   setCursor: (cursor: string) => Promise<void>
 *   getPage: (abortSignal: AbortSignal, cursor: string | undefined) => Promise<{ has_more: boolean; data: { id: string }[] }>
 *   processRecord: (record) => Promise<void>
 * }} options
 */
async function iterateStripeCollection(options) {
  const {
    abortSignal, initialCursor, setCursor, getPage, processRecord
  } = options;

  let hasMore = true;
  let cursor = initialCursor;
  let pagesProcessed = 0;
  let isCanceled = false;
  function onAbort() {
    isCanceled = true;
  }
  abortSignal.addEventListener('abort', onAbort);

  while (hasMore && !isCanceled) {
    debug('Processing page: %d, cursor: %s', pagesProcessed + 1, cursor);

    const page = await getPage(abortSignal, cursor);

    let index = 0;
    while (page.data[index] && !isCanceled) {
      debug('Processing record %d/%d (page %d)', index + 1, page.data.length, pagesProcessed + 1);
      const record = page.data[index];
      await processRecord(record);
      await setCursor(record.id);
      cursor = record.id;
      index += 1;
    }

    // Ensure the cursor's updated_at is refreshed, even if no records were
    // processed.
    setCursor(cursor);

    debug('Finished processing page %d', pagesProcessed);
    pagesProcessed += 1;

    cursor = page.data[page.data.length - 1]?.id;
    hasMore = page.has_more;
    if (hasMore) {
      debug(
        'More records follow; sleeping before advancing to next cursor: %s',
        cursor
      );
      await sleep(1);
    } else {
      debug('No records follow');
    }
  }

  abortSignal.removeEventListener('abort', onAbort);
  debug('Exited while loop');
}

module.exports = iterateStripeCollection;
