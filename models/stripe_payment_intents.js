const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'stripe_payment_intents',
  schema: {
    id: Joi.string().required(),
    stripe_customer_id: Joi.string().uuid().required(),
    user_id: Joi.string().required(),
    amount_cents: Joi.number().integer().required(),
    received_at: Joi.date().required(),
  },
});

module.exports = model;
