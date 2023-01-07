const makeAdmin = require('./services/makeAdmin');

makeAdmin(process.env.ADMIN_EMAIL);
require('./services/server');
require('./services/mqtt');
require('./services/jobs');
