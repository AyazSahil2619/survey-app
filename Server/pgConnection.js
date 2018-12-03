// database (postgres) connection 

const pg = require('pg');

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'task1',
    password: 'admin',
    port: 5432,
});

module.exports = {
    pool : pool
}


