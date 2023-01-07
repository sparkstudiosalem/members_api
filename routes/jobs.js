const Joi = require('joi');
const bree = require('../services/jobs');
const breadRoutes = require('../lib/breadRoutes');
const jobCursorsModel = require('../models/job_cursors');
const jobs = require('../jobs/index');

module.exports = [
  ...breadRoutes({ model: jobCursorsModel, skip: ['edit', 'add', 'delete'] }),
  {
    method: 'GET',
    path: '/jobs',
    config: {
      auth: {
        strategies: ['jwt'],
        scope: 'ADMIN',
      },
    },
    handler: () => jobs,
  },
  {
    method: 'POST',
    path: '/jobs/{jobName}/run',
    config: {
      auth: {
        strategies: ['jwt'],
        scope: 'ADMIN',
      },
      handler: async (req, h) => {
        await bree.run(req.params.jobName);
        return h.response().code(204);
      },
      description:
        'Run the named job. Monitor server logs to follow job progress.',
      notes: 'Runs named job',
      tags: ['api', 'jobs'],
      validate: {
        params: Joi.object({ jobName: Joi.string() }),
      },
    },
  },
];
