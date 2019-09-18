const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  noteTitle: {
    type: String,
    required: true
  },
  noteBody: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  changeDate: {
    type: Date,
    required: false
  }
});

module.exports = mongoose.model("Note", noteSchema);
