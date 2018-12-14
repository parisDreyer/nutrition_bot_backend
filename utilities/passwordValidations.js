
const passwordValidator = require("password-validator");

// create a 'schema'
const passwordRules = new passwordValidator();
passwordRules	                                    // Add rules to the validator schema
    .is().min(6)                                    // Minimum length 6
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


module.exports = {passwordRules};