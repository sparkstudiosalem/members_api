const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'access_control_units',
  schema: {
    id: Joi.string().required(),
    type: Joi.string().required(),
    url: Joi.string().required(),
    updated_at: Joi.date(),
  },
});

module.exports = model;
