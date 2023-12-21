const { Pool } = require('pg')

const productionPool = new Pool({
    user: "flickthebean",
    host: "dpg-ck4bqauct0pc739fvppg-a.frankfurt-postgres.render.com",
    database: "flickthebean",
    password: "TN0OoZNhWYP2csl2xxWEXPpW7wzgJQMs",
    port: 5432,
    max: 20, // Set max pool size to 20
    ssl: true
});

const testPool = new Pool({
    user: "postgres",
    host: "postgres",
    database: "postgres",
    password: "postgres",
    port: 5432,
    max: 20, // Set max pool size to 20
});

module.exports = process.env.NODE_ENV === 'production' ? productionPool : testPool;


