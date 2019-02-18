/** Database setup for libellis. */

const Pool = require('pg-pool');
const url = require('url');
const { DB_URI } = require('./config');

const params = url.parse(DB_URI);
const [user, password] = params.auth.split(':');
const database = params.pathname.slice(1);
const host = params.hostname;

const config = {
  user,
  password,
  host,
  database,
  port: 5432,
  ssl: false
};

console.log(config);

const pool = new Pool(config);

module.exports = pool;
