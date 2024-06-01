const express = require('express');
// const stemmer = require('stemmer');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { getJobs, addJob, matchResume,updateJob,deleteJob } = require('../controllers/jobController');
const { getAllSkills, addSkills} = require('../controllers/skillController');
const router = express.Router();

router.get('/getAllSkills',getAllSkills);
router.post('/createSkill', addSkills);


router.get('/', getJobs);
router.post('/create', addJob);
router.post('/match', matchResume);
router.put('/job/:id',updateJob);
router.delete('/job/:id',deleteJob);


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

        const { default: stemmer } = await import('stemmer');
    
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
