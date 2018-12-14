// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { passwordRules } = require('../../utilities/passwordValidations.js');
// nutrition.js defines the nutrition dialog
const cities = require("all-the-cities"); // for city validation
const {country_abbrevs, countries } = require('./resources/countryAbbreviations');

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

// User state for greeting dialog
const { Food } =  require('../../models/food');
const { User } = require('../../models/user') 

// Minimum length requirements for DISH and Food
const FOOD_LENGTH_MIN = 2;

// Dialog IDs 
const PROFILE_DIALOG = 'profileDialog';

// Prompt IDs
const FOOD_PROMPT = 'foodPrompt';
const DISH_PROMPT = 'dishPrompt';


// user profile data prompt ids
const EMAIL_PROMPT = 'emailPrompt';
const PASSWORD_PROMPT = 'passwordPrompt';
const NAME_PROMPT = 'namePrompt';
const CITY_PROMPT = 'cityPrompt';
const COUNTRY_PROMPT = 'countryPrompt';

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a multi-turn conversation
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileAccessor property accessor for user state
 */
class Nutrition extends ComponentDialog {
  constructor(dialogId, userProfileAccessor) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw "Missing parameter.  dialogId is required";
    if (!userProfileAccessor)
      throw "Missing parameter.  userProfileAccessor is required";

    // Add a water fall dialog with 4 steps.
    // The order of step function registration is important
    // as a water fall dialog executes steps registered in order
    this.addDialog(
      new WaterfallDialog(PROFILE_DIALOG, [
        this.initializeStateStep.bind(this),
        this.promptForAccountInfoStep.bind(this),
        this.promptForFoodStep.bind(this)
      ])
    );

    // Add text prompts for various things
    this.addDialog(new TextPrompt(EMAIL_PROMPT, this.validateEmail));
    this.addDialog(new TextPrompt(PASSWORD_PROMPT, this.validatePassword));
    this.addDialog(new TextPrompt(NAME_PROMPT, this.validateName));
    this.addDialog(new TextPrompt(CITY_PROMPT, this.validateCity));
    this.addDialog(new TextPrompt(COUNTRY_PROMPT, this.validateCountry));

    this.addDialog(new TextPrompt(FOOD_PROMPT, this.validateFoodItem));

