const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { calculateMatchScore } = require('../services/resumeService');
const stemmer = require('stemmer'); // Assuming you have a stemmer library

const router = express.Router();

const parseSkills = (skillsString) => {
    return skillsString.split(',').map(skill => skill.trim().toLowerCase());
};

router.post('/match-resume', async (req, res) => {
    try {
        const { resumeText, jobName, grammarCheckEnabled, typoCheckEnabled, numResumes } = req.body;

        const jobData = await Job.findOne({ name: jobName });
        if (!jobData) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const jobSkills = jobData.skills.map(skill => skill.toLowerCase());
        const jobSkillsSet = new Set(jobSkills);

        const resumeSkills = parseSkills(resumeText);

    
        const matchingSkills = resumeSkills.filter(skill => jobSkillsSet.has(stemmer(skill)));
        const skillMatchScore = (matchingSkills.length / jobSkills.length) * 100;

        console.log("Matching Skills", matchingSkills, skillMatchScore);

        const result = await calculateMatchScore(resumeText, jobData, grammarCheckEnabled, typoCheckEnabled, numResumes);

        result.matchingSkills = matchingSkills;
        result.skillMatchScore = skillMatchScore;

        return res.status(200).json({
            success: true,
            data: result,
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
});

module.exports = router;
