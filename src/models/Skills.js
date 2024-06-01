const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
   skills:{
    type:String,
    required: true
   }
})

module.exports = mongoose.model("Skills",skillSchema);