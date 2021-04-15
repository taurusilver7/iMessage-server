// imports
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import dotenv from "dotenv";
import cors from "cors";

import Chat from "./chatModel.js";

// app config
dotenv.config({ path: "./config.env" });
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(cors());
app.use(express.json());

// Database config
const mongoURL = process.env.DB_APPLICATION_URL;
const optionConfig = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(mongoURL, optionConfig);

mongoose.connection.once("open", () => {
  console.log("Database is connected");
});

//api routes
app.get("/", (req, res) => res.status(200).send("Hello Viewers"));

app.post("/new/conversation", (req, res) => {
  const dbBody = req.body;

  Chat.create(dbBody, (err, data) => {
    if (err) res.status(500).send(err);
    res.status(201).send(data);
  });
});

app.post("/new/message", (req, res) => {
  Chat.updateOne(
    { _id: req.query.id },
    { $push: { conversation: req.body } },
    (err, data) => {
      if (err) {
        console.log("Error Saving the message");
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(201).send(data);
      }
    }
  );
});

app.get("/get/conversationList", (req, res) => {
  Chat.find((err, data) => {
    if (err) res.status(500).send(err);
    data.sort((b, a) => a.timestamp - b.timestamp);

    let conversations = [];
    data.map((convData) => {
      const convInfo = {
        id: convData._id,
        name: convData.chatName,
        timestamp: convData.conversation[0].timestamp,
      };
      conversations.push(convInfo);
    });
    res.status(200).send(conversations);
  });
});

app.get("/get/conversation", (req, res) => {
  const id = req.query.id;
  Chat.find({ _id: id }, (err, data) => {
    if (err) res.status(500).send(err);
    res.status(200).send(data);
  });
});

app.get("/get/lastMessage", (req, res) => {
  const id = req.query.id;
  Chat.find({ _id: id }, (err, data) => {
    if (err) res.status(500).send(err);

    let convData = data[0].conversation;
    convData.sort((b, a) => a.timestamp - b.timestamp);

    res.status(200).send(convData[0]);
  });
});

// listeners
app.listen(port, () => console.log(`listening on localhost:${port}`));
