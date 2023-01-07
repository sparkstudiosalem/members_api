const { parentPort } = require('worker_threads');

/**
 *
 * @param {(abortSignal: AbortSignal) => Promise<unknown>)} fn
 */
module.exports = async function runAbortableJob(fn) {
  const abortController = new AbortController();

  parentPort.on('message', (message) => {
    if (message === 'cancel') {
      abortController.abort();
    }
  });

  await fn(abortController.signal);

  process.exit(0);
};
