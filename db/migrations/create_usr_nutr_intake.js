var sqlite3 = require("sqlite3").verbose();

let nutr_db = new sqlite3.Database("../Nutrition.db");

// rda is 'recommended dietary allowance
nutr_db.serialize(() => {
    nutr_db.run(`DROP TABLE IF EXISTS usr_nutr_intake`);
  nutr_db.run(`create table usr_nutr_intake(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        email TEXT NOT NULL UNIQUE,
        user_id INTEGER UNIQUE,
        current_intake BLOB,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
        last_reset_time DATETIME DEFAULT (datetime('now', 'localtime'))
        )`);
  nutr_db.run(
    `CREATE UNIQUE INDEX 
        usr_nutr_intake_email ON usr_nutr_intake(email)`
  );
  nutr_db.run(
    `CREATE UNIQUE INDEX 
        usr_nutr_intake_user_id ON usr_nutr_intake(user_id)`
  );
  nutr_db.close();
});
