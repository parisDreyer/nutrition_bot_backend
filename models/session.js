const sqlite = require('sqlite3');
const crypto = require('crypto');
const validator = require("validator");

class Session {

    constructor(session_params){
        this.id = session_params.id;
        this.session_token = session_params.session_token;
        this.email = session_params.email;
        this.created_at = session_params.created_at;
        this.updated_at = new Date();

        // errors for tracking issues with the object
        this.errors = {
            email_errors: []
        };
    }

    static find_by_email(email, callback){
        if(validator.isEmail(email)){
            const setState = ((session) => new Session(session));
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.run(
                `SELECT * FROM sessions WHERE email = :em LIMIT 1`, {
                    em: email
                }, (e, session) => e ? callback(e) : callback(setState(session))
            );
        } else
            this.errors.email_errors.push("invalid email");
            
    }

    static find_by_session_token(token){
        if (session_token.length > 0) {
            const setState = ((session) => new Session(session));
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.run(
                `SELECT * FROM sessions WHERE session_token = :tok LIMIT 1`, {
                    tok: token
                }, (e, session) => e ? callback(e) : callback(setState(session))
            );
        } else
            this.errors.email_errors.push("invalid email");
    }

    update_session_token(new_token){
        if(this.id && this.email && this.session_token){
            const db = new sqlite3.Database("../../db/Nutrition.db");

            db.run(`UPDATE sessions 
                SET
                session_token = :nt 
                WHERE id = :identific 
                AND email = :em`, {
                identific: this.id,
                em: this.email,
                nt: new_token
            });
        }
    }

    delete_session(){
        if(this.id){
            const db = new sqlite3.Database("../../db/Nutrition.db");

            db.run(`DELETE FROM sessions WHERE
                    id = :identif OR
                    email = :em OR 
                    session_token = :st`, {
                        identific: this.id,
                        em: this.email,
                        st: this.session_token
            });
        }
    }

    update_email(new_email) {
        if (this.id && this.email && this.session_token) {
            const db = new sqlite3.Database("../../db/Nutrition.db");

            db.run(`UPDATE sessions 
                SET
                email = :em
                WHERE id = :identific
                AND session_token = :em`, {
                    identific: this.st,
                    em: new_email,
                    st: this.session_token
                });
        }
    }


    create_new(){
        if (this.id) this.errors.push("this session already exists");
        else if(this.email && this.session_token){
            const db = new sqlite3.Database("../../db/Nutrition.db");

            const ses_tok = this.session_token;
            const email = this.email;
            db.run((`SELECT * FROM sessions WHERE email = :em`, {
                em: this.email,
            }), (e, u) => {
                if(u) { // already exists
                    
                } else db.run(`INSERT INTO 
                    sessions (session_token, email) VALUES (:st, em)`, {
                        st: ses_tok,
                        em: email
                });
            });
            
        } else this.errors ? this.errors.push("email or session token") : "";
    }
    


    new_session_token(){
        const setToken = ((token) => this.session_token = token).bind(this);
        crypto.randomBytes(48, (err, buffer) => 
            buffer ? setToken(buffer.toString('hex')) : err);
    }

}

module.exports = { Session }