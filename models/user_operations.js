const bcrypt = require("bcrypt");

// helper for ./user.js
// wrote this external class to cut down on space in ther user script
class UserOperations {

    // updates all attributes in params
    // currently n+1 queries
    async update_attributes(user_params, callback = e => e){
        args = []
        if(user_params.email)
            await this.update_email(user_params.email, (e) => args.push(e));
        if (user_params.password) 
            await this.update_password(user_params.password, (e) => args.push(e));
        if(user_params.name)
            await this.update_min_security_attribute({ name: user_params.name }, e => args.push(e));
        if (user_params.city)
            await this.update_min_security_attribute({ city: user_params.city }, e => args.push(e));
        if (user_params.country)
            await this.update_min_security_attribute({ country: user_params.country }, e => args.push(e));
        
        callback(args);
    }
    update_min_security_attribute(options, callback = e => e) {

        let col;
        let val;

        let nothing_to_update = false;
        if (options.name && options.name.length < 35){
            col = "name";
            val = options.name
        } else if (options.city && options.city.length < 86) {//85 characters: "Taumatawhakatangi­hangakoauauotamatea­turipukakapikimaunga­horonukupokaiwhen­uakitanatahu"
                 col = "city";
                 val = options.city;
        } else if (options.country && options.country.length < 3) {
                 // https://abbreviations.yourdictionary.com/articles/country-abbreviations.html
                 col = "country";
                 val = options.country;
        } else nothing_to_update = true;


        if(nothing_to_update){
            callback("nothing to update");
        } else {
            // save this User object's variables in local variables for callback scope
            let curr_pw = this.password;
            let curr_id = this.id;
            let update_time = this.updated_at;

            const updateState = (() => {

                this[col] = val;

            }).bind(this);

            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.serialize(function () {
                // update user

                db.run(
                    `SELECT * FROM users ${col} = :user_id LIMIT 1`, {
                        user_id: curr_id
                    }, (e, usr) => {
                        if (usr) valid_password = bcrypt.compareSync(curr_pw, usr.password_digest); // have the right password for the current user?
                        if (valid_password) {                                                       // do the update
                            db.run(`UPDATE users set ${col} = :new_hash, updated_at = :ut WHERE id = :user_id LIMIT 1`, {
                                new_val: val,
                                user_id: curr_id,
                                ut: update_time
                            }, (e, u) => {
                                if(e) 
                                    callback(e)
                                else if (u) {
                                    updateState();
                                    callback(u) 
                                }
                                else callback("something went wrong");
                                db.close();
                            });
                        } else {
                            callback("invalid password");
                            db.close();
                        }
                });
            });
        }
    }; 
    


    update_password(new_password, callback = e => e) {

        let errors = this.validate_user() + passwordRules.validate(new_password, {list: true});
        if(this.check_password(new_password)) errors.push("password cannot be the same as a previously used password");
        if (errors.length > 0) callback(errors);
        else {
            // save this User object's variables in local variables for callback scope
            let curr_pw = this.password;
            let curr_id = this.id;
            let update_time = this.updated_at;
            let new_hash = bcrypt.hashSync(new_password, 10);



            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.serialize(function () {

                db.run(
                    `SELECT * FROM users WHERE users.id = :user_id LIMIT 1`, {
                        user_id: curr_id
                    }, (e, usr) => {
                        if (usr) valid_password = bcrypt.compareSync(curr_pw, usr.password_digest); // have the right password for the current user?
                        if (valid_password) {           // do the update

                            const updateState = (() => {

                                this.password = new_password;
                                this.password_digest = new_hash;

                            }).bind(this);

                            db.run(`UPDATE users set password_digest = :new_hash, updated_at = :ut WHERE id = :user_id LIMIT 1`, {
                                new_hash: new_hash,
                                user_id: curr_id,
                                ut: update_time
                            }, (e, u) => {
                                if(e)
                                    callback(e)
                                else if (u){
                                    updateState();
                                    callback(u) 
                                } else
                                    callback("something went wrong");
                                db.close();
                            });
                        } else {
                            callback("invalid password");
                            db.close();
                        }
                });
            });
        }
    }; 



    // updates the current email in this objects state
    // and updates the email in the database for the user and for the usr_nutr_intake
    update_email(new_email, callback = e => e) {

        let errors = this.validate_user();
        if (errors.length > 0) callback(errors);
        else {
            // save this User object's variables in local variables for callback scope
            let curr_pw = this.password;
            let curr_email = this.email;
            let curr_id = this.id;
            let update_time = this.updated_at;
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.serialize(function () {
                // check if there already is this user
                let already_has_usr = false;
                let valid_password = false;                     // only update if the passwords match
                db.run(
                    `SELECT * FROM users WHERE users.email = :em LIMIT 1`, {
                        em: new_email
                    }, (e, usr) => {
                        if (usr) {
                            already_has_usr = true;             // user already exists for the email we want?
                        }
                });

                if (already_has_usr) {                          // return early if already have user
                    callback("user already exists");
                    db.close();
                }
                else { // update user

                    const updateState = (() => {
                        
                        this.email = new_email;

                        // update the food data with the new email address
                        this.food.user_id = this.id;
                        this.food.email = new_email;
                        this.food.update_food_data();

                    }).bind(this);

                    db.run(
                        `SELECT * FROM users WHERE id = :user_id AND users.email = :em LIMIT 1`, {
                            user_id: curr_id,
                            em: curr_email
                        }, (e, usr) => {
                            if (usr) valid_password = bcrypt.compareSync(curr_pw, usr.password_digest); // have the right password for the current user?
                            if (valid_password) {           // do the update
                                db.run(`UPDATE users set email = :newemail, updated_at = :ut WHERE id = :user_id LIMIT 1`, {
                                    newemail: new_email,
                                    user_id: curr_id,
                                    ut: update_time
                                }, (e, u) => {
                                    if(e) 
                                        callback(e)
                                    else if (u) {
                                        
                                        updateState();
                                        callback(u)
                                    }
                                    else
                                        callback("something went wrong");
                                    db.close();
                                });
                            } else {
                                callback("invalid password");
                                db.close();
                            }
                    });
                }
            });
        }
    };

};

module.exports = { UserOperations };