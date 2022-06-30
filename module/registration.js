const mongoose = require('mongoose');
const userRegSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  
  
})
module.exports = mongoose.model('recipes-maker',userRegSchema);