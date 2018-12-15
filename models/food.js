const sqlite3 = require("sqlite3");
const ZeroIntakeTemplate = require('./resources/zero_intake_template');
const RecommendedIntake = require('./resources/rdi_reference');

class Food {

    constructor(user_params){
        // initialize the current intake
        this.id = undefined;
        this.created_at = undefined;
        this.updated_at = new Date();
        this.last_reset_time = undefined;

        this.current_intake = undefined;

        this.user_id = user_params.id;
        this.email = user_params.email;
    }
    
    static find_by_id(user_id, callback){
        // get the current data for the user if it exists
        (new Food({ id: user_id })).find_user_data((user_data) =>
            callback(user_data.id ? user_data : false));
    }


    async find_user_data(callback) {
        let user_id = this.user_id;

        const setState = ((food_data)=> {
            this.id = food_data.id;
            this.current_intake = food_data.current_intake || new ZeroIntakeTemplate();
            this.created_at = food_data.created_at;
            this.last_reset_time = food_data.last_reset_time || new Date();
            let time_since_last_update = Math.abs(new Date() - Date.parse(this.last_reset_time)) / 3600000;
            if (time_since_last_update >= 24) {
                this.current_intake = new ZeroIntakeTemplate();
                this.last_reset_time = new Date();
            }
        }).bind(this);


        if(!user_id) return "no user id";
        const db = new sqlite3.Database("../../db/Nutrition.db");
        await db.run(`SELECT * FROM  usr_nutr_intake WHERE user_id = :usrId LIMIT 1`, {
            usrId: user_id
          }, (e, usr_data) => {
              setState(usr_data);
        });

        callback(this);
    }

    create_new(){
        if(!this.id){
            const db = new sqlite3.Database("../../db/Nutrition.db");
            db.run(`INSERT INTO 
                usr_nutr_intake 
                    (current_intake, user_id, email, last_reset_time) 
                VALUES 
                    (:ci, :ui, :em, :lrt)`, {
                ci: this.current_intake,
                ui: this.user_id,
                em: this.email,
                lrt: this.last_reset_time
            });
        } else return "user already exists";
    }

    update_food_data(){
        db.run(
          `UPDATE usr_nutr_intake 
            SET 
                current_intake = :ci, 
                email = :em, 
                last_reset_time = :lrt, 
                updated_at = :ua 
            WHERE 
                usr_nutr_intake.id = :food_id`, {
            food_id: this.id,
            ci: this.current_intake,
            ua: this.updated_at,
            lrt: this.last_reset_time,
            em: this.email
        });
    }


    food_item(fooditem, callback) {
        const db = new sqlite3.Database("../../db/Nutrition.db");
        // console.log("scan food", fooditem);
        let food_arr = fooditem.split(" ");
        let food_str = food_arr.length > 0 ? `Shrt_Descrpt LIKE "%${food_arr[0]}%"` : `Shrt_Descrpt LIKE ""`;
        for(let i = 1; i < food_arr.length; ++i){
            food_str += ` AND Shrt_Descrpt LIKE "%${food_arr[i]}%"`
        }
        db.serialize(function() {
            db.all(`SELECT * FROM NutritionFacts WHERE ${food_str} LIMIT 100`, (e, rows) => {
                if (rows) callback(rows);
                else callback(e);
                db.close();
            });
        });
    };

    // updates in memory intake info
    // save to the database by calling this.update_food_data()
    update_current_intake(food_item){
        let keys = Object.keys(food_item); // the keys of the nutrient values (e.g. calcium, fat, protein)
        for(let i = 0; i < keys.length; ++i){
            this.current_intake[keys[i]] += food_item[keys[i]];
        }
    }

}
module.exports = { Food };