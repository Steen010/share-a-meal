// get the client
const database = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = database.createPool({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0
});

module.exports = database;