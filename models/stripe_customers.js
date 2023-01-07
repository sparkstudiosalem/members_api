const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'stripe_customers',
  schema: {
    id: Joi.string().required(),
    user_id: Joi.string().uuid().required(),
  },
});

module.exports = model;
