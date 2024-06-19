const express = require('express');
const router = express.Router();
const Skills = require('../models/Skills');

router.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.q; 
    const results = await Skills.find({ skills: { $regex: new RegExp(query, 'i') } }).limit(10);

    res.json(results); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
