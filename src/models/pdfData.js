const mongoose = require('mongoose');

const pdfDataSchema = new mongoose.Schema({
  title: String,
  text: String,
  skills: [String] 
});

// Define text index on the 'skills' field
pdfDataSchema.index({ skills: 'text' });

const PdfData = mongoose.model('PdfData', pdfDataSchema);

module.exports = PdfData;
