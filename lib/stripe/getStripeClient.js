const Stripe = require('stripe');
const config = require('../../config');

let stripe;

module.exports = function getStripeClient() {
  if (!stripe) {
    stripe = new Stripe(config.stripe_api_key, { apiVersion: '2022-11-15' });
  }

  return stripe;
};
