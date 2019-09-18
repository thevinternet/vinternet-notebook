// Setup Express, Mongoose & server port variables
const express = require("express");
const mongoose = require("mongoose");
const notesRouter = require("./routes/notes.js");
const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/notes";

app.use(express.static("public"));

// MongoDB setup and config
mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("connected to database"));

// Allow parsing of JSON objects
app.use(express.json());

app.use("/notes", notesRouter);

// Setup server listening port
app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
