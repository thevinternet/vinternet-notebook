// Setup Express, Mongoose & server port variables
const express = require("express");
const router = express.Router();
const Note = require("../models/note.js");

// **** GET ROUTES **** //

router.get("/", async (req, res) => {
  try {
    // Moongoose object's 'find()' method
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: `SERVER ERROR : ${err.message}` });
  }
});

router.get("/:id", getNote, (req, res) => {
  res.json(res.note);
});

// **** POST ROUTES **** //

router.post("/", async (req, res) => {
  if (!req.body.noteTitle || !req.body.noteBody) {
    res.status(400).json({
      message: "ERROR : Please provide a title and body text for your new note"
    });
  } else {
    const note = new Note({
      noteTitle: req.body.noteTitle,
      noteBody: req.body.noteBody
    });
    try {
      // Moongoose object's 'save()' method
      const newNote = await note.save();
      res.status(201).json({
        message: `SUCCESS : New note '${newNote.noteTitle}' added to database`
      });
    } catch (err) {
      res.status(400).json({ message: `SERVER ERROR : ${err.message}` });
    }
  }
});

// **** UPDATE / PATCH ROUTES **** //

router.patch("/:id", getNote, async (req, res) => {
  if (!req.body.noteTitle || !req.body.noteBody) {
    res.status(400).json({
      message: "ERROR : Your note must contain a title and body text"
    });
  } else {
    res.note.noteTitle = req.body.noteTitle;
    res.note.noteBody = req.body.noteBody;
    res.note.changeDate = new Date();
  }

  try {
    // Moongoose object's 'save()' method
    const updatedNote = await res.note.save();
    res.json({
      message: `SUCCESS : Note '${res.note.noteTitle}' has been successfully updated`
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR : Note has not been updated" });
  }
});

// **** DELETE ROUTES **** //

router.delete("/:id", getNote, async (req, res) => {
  try {
    // Moongoose object's 'remove()' method
    await res.note.remove();
    res.json({
      message: `SUCCESS : Note '${res.note.noteTitle}' deleted from database`
    });
  } catch (err) {
    res.status(500).json({ message: "ERROR : Note cannot be found" });
  }
});

// **** HELPERS **** //

async function getNote(req, res, next) {
  let note;
  try {
    // Moongoose object's 'findById()' method
    note = await Note.findById(req.params.id);
    if (note == null) {
      return res.status(404), json({ message: "ERROR : Note cannot be found" });
    }
  } catch (err) {
    return res.status(500).json({ message: `SERVER ERROR : ${err.message}` });
  }
  res.note = note;
  next();
}

module.exports = router;
