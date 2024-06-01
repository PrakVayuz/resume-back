const natural = require('natural');
const stopwords = require('natural').stopwords;
// const helpingVerbs = ['am', 'is', 'are', 'was', 'were', 'been', 'being', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'may', 'might', 'must', 'should', 'ought to', 'shall', 'will', 'would',"to","To","and","And","using","the","with","date","other"]
 


const calculateMatchScore1 = (resumeText, descriptionText) => {
   
    const tokenizer = new natural.WordTokenizer();
    const resumeTokens = tokenizer.tokenize(resumeText.toLowerCase()); 
    const descriptionTokens = tokenizer.tokenize(descriptionText.toLowerCase()); 
  
    
    let matchingWords = descriptionTokens.filter(word => resumeTokens.includes(word));
    matchingWords = matchingWords.filter(word => {
        return !stopwords.includes(word);
      });


    // const contentWords = words.filter(word => {
    //     return !stopwords.includes(word);
    //   });
  
    // Calculate the match score as a percentage
    const percentageMatchScore = (matchingWords.length / descriptionTokens.length) * 100;
  
    // Return match score and matching words
    return {
        matchScore: percentageMatchScore,
        matchingWords: matchingWords
    };
};



module.exports = {
   calculateMatchScore1
};