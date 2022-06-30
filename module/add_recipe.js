const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const newuserRecipe = mongoose.Schema({
  recipe_profile: {
    type: String,
    required: true,
  },
  recipe_name: {
    type: String,
    required: true,
  },
  recipe_content: {
    type: String,
    required: true,
  },
  prep_time: {
    type: String,
    required: true,
  },
  total_time: {
    type: String,
    required: true,
  },
  kitchengear: {
    type: Array,
    required: true,
  },
  ingredients: {
    type: Array,
    required: true,
  },
  instruction: {
    type: Array,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "recipes-maker",
    required: true,
  },
  visibility: {
    type: Boolean,
    default: false,
    required: true,
  },
});
const UserRecipe = mongoose.model("user_input_recipe", newuserRecipe);
module.exports = UserRecipe;
