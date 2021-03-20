const { Pool } = require('pg');

const pool = new Pool({
    host    : "localhost",
    database: "postgres",
    user    : "postgres",
    password: "postgre",
    port    : 5432,
});

exports.getPool = pool;