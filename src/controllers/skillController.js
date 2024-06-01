const express = require('express');
const mongoose = require('mongoose');
const Skills = require('../models/Skills');



const validateSkillInput = (skills) => {
    if (!skills || typeof skills !== 'string' || skills.trim() === '') {
        return 'Skills are required and must be a non-empty string.';
    }
    return null;
};


const getAllSkills = async (req, res) => {
    try {
        const skills = await Skills.find({});
        if (!skills || skills.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Skills available"
            });
        }

        return res.status(200).json({
            success: true,
            data: jobs,
            message: "Successfully fetched the Skills"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
}

const addSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        const validationError = validateSkillInput(skills);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const existingJob = await Skills.findOne({ skills });
        if (existingJob) {
            return res.status(409).json({
                success: false,
                message: "Skill already exists"
            });
        }

        const skill = new Skills({ skills });
        await skill.save();

        return res.status(201).json({
            success: true,
            data: skill,
            message: "Skill created successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
}


module.exports = {
    getAllSkills,
    addSkills
}