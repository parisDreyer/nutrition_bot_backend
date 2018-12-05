var sqlite3 = require('sqlite3').verbose();

let nutr_db = new sqlite3.Database("../Nutrition.db");

nutr_db.serialize(() => {
    nutr_db.run(`drop table if exists sessions`);
    nutr_db.run(`create table sessions(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        session_token TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
        )`);
    nutr_db.run(
        `CREATE UNIQUE INDEX 
        sessions_email ON sessions(email)`
    );
    nutr_db.run(
        `CREATE UNIQUE INDEX 
        session_tokens ON sessions(session_token)`
    );
    nutr_db.close();
});