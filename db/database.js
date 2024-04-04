const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('./db/warns.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the warns database.');
});

module.exports = db;