const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/recipe",{

}).then(()=>{
  console.log("connection succesfull");
}).catch((err)=>{
console.log("no connection")
})