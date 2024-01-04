const mongoose = require("mongoose");

const ExerciseLogSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const LogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  log: {
    type: [ExerciseLogSchema],
    required: true,
    default: [],
  },
});

const LogModel = mongoose.model("log", LogSchema);

module.exports = LogModel;
