const breadRoutes = require('../lib/breadRoutes');
const accessControlUnitsModel = require('../models/access_control_units');

module.exports = [
  ...breadRoutes({ model: accessControlUnitsModel })
];
