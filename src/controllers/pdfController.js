// src/controllers/pdfController.js
const PdfData = require('../models/pdfData');
const pdfParse = require('pdf-parse');
const { calculateMatchScore } = require('../services/resumeService');
const { calculateMatchScore1 } = require('../services/resumeService1');
const mongoose = require('mongoose');
const Job = require('../models/Job');

const parseAndSavePdf = async (req, res) => {
    try {
      
        const parsedData = await pdfParse(req.files.pdfData.data);

        const textContent = parsedData.text;

        const newPdfData = new PdfData({ title: req.files.pdfData.name, text: textContent });
        await newPdfData.save();

        const { jobDescription,jobName,grammarCheckEnabled, typoCheckEnabled } = req.body;

        const jobData = await Job.findOne({ name: jobName });
        if (!jobData) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const jobSkills = jobData.skills.split(',').map(skill => skill.trim().toLowerCase());;
        const jobSkillsSet = new Set(jobSkills);

        console.log("Job Skill Set",jobSkillsSet);

        const resumeSkills = parseSkills(textContent);

        console.log("ResumeSkills",resumeSkills);

       // const { default: stemmer } = await import('stemmer');
    
        // const matchingSkills = resumeSkills.filter(skill => jobSkillsSet.has(skill));

        const matchingSkillsSet = new Set();

resumeSkills.forEach(resumeSkill => {
    const words = resumeSkill.split(/\s+/);
 
    words.forEach(word => {
        const lowerCaseWord = word.toLowerCase();
        if (jobSkillsSet.has(lowerCaseWord) && !matchingSkillsSet.has(lowerCaseWord)) {
            matchingSkillsSet.add(lowerCaseWord);
        }
    });
});

const matchingSkills = Array.from(matchingSkillsSet);

        const skillMatchScore = (matchingSkills.length / jobSkills.length) * 100;

        console.log("Matching Skills", matchingSkills, skillMatchScore);

        // const result = await calculateMatchScore(jobDescription, jobData, grammarCheckEnabled, typoCheckEnabled, numResumes);

        // result.matchingSkills = matchingSkills;
        // result.skillMatchScore = skillMatchScore;

        return res.status(200).json({
            success: true,
            data: skillMatchScore,
            matchingWords:matchingSkills,
            pdfdata: newPdfData,
            resumeSkills:Array.from(jobSkillsSet),
            message: "Resume matched successfully"
        });
    } catch (err) {
        console.error('Error matching resume:', err.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }

    //     if(jobDescription?.length > 0){
    //         const isJD = true;
    //         const jobDescription = req.body.jobDescription;

    //         // Calculate match score between the resume and the job description
    //         const matchData = calculateMatchScore1(textContent, jobDescription);
    // console.log("check match score",matchData)

    //         return res.status(201).json({ message: 'PDF parsed and data saved to MongoDB', data: newPdfData, matchData });
    //     }
    //     else {
    //     const jobData ={
    //         "name":"MERN Developer",
    //         "skills": ["HTML", "CSS", "JavaScript"],
    //         "experience": "3 years",
    //         "projects": ["Website Development", "Frontend Development"],
    //         "education": "Bachelor's Degree",
    //         "profileSummary": "A dedicated web developer",
    //         "certificates": ["Certified JavaScript Developer"],
    //         "grammaticalCheck": true,
    //         "sectionAvailability": ["skills", "experience", "projects", "education", "profileSummary", "certificates"]
    //     }

    //     const matchData = await calculateMatchScore(textContent, jobData, grammarCheckEnabled, typoCheckEnabled);

    //     return res.status(201).json({ message: 'PDF parsed and data saved to MongoDB', data: newPdfData, matchData });
    // }
    // } catch (error) {
    //     console.error('Error parsing PDF:', error);
    //     return res.status(500).json({ error: 'Failed to parse PDF' });
    // }
};

const parseSkills = (skillsString) => {
    return skillsString.split(',').map(skill => skill.trim().toLowerCase());
};

module.exports = {
    parseAndSavePdf
};
