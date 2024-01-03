const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  exercises: {
    type: [String],
    required: true,
    default: [],
  },
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
