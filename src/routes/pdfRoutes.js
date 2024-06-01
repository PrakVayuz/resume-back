// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

router.post('/parse-pdf', pdfController.parseAndSavePdf);

module.exports = router;
