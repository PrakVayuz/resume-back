const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { calculateMatchScore } = require('../services/resumeService');

const router = express.Router();


const validateJobInput = (name, skills) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return 'Job name is required and must be a non-empty string.';
    }
    if (!skills || typeof skills !== 'string' || skills.trim() === '') {
        return 'Skills are required and must be a non-empty string.';
    }
    return null;
};


const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({});
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Jobs available"
            });
        }

        return res.status(200).json({
            success: true,
            data: jobs,
            message: "Successfully fetched the jobs"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
}


const addJob = async (req, res) => {
    try {
        const { name, skills } = req.body;

        const validationError = validateJobInput(name, skills);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const existingJob = await Job.findOne({ name });
        if (existingJob) {
            return res.status(409).json({
                success: false,
                message: "Job already exists"
            });
        }

        const job = new Job({ name, skills });
        await job.save();

        return res.status(201).json({
            success: true,
            data: job,
            message: "Job created successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
}


const updateJob =  async (req, res) => {
    try {
        const { id } = req.params;
        const { name, skills } = req.body;

        const validationError = validateJobInput(name, skills);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID"
            });
        }

        const job = await Job.findByIdAndUpdate(id, { name, skills }, { new: true, runValidators: true });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: job,
            message: "Job updated successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
}

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID"
            });
        }

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

const matchResume =  async (req, res) => {
    try {
        const { resumeText, jobId, grammarCheckEnabled, typoCheckEnabled, numResumes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID"
            });
        }

        const jobData = await Job.findById(jobId);
        if (!jobData) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const result = await calculateMatchScore(resumeText, jobData, grammarCheckEnabled, typoCheckEnabled, numResumes);
        return res.status(200).json({
            success: true,
            data: result,
            message: "Resume matched successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

module.exports = {
    addJob,
    updateJob,
    deleteJob,
    getJobs,
    matchResume
};
