// this is the reference daily intake as suggested on wikipedia and FDA
// https://en.wikipedia.org/wiki/Reference_Daily_Intake

 const RDIReference = Object.freeze({
    Energ_Kcal: 3000,
    FA_Sat_g: 20,
    FA_Poly_g: 20,
    FA_Mono_g: 38,
    Cholestrl_mg: 300,
    Sodium_mg: 2300,
    Potassium_mg: 4700,
    Carbohydrt_g: 300,
    Sugar_Tot_g: 25,
    Fiber_TD_g: 28,
    Protein_g: 60,
    Vit_A_IU: 900,
    Vit_C_mg: 90,
    Choline_Tot_mg:	550,
    Potassium_mg: 4700,
    Calcium_mg:	1300,
    Iron_mg: 8,
    Niacin:  16,
    Vit_B12_mcg: 1,
    Vit_K_mcg: 50,
    Zinc_mg: 15,
    Copper_mg: 0.1,
    Magnesium_mg: 400,
    Manganese_mg: 2.3,
    Water_g: 3700,
    Folate_Tot_mcg: 400,
    Vit_B6_mg: 1.3,
    Vit_D_mcg: 4.8,
    Vit_E_mg: 15,
    Selenium_mcg: 0.2,
    Phosphorus_mg: 700,
    Panto_Acid_mg: 5,
    Riboflavin_mg: 1.3,
    Thiamin_mg: 1.2,

// the following values are not in the database thought htey are in the fda list
// Biotin	30 μg
// Chromium	35 μg]
// Fluoride	4 mg
// Iodine	    150 μg

// Molybdenum	45 μg
// Chloride	2.3 g

});

// check if the last reset time of the nutrition tracking was >= 24 hours
// let udntst = window.sessionStorage.getItem("userDefaultNutritionTrackStartTime");
// if (
//   !window.sessionStorage.getItem("userDefaultNutritionTrack") ||
//   (udntst && Math.abs(new Date() - Date.parse(udntst)) / 3600000 >= 24) // https://stackoverflow.com/questions/19225414/how-to-get-the-hours-difference-between-two-date-objects
// ) {
//   window.sessionStorage.setItem(
//     "userDefaultNutritionTrackStartTime",
//     new Date().toString()
//   );
//   window.sessionStorage.setItem(
//     "userDefaultNutritionTrack",
//     JSON.stringify({
//       Energ_Kcal: 0,
//       FA_Sat_g: 0,
//       FA_Poly_g: 0,
//       FA_Mono_g: 0,
//       Cholestrl_mg: 0,
//       Sodium_mg: 0,
//       Potassium_mg: 0,
//       Carbohydrt_g: 0,
//       Sugar_Tot_g: 0,
//       Fiber_TD_g: 0,
//       Protein_g: 0,
//       Vit_A_IU: 0,
//       Vit_C_mg: 0,
//       Choline_Tot_mg: 0,
//       Potassium_mg: 0,
//       Calcium_mg: 0,
//       Iron_mg: 0,
//       Niacin: 0,
//       Vit_B12_mcg: 0,
//       Vit_K_mcg: 0,
//       Zinc_mg: 0,
//       Copper_mg: 0,
//       Magnesium_mg: 0,
//       Manganese_mg: 0,
//       Water_g: 0,
//       Folate_Tot_mcg: 0,
//       Vit_B6_mg: 0,
//       Vit_D_mcg: 0,
//       Vit_E_mg: 0,
//       Selenium_mcg: 0,
//       Phosphorus_mg: 0,
//       Panto_Acid_mg: 0,
//       Riboflavin_mg: 0,
//       Thiamin_mg: 0
//     })
//   );
// }