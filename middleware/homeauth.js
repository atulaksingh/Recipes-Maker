const jwt = require("jsonwebtoken");
const usermodelschema = require("../module/registration");
const UserRecipe = require("../module/add_recipe");
jwtkey = "hgtyshgsgsghgdusgdygdgdydgd6gdygg";

const homeauth = async (req, res, next) => {
  console.log("in homeauth middleware ", req.cookies);
  try {
    if (!req.cookies.jwtToken) {
      console.log("no cookie");
      return res.redirect("/login");
    } else {
      
      const token = req.cookies.jwtToken;
      console.log("this is the" + token);
      const verifyuser = jwt.verify(token, jwtkey);
      console.log(verifyuser);
      const LoginUser = await usermodelschema.findOne(
        { _id: verifyuser.id },
        { password: 0, cpassword: 0 }
      );
      // console.log(LoginUser);
      req.user = LoginUser;
      next();
      // res.render("home_page");
    }
  } catch (err) {
    res.status(401).send(err);
  }
};
function checkNotAuthenticated(req,res,next){
  if(req.cookies.jwtToken){
    return res.redirect("/home_page");
  }
  next();
}
module.exports = {homeauth,checkNotAuthenticated };
