const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const UserModel = require("./schemas/user");
const ExerciseModel = require("./schemas/exercise");
const LogModel = require("./schemas/log");

const connectDB = require("./connection");
require("dotenv").config();

connectDB();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

/*====================================================================
                            USERS
====================================================================*/
app.get("/api/users", async (request, response) => {
  const data = await UserModel.find();
  response.json(data);
});

app.post("/api/users", async (request, response) => {
  const username = request.body.username;

  const newUser = new UserModel({ username });

  const data = await newUser.save();

  const newLog = new LogModel({ username });
  await newLog.save();

  response.json({ username, _id: data._id });
});

/*====================================================================
                            EXERCISES
====================================================================*/
app.post("/api/users/:_id/exercises", async (request, response) => {
  const _id = request.params._id;
  const { description, duration, date } = request.body;

  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  let processedDate;
  if (dateFormatRegex.test(date)) {
    const [year, month, day] = date.split("-");
    processedDate = new Date(year, month - 1, day);
  } else {
    processedDate = new Date();
  }

  const result = await UserModel.findOne({ _id });

  const log = await LogModel.findOneAndUpdate(
    { username: result.username },
    {
      $inc: {
        count: 1,
      },
      $push: {
        log: {
          description: description,
          duration: parseInt(duration),
          date: processedDate,
        },
      },
    },
    { new: true },
  );

  const newExercise = new ExerciseModel({
    username: result.username,
    description,
    duration,
    date: processedDate,
  });

  const data = await newExercise.save();

  response.json({
    _id: result._id,
    username: result.username,
    description,
    duration: parseInt(duration),
    date: processedDate.toDateString(),
  });
});

/*====================================================================
                            LOGS
====================================================================*/
// app.get("/api/users/:_id/logs", async (request, response) => {
//   const _id = request.params._id;

//   const { from, to, limit } = request.query;

//   const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

//   let fromDate = null;
//   if (from && dateFormatRegex.test(from)) {
//     const [year, month, day] = from.split("-");
//     fromDate = new Date(year, month - 1, day);
//   }

//   let toDate = null;
//   if (to && dateFormatRegex.test(to)) {
//     const [year, month, day] = to.split("-");
//     toDate = new Date(year, month - 1, day);
//   }

//   const data = await UserModel.findOne({ _id });

//   const exercises = data.exercises;

//   let filteredExercises;

//   if (exercises) {
//     filteredExercises = [...exercises];
//   } else {
//     filteredExercises = [];
//   }

//   if (fromDate) {
//     filteredExercises = filteredExercises.filter((e) => e.date >= fromDate);
//   }

//   if (toDate) {
//     filteredExercises = filteredExercises.filter((e) => e.date <= toDate);
//   }

//   if (limit) {
//     filteredExercises = filteredExercises.slice(0, Number(limit));
//   }

//   response.json({ username: data.username, count: filteredExercises.length });
// });

app.get("/api/users/:_id/logs", async (request, response) => {
  const _id = request.params._id;
  const { from, to, limit } = request.query;

  const user = await UserModel.findOne({ _id });
  const log = await LogModel.findOne({ username: user.username });

  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  let fromDate = null;
  if (from && dateFormatRegex.test(from)) {
    const [year, month, day] = from.split("-");
    fromDate = new Date(year, month - 1, day);
  }

  let toDate = null;
  if (to && dateFormatRegex.test(to)) {
    const [year, month, day] = to.split("-");
    toDate = new Date(year, month - 1, day);
  }

  const exercises = log.log;
  let filteredExercises;

  if (exercises) {
    filteredExercises = [...exercises];
  } else {
    filteredExercises = [];
  }

  if (fromDate) {
    filteredExercises = filteredExercises.filter((e) => e.date >= fromDate);
  }

  if (toDate) {
    filteredExercises = filteredExercises.filter((e) => e.date <= toDate);
  }

  if (limit) {
    filteredExercises = filteredExercises.slice(0, Number(limit));
  }

  response.json({
    username: user.username,
    count: parseInt(log.count),
    log: filteredExercises.map((l) => {
      return {
        description: l.description,
        duration: parseInt(l.duration),
        date: l.date.toDateString(),
      };
    }),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