    // Save off our state accessor for later use
    this.userProfileAccessor = userProfileAccessor;
  }

  /**
   * Waterfall Dialog step functions.
   *
   * Initialize our state.  See if the WaterfallDialog has state pass to it
   * If not, then just new up an empty UserProfile object
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  async initializeStateStep(step) {
    let userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile === undefined) {
      if (step.options && step.options.userProfile) {
        await this.userProfileAccessor.set(
          step.context,
          step.options.userProfile
        );
      } else {
        await this.userProfileAccessor.set(step.context, new User());
      }
    }
    return await step.next();
  }


  async promptForAccountInfoStep(step) {
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile === undefined) return await this.greetUser(step);
    

    if (!userProfile.email) {
        return await step.prompt(EMAIL_PROMPT, "What is your email?");
    } else if(!userProfile.password){
        return await step.prompt(PASSWORD_PROMPT, "What is your password?");
    } else if(!userProfile.id){                                   // sign in if credentials are there
      User.find_by_email(userProfile.email, (e, usr) => {
        if(usr){                                                  // if there was a user in the database 
          if(usr.id && usr.check_password(userProfile.password)){ // if passwords match
            userProfile = usr;                                    // hold the user in memory for the current session
          }
        }
      });
    } else if (!userProfile.name) {
        return await step.prompt(NAME_PROMPT, "What is your name?");
    } else if (!userProfile.country) {
      return await step.prompt(COUNTRY_PROMPT, "What Country are you in?");
    } else if (!userProfile.city){
        return await step.prompt(CITY_PROMPT, "What is City are you in?");
    } else {
      if(!userProfile.id) userProfile.create_new();              // create a new user!

      return await step.next();
    }
  }


  /**
 * Waterfall Dialog step functions.
 *
 * Using a text prompt, prompt the user for their Food.
 * Only prompt if we don't have this information already.
 *
 * @param {WaterfallStepContext} step contextual information for the current step being executed
 */
  async promptForFoodStep(step) {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // if we have everything we need, greet user and return
    if (
      userProfile !== undefined &&
      userProfile.food !== undefined &&
      userProfile.food.user_id != undefined
    ) {
      return await this.greetUser(step);
    }
    if (!userProfile.food) {
      // prompt for Food, if missing
      return await step.prompt(FOOD_PROMPT, "What did you eat?");
    } else {
      return await step.next();
    }
  }


  /**
   * Waterfall Dialog step functions.
   *
   * Having all the data we need, simply display a summary back to the user.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  async displayGreetingStep(step) {
    // Save DISH, if prompted for
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile.DISH === undefined && step.result) {
      let lowerCaseDISH = step.result;
      // capitalize and set Dish
      userProfile.DISH =
        lowerCaseDISH.charAt(0).toUpperCase() + lowerCaseDISH.substr(1);
      await this.userProfileAccessor.set(step.context, userProfile);
    }
    return await this.greetUser(step);
  }



  // =================================
  // validation prompts
  // =================================






  async validateEmail(validatorContext) {
    const value = (ValidatorContext.recognized.value || '').trim();
    if (true) {
      return VALIDATION_SUCCEEDED
    } else {
      await validatorContext.sendActivity(`The value must be ${"something else"}.`);
      return VALIDATION_FAILED;
    }
  }
  async validatePassword(validatorContext) {
    const value = (ValidatorContext.recognized.value || '').trim();
    let errs = passwordRules.validate(this.password, { list: true }).join(" ");
    if (errs.length === 0) {
      return VALIDATION_SUCCEEDED
    } else {
      await validatorContext.sendActivity(`The password must be ${errs}.`);
      return VALIDATION_FAILED;
    }
  }
  async validateName(validatorContext) {
    const value = this.capitalize((ValidatorContext.recognized.value || '').trim());
    let longEnough = value.length > 0;
    let notTooLong = value.length < 101;
    if (longEnough && notTooLong) {
      return VALIDATION_SUCCEEDED
    } else {
      await validatorContext.sendActivity(`Sorry, the value ${value} is ${longEnough ? "too long": "not long enough."}`);
      return VALIDATION_FAILED;
    }
  }

  async validateCountry(validatorContext) {
    const value = (ValidatorContext.recognized.value || '').trim();
    let hasCountry = false;

    if(value.length === 2){ // check against abbreviations
      value = value.toUpperCase();
      for (let i = 0; i < country_abbrevs.length; ++i) {
        if (country_abbrevs[i].match(value)) { 
          hasCountry = true;
          break;
        }
      }
    } else if (value.length > 0){ // check against full country names
      value = this.capitalize(value);
      for(let i = 0; i < country_abbrevs.length; ++i){
        if (country[country_abbrevs[i]].includes(value)) {
            hasCountry = true;
            break;
          }
      }
    }

    if (hasCountry) {
      return VALIDATION_SUCCEEDED
    } else {
      await validatorContext.sendActivity(`The value must be ${"something else"}.`);
      return VALIDATION_FAILED;
    }
  }
  
  async validateCity(validatorContext) {
    const value = this.capitalize((ValidatorContext.recognized.value || '').trim());
    let hasCity = false;

    for(let i = 0; i < cities.length; ++i) {
      if(city.country.match(userProfile.country) && city.name.includes(value)){
        hasCity = true;
        break;
      }
    }
    if(hasCity) {
      return VALIDATION_SUCCEEDED
    } else {
      await validatorContext.sendActivity(`city not in dictionary. Try spelling and capitalizing the city name properly`);
      return VALIDATION_FAILED;
    }
  }





  /**
   * Validator function to verify that user Food meets required constraints.
   *
   * @param {PromptValidatorContext} validation context for this validator.
   */
  async validateFoodItem(validatorContext) {
    // Validate that the user entered a minimum length for their Food
    const value = (validatorContext.recognized.value || "").trim();
    if (value.length >= FOOD_LENGTH_MIN) {
      return VALIDATION_SUCCEEDED;
    } else {
      await validatorContext.context.sendActivity(
        `Food needs to be at least ${FOOD_LENGTH_MIN} characters long.`
      );
      return VALIDATION_FAILED;
    }
  }
  /**
   * Validator function to verify if DISH meets required constraints.
   *
   * @param {PromptValidatorContext} validation context for this validator.
   */
  async validateDish(validatorContext) {
    // Validate that the user entered a minimum length for their Food
    const value = (validatorContext.recognized.value || "").trim();
    if (value.length >= DISH_LENGTH_MIN) {
      return VALIDATION_SUCCEEDED;
    } else {
      await validatorContext.context.sendActivity(
        `Dish Foods needs to be at least ${DISH_LENGTH_MIN} characters long.`
      );
      return VALIDATION_FAILED;
    }
  }
  /**
   * Helper function to greet user with information in greetingState.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  async greetUser(step) {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // Display to the user their profile information and end dialog
    await step.context
      .sendActivity(`I am FoodMonk, a nutritional chatbot that suggests what to eat "
            "based on what you have eaten. Tell me the foods you have eaten for the day "
            "and i will suggest what you could eat next.`);
    await step.context.sendActivity("To start, what is your name?");
    return await step.endDialog();
  }
  
  
  
  
  // helper methods
  capitalize(str){
    return str.toLowerCase().split(" ").map(w => 
        w.charAt(0).toUpperCase() + w.substr(1)
      ).join(" ");
    }
    
}



module.exports = {  NutritionDialog: Nutrition };
