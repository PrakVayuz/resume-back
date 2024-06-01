const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    skills: {
        type: String,
        required:true
    }
});

module.exports = mongoose.model('Job', JobSchema);
