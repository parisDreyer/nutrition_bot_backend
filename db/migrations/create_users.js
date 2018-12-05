var sqlite3 = require('sqlite3').verbose();

let nutr_db = new sqlite3.Database("../Nutrition.db");

nutr_db.serialize(()=>{
    nutr_db.run(`drop table if exists users`);
    nutr_db.run(`create table users(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            city TEXT,
            country TEXT,
            email TEXT NOT NULL UNIQUE,
            password_digest TEXT NOT NULL,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
        )`);
    nutr_db.run(
        `CREATE UNIQUE INDEX 
        users_email ON users(email)`
    );
    nutr_db.close();
});