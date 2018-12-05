

const screen_input = (food_text, remove_stop_words, options = {}) => {
    
    let f = food_text.toLowerCase().split(" ");

    let st = [];    // holds the food words
    let r = [];     // holds the conversational words
    let has_should_or_could = false;
    let has_options  = false;
    let eat = false;
    for(let i = 0; i < f.length; ++i){
        if (["is", "are", "what", "do", "you", "do", "your", "purpose"].includes(f[i]))
            r.push(f[i]);   // set conversational word
        else if (["should", "could"].includes(f[i])) has_should_or_could = true;
        else if (f[i] === "eat") eat = true;
        else if (f[i] === "options") has_options = true;
        else st.push(f[i])   // set food word
    }

    if (has_should_or_could && eat) return {
        type: 1,
        text: "By default, I suggest that one could always eat vegetables. Spinach is a good choice for iron."
    }
    else if (has_options && (r.includes("are") || r.includes("you"))) return {
        type: 2,
        text: options[2]()
    }
    else if (has_should_or_could) return {
        type: 3,
        text: "You can ask me anything. What have you eaten today?"
    }
    else if (r.length > 0) return {
        type: 4, 
        text:"I am FoodMonk, a nutritional chatbot that suggests what to eat " + 
            "based on what you have eaten. Tell me the foods you have eaten for the day " +
            "and i will suggest what you coul   d eat next."
    };


    // return food search items
    return { 
        type: 0, 
        text: st.filter(el => !remove_stop_words(el)).join(" ") 
    }; 
}