const express = require('express');
const connectDB = require('../config/db');
const jobRoutes = require('./routes/jobRoutes');
const pdfRoutes = require("./routes/pdfRoutes");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const skillRoutes = require("./routes/skillRoutes");

const app = express();

// const PdfData = require('./models/pdfData'); 

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.use("/api", pdfRoutes);
app.use(express.json());


connectDB();

app.use('/api/v1', jobRoutes);
app.use('/api', skillRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
