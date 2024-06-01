const natural = require('natural');
const { performance } = require('perf_hooks');
const { preprocessText, preprocessSections, splitIntoSections } = require('../utils/preprocess');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const calculateMatchScore = async (resumeText, jobData, grammarCheckEnabled, typoCheckEnabled, isJD) => {
    const startTime = performance.now();

    const resumeSections = splitIntoSections(resumeText);
    const tokenizedSections = preprocessSections(resumeSections);

    console.log("Resume Sections", resumeSections);
    console.log("Resume Text",resumeText);
    console.log("Tokenized Sections", tokenizedSections);

    // Convert all text to lowercase for case-insensitive comparison
    const lowercasedTokenizedSections = {};
    for (const section in tokenizedSections) {
        lowercasedTokenizedSections[section] = tokenizedSections[section].map(token => token.toLowerCase());
    }

    // Helper function to split concatenated keywords
    const splitConcatenatedKeywords = (keywordsString, knownKeywords) => {
        const regex = new RegExp(knownKeywords.join('|'), 'gi');
        return keywordsString.match(regex) || [];
    };

    // Skill comparison
    const jobSkillsSet = new Set(jobData.skills.map(skill => stemmer.stem(skill.toLowerCase())));
    const resumeSkills = lowercasedTokenizedSections.skills.flatMap(section =>
        splitConcatenatedKeywords(section, Array.from(jobSkillsSet))
    );
    const matchingSkills = resumeSkills.filter(skill => jobSkillsSet.has(stemmer.stem(skill)));
    const skillMatchScore = (matchingSkills.length / jobData.skills.length) * 100;

    console.log("Matching Skills", matchingSkills, skillMatchScore);

    // Experience comparison
    const jobExperience = stemmer.stem(jobData.experience.toLowerCase());
    const resumeExperience = lowercasedTokenizedSections.experience.flatMap(section =>
        splitConcatenatedKeywords(section, [jobExperience])
    );
    const experienceScore = resumeExperience.length > 0 ? 100 : 0;

    console.log("Matching Experience", resumeExperience, experienceScore);

    // Project comparison

    // Count distinct projects
    const distinctProjects = countDistinctProjects(lowercasedTokenizedSections.projects);

    const projectMatchScore = distinctProjects >= 2 ? 100 : 0;

    console.log("Distinct Projects Count", distinctProjects);
    console.log("Education Token",lowercasedTokenizedSections.education);

    // Education comparison
    let latestGraduationPercentage = 0;
     const educationTokens = lowercasedTokenizedSections.education || [];
     const percentageIndex = educationTokens.findIndex(token => token.includes('percentage' || 'mark'));

    if (percentageIndex !== -1) {
        latestGraduationPercentage = extractPercentage(educationTokens);
    }



    console.log("Graduation Percentage", latestGraduationPercentage, percentageIndex, lowercasedTokenizedSections.education);

    let educationScore;
    if (latestGraduationPercentage >= 90) {
        educationScore = 100;
    } else if (latestGraduationPercentage >= 80) {
        educationScore = 80;
    } else if (latestGraduationPercentage >= 70) {
        educationScore = 60;
    } else if (latestGraduationPercentage >= 60) {
        educationScore = 40;
    } else {
        educationScore = 20;
    }

    // Certificate comparison
    const jobCertificatesSet = new Set(jobData.certificates.map(cert => stemmer.stem(cert.toLowerCase())));
    const resumeCertificates = lowercasedTokenizedSections.certificates.flatMap(section =>
        splitConcatenatedKeywords(section, Array.from(jobCertificatesSet))
    );
    const matchingCertificates = resumeCertificates.filter(cert => jobCertificatesSet.has(stemmer.stem(cert)));
    const certificateScore = tokenizedSections?.certificates?.length >=3 ? 100 : 0;

    console.log("Matching Certificates", matchingCertificates, certificateScore,resumeCertificates);

    // Profile Summary comparison
    const profileSummaryMatch = lowercasedTokenizedSections.profileSummary.length > 0;
    const profileSummaryScore = profileSummaryMatch ? 100 : 0;

    // Section Availability comparison
    const sectionAvailabilityScore = Object.keys(lowercasedTokenizedSections).every(section => lowercasedTokenizedSections[section].length > 0) ? 100 : 0;



    // Line spacing score
    let lineSpacingScore = 100;
    const lineSpacing = calculateLineSpacing(resumeText);
    if (lineSpacing > 1.5) {
        lineSpacingScore = 0;
    }

    // Grammar and typos score
    let grammarAndTyposScore = 100;
    if (grammarCheckEnabled || typoCheckEnabled) {
        grammarAndTyposScore -= 10;
    }

    // Combine all scores
    let combinedScore = (
        skillMatchScore +
        experienceScore +
        projectMatchScore +
        educationScore +
        certificateScore +
        profileSummaryScore +
        sectionAvailabilityScore +
        lineSpacingScore +
        grammarAndTyposScore
    ) / 9;

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} milliseconds`);

    // console.log("Preprocesstext",preprocessText("hello"));
    return {
        matchScore: combinedScore,
        matchingWords: {
            skills: matchingSkills,
            // experience: matchingExperience,
            // projects: matchingProjects,
            certificates: matchingCertificates,
        },
        containsCertificates: matchingCertificates.length > 0,
        educationPercentage: latestGraduationPercentage,
        educationScore
    };
};

const calculateLineSpacing = (resumeText) => {
    const lines = resumeText.split(/\r?\n/);
    const totalSpacing = lines.reduce((acc, line, index) => {
        if (index > 0) {
            const spacing = Math.abs(line.length - lines[index - 1].length);
            acc += spacing;
        }
        return acc;
    }, 0);

    const averageSpacing = totalSpacing / (lines.length - 1);
    return averageSpacing;
};

const countDistinctProjects = (projectsSection) => {
    const linkPattern = /(https?:\/\/[^\s]+)/g; 
    let distinctProjects = 0;

   
    projectsSection.forEach(project => {
      
        const links = project.match(linkPattern) || [];
       
        const hasGitHub = project.toLowerCase().includes('github');

        const hasSourceCode = project.toLowerCase().includes('sourcecode');

        const live = project.toLowerCase().includes('livedemo');
        
        if (links.length > 2 || hasGitHub || hasSourceCode || live ) {
            distinctProjects += 1;
        }
    });

    return distinctProjects;
};

const extractPercentage = (educationToken) => {
    const educationSection = educationToken.join(' ');

    // Function to extract the first number after a specific keyword
    const extractValueAfterKeyword = (section, keyword) => {
        const regex = new RegExp(`${keyword}(\\d+(\\.\\d+)?)`, 'i');
        const match = section.match(regex);
        return match ? parseFloat(match[1]) : NaN;
    };

    // Check for cumulative GPA
    const gpa = extractValueAfterKeyword(educationSection, 'cumulativegpa');
    if (!isNaN(gpa)) {
        return (gpa / 100) * 1000;
    }

    // Check for CGPA
    const cgpa = extractValueAfterKeyword(educationSection, 'cgpa');
    if (!isNaN(cgpa)) {
        return (cgpa / 10) * 100;
    }

    // Check for percentage
    const percentage = extractValueAfterKeyword(educationSection, 'percentage');
    if (!isNaN(percentage)) {
        return percentage;
    }

    // Default return if no valid grade found
    return 0;
};


module.exports = {
    calculateMatchScore
};
