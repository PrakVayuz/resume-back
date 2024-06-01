const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const preprocessText = (text) => {
    return text.replace(/[^\w\s]/gi, '').toLowerCase();
};

const preprocessSections = (sections) => {
    const tokenizedSections = {};
    for (const section in sections) {
        tokenizedSections[section] = tokenizer.tokenize(preprocessText(sections[section]));
    }
    return tokenizedSections;
};

const splitIntoSections = (resumeText) => {
    const sectionHeaders = {
        profileSummary: ['profilesummary'],
        education: ['education', 'degree', 'college', 'university'],
        experience: ['experience', 'work', 'employment'],
        projects: ['projects', 'project'],
        skills: ['skills', 'technicalskills'],
        certificates: ['certificate', 'certification', 'certified', 'achievements']
    };

    const sections = {
        profileSummary: '',
        education: '',
        experience: '',
        projects: '',
        skills: '',
        certificates: ''
    };

    let currentSection = null;
    const lines = resumeText.split(/\r?\n/);
    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        for (const section in sectionHeaders) {
            if (sectionHeaders[section].some(header => lowerLine.includes(header))) {
                currentSection = section;
                break;
            }
        }
        if (currentSection) {
            sections[currentSection] += line + ' ';
        }
    });
    return sections;
};

module.exports = {
    preprocessText,
    preprocessSections,
    splitIntoSections
};
