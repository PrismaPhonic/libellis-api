/** Database setup for libellis. */

const Pool = require('pg-pool');
const url = require('url');
const { DB_URI } = require("./config");

const params = url.parse(DB_URI);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: 5432,
  database: 'libellis',
  ssl: false
};

const pool = new Pool(config);

module.exports = pool;
