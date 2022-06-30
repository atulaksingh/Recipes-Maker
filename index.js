const express = require("express");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");

const ejs = require("ejs");
const jshonwebtoken = require("jsonwebtoken");
const cookies = require("cookie-parser");
const multer = require("multer");

const dbcon = require("./db/dbconnection");
const usermodelschema = require("./module/registration");
const UserRecipe = require("./module/add_recipe");
const { homeauth, checkNotAuthenticated } = require("./middleware/homeauth");
const { dirname } = require("path");
const jsonParser = bodyparser.json();

const port = process.env.PORT || 5000;

const staticpath = path.join(__dirname, "/views");

app.set("etag", false);
app.set("view engine", "ejs");
app.set("view cache", false);

app.use(bodyparser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookies());
app.use(express.static(__dirname + "/public"));

jwtkey = "hgtyshgsgsghgdusgdygdgdydgd6gdygg";

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  console.log(req.originalUrl);
  next();
});

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("registration", { usererror: "" });
});

// *******************middleware start******************************************
const filestorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "./public/public_recipe_IMG");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

//********************middlewre end ****************************************** */
const upload = multer({ storage: filestorage });

app.get("/login", checkNotAuthenticated, (req, res) => {
  // const refresh = req.query.refresh === "true" ? true : false;
  res.render("login", { loginerror: "" });
});

// **********************************login***************************************
app.post("/login", checkNotAuthenticated, async (req, res) => {
  const newuseremail = req.body.userEmail;
  const newuserpassword = req.body.userPassword;
  // res.redirect("http://localhost:5000/home_page");
  try {
    let founduser = await usermodelschema.findOne({ userEmail: newuseremail });
    // console.log(founduser.password);
    console.log(newuserpassword);
    if (newuserpassword == founduser.password) {
      const token = jshonwebtoken.sign({ id: founduser._id }, jwtkey);
      console.log("token part is " + token);
      res.cookie("jwtToken", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 900000),
      });
      res.redirect("http://localhost:5000/home_page");
    } else {
      res.render("login", {
        loginerror: "please enter your valid email or password",
      });
    }
  } catch (err) {
    // console.log(err);
  }
});

app.use(homeauth);

app.get("/home_page", (req, res) => {
  const requestuserid = req.user._id;
  // console.log("req.userrrr ", { requestuserid });
  UserRecipe.find({ userId: requestuserid }, function (err, result) {
    if (err) {
      console.log(err);
      return res.render("home_page", {
        recipelist: [],
        error: "Server Error.",
      });
    }
    // console.log("this is resut" + result);

    res.render("home_page", { recipelist: result || [] });
  });
});

app.get("/recipe/:id", (req, res) => {
  console.log("requestid" + req.params.id);
  let recipeId = req.params.id;
  let userId = req.user._id;

  UserRecipe.findOne({ _id: recipeId, userId }, function (err, reqidresult) {
    if (err) {
      console.log(err);
      res.render("recipe", { user_req_recipelist: [], error: "Server Error." });
    }

    res.render("recipe", { user_req_recipelist: reqidresult || [] });
  });
});
// ******************8********public recipe start*******************************
app.get("/public_recipe/", (req, res) => {
  UserRecipe.find({ visibility: true }, function (err, public_recipe_result) {
    // console.log("public"+public_recipe_result);
    if (err) {
      console.log(err);
      res.render("public_recipe", {
        public_RecipeList: [],
        error: "Server Error.",
      });
    }
    res.render("public_recipe", {
      public_RecipeList: public_recipe_result || [],
    });
  });
 
});
// ******************8********public recipe end *******************************
// *****************************about start**************************
app.get("/about/", (req, res) => {
  res.render("about");
});
// *****************************about end**************************
// *************************registration***************************

app.post("/", jsonParser, async (req, res) => {
  try {
    const password = req.body.userPassword;
    const cpassword = req.body.userCpassword;
    const name = req.body.userName;
    const email = req.body.userEmail;
    console.log(password + " " + cpassword);

    if (password === cpassword) {
      const registerEmp = usermodelschema({
        name: req.body.userName,
        email: req.body.userEmail,
        password: req.body.userCPassword,
      });
      registerEmp.save();
      res.redirect("http://localhost:5000/login");
    } else {
      //console.log("reg error");
      res.render("registration", {
        usererror: "both password should be exactly same",
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// ****************************************userInput***************************************//
app.get("/Add_new_recipe", (req, res) => {
  res.render("Add_new_recipe", { formsubmitted: "" });
});

app.post(
  "/new_user_recipe",
  jsonParser,
  upload.single("image"),
  async (req, res) => {
    try {
      

      const imagefile = req.file && req.file.filename;
      const recipe_content = req.body.user_recipe_content;
      const preptime = req.body.preptime;
      const totaltime = req.body.totaltime;
      const kichengear = req.body.gearItem;
      const ingredients = req.body.iningredientItam;
      const instruction = req.body.instructionItam;
      const userId = req.user._id;
      const visibility = req.body.visibility;
      // console.log(visibility);

      const UserinputRecipe = UserRecipe({
        recipe_profile: "/public_recipe_IMG/" + imagefile,
        recipe_name: req.body.recipe_name,
        recipe_content: req.body.user_recipe_content,
        prep_time: req.body.preptime,
        total_time: req.body.totaltime,
        kitchengear: req.body.gearItem,
        ingredients: req.body.iningredientItam,
        instruction: req.body.instructionItam,
        userId,
        visibility,
      });
      UserinputRecipe.save();
      // res.send("success")

      res.render("Add_new_recipe", { formsubmitted: "succesful" });
    } catch (err) {
      console.log(err);
    }
  }
);
app.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwtToken");

    console.log("logout");

    return res.redirect("/login?refresh=true");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`server as running at port no ${port}`);
});
