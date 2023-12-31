const PORT = 8000;

require("dotenv").config();
const OpenAI = require("openai");
const express = require("express");

const cors = require("cors");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const app = express();
app.use(cors());
app.use(express.json());

const fs = require('fs');
const multer = require('multer');

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Testing whether the API works"
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    console.log('file', file);
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file');
let filePath;

app.post("/images", async(req, res) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: req.body.message,
    });
    console.log(response.data);
    res.send(response.data);
  } catch(error) {
    console.log(error);
  }
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if(err) {
      return res.status(500).json(err);
    }
  });
  filePath = req.file.path;
});

app.post("/variations", async (req, res) => {
  try {
    const response = await openai.images.createVariation({
      image: fs.createReadStream(filePath),
      size: "256x256",
    });
    console.log(response.data);
    res.send(response.data);
  } catch(error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log("Your server is running on PORT " + PORT));

