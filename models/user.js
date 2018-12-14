const sqlite3 = require("sqlite3");
const validator = require("validator"); // https://www.npmjs.com/package/validator

const bcrypt = require('bcrypt');
const { UserOperations } = require('./user_operations.js');
const { Food } = require('./food');


const {passwordRules} = require('./../utilities/passwordValidations.js');

const USER_PARAMS = () => ({
        name: "",
        city: "",
        country: "",
        email: "",
        password: ""
});

class User extends UserOperations {
    constructor(user_params){
        super();
        this.id = user_params.id;
        this.name = user_params.name;
        this.city = user_params.city;
        this.country = user_params.country;
        this.email = user_params.email;
        this.password = user_params.password;
        this.password_digest = user_params.password_digest;
        
        if (!this.password_digest &&
             user_params.password && 
             passwordRules.validate(user_params.password)) 
            this.set_password(user_params.password);

        this.created_at = user_params.created_at;
        this.updated_at = new Date();

        this.passwordRules = passwordRules;

        // instantiate the user's nutrition data from the user's id and email
        this.food = undefined;
        Food.find_by_id(this.id, (food) => this.food = food ? food : new Food({
            id: this.id,
            email: this.email,
        }));
    }

    set_password(new_password){
        this.password = new_password;
        const setHash = ((h) => this.password_digest = h).bind(this);
        
        bcrypt.hash(new_password, 10, (e,h) => h ? setHash(h) : e);
    }

    check_password(other_password){
        return bcrypt.compareSync(other_password, this.password_digest);
    }
    static find_by_email(email, callback) {

        if (!validator.isEmail(email)) callback("invalid email");
        else {
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.serialize(function () {
                db.run(
                    `SELECT * FROM users WHERE users.email = :em LIMIT 1`, {
                        em: email
                    }, (e, usr) => {
                        if (usr) callback(e, new User(usr));
                        else callback(e);
                        db.close();
                });
            });
        }
    };

    create_new(callback = (e) => e){

        let errors = validate_user();
        if (errors.length > 0) return callback(errors);
        else {
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.serialize(function () {
                // check if there already is this user
                let already_has_usr = false;

                db.run(
                    `SELECT * FROM users WHERE users.email = :em LIMIT 1`, {
                        em: this.email
                    }, (e, usr) => { if (usr) already_has_usr = true; } // found that we already have a user
                );

                if (already_has_usr) { // return early if already have user
                    callback("user already exists");
                    db.close();
                } else { // add user

                    if(!this.password_digest && this.password) this.set_password(this.password); // set the hash


                    const set_food_data = ((usr) => {
                        this.food.user_id = usr.id;
                        this.food.user_id = usr.email;
                        this.food.create_new();
                    }).bind(this);
                    db.run(
                        `INSERT INTO users 
                            (name, city, country, email, password_digest, updated_at) 
                        VALUES 
                            (:n,:c,:ctry,:e, :pwd)`, {
                            n: this.name,
                            c: this.city,
                            ctry: this.country,
                            e: this.email,
                            pwd: this.password_digest
                        }, (e, usr) => {
                            if (usr) {
                                set_food_data(usr);
                                callback(usr);
                            }
                            else callback(e);
                            db.close();
                        }
                    );
                }
            });
        }
    };

   

    validate_user(){
        let errors = [];

        if (!this.email || !validator.isEmail(this.email))
            errors.push("invalid email");
        if (!this.name || (this.name.length > 0 && !validator.isAlphanumeric(this.name)))
            errors.push("please use only letters or numbers for your name");
        
        let pw_errs = this.password_errors(this.password);
        if(pw_errs.length > 0) errors.push(pw_errs);

        return errors;
    };

    password_errors() {
        if (this.password) 
            return passwordRules.validate(this.password, { list: true }).join(" ");
        else 
            return "password required";
            
    }

}



module.exports = {  User, USER_PARAMS }