const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'job_cursors',
  schema: {
    id: Joi.string().required(),
    cursor: Joi.string(),
    updated_at: Joi.date().required(),
  },
});

module.exports = model;
