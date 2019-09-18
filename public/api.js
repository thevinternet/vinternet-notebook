"use strict";

// Note taking application allowing user to view, create, edit and delete messages

(() => {
  // **** Grab DOM elements **** //

  const viewNoteForm = document.getElementById("viewNoteForm");
  const getAllBtn = document.getElementById("btnGetAll");
  const notesContainer = document.getElementById("noteList");
  const addNoteForm = document.getElementById("addNoteForm");
  const modal = document.querySelector(".modal");
  const modalText = document.getElementById("modalText");
  const closeButton = document.getElementById("modalClose");

  // **** Setup event listeners

  viewNoteForm.addEventListener("submit", getRequestSingle);
  getAllBtn.addEventListener("click", getRequestAll);
  addNoteForm.addEventListener("submit", postRequest);
  closeButton.addEventListener("click", toggleModal);
  window.addEventListener("click", windowOnClick);

  // **** GET single note from database **** //

  function getRequestSingle(event) {
    event.preventDefault();
    const noteId = event.target.noteId.value;
    notesContainer.innerHTML = "";

    fetch(`/notes/${noteId}`)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (!noteId || data.message) {
          const statusHolder = document.createElement("div");
          const statusMessage = document.createElement("p");
          statusHolder.setAttribute(
            "class",
            "status--highlight theme--warning"
          );
          statusMessage.innerText = "The requested note cannot be found";
          statusHolder.appendChild(statusMessage);
          notesContainer.appendChild(statusHolder);
        } else {
          const dataArray = [];
          dataArray.push(data);
          const notesHolder = createNoteList(dataArray);
          notesContainer.appendChild(notesHolder);
        }
        event.target.noteId.value = "";
        //console.log(JSON.stringify(data));
      });
  }

  // **** GET all notes from database **** //

  function getRequestAll(event) {
    notesContainer.innerHTML = "";
    fetch(`/notes/`)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (!data.length || data.message) {
          const statusHolder = document.createElement("div");
          const statusMessage = document.createElement("p");
          statusHolder.setAttribute(
            "class",
            "status--highlight theme--warning"
          );
          statusMessage.innerText = "No notes found in database";
          statusHolder.appendChild(statusMessage);
          notesContainer.appendChild(statusHolder);
        } else {
          const dataArray = Array.from(data);
          const notesHolder = createNoteList(dataArray);
          notesContainer.appendChild(notesHolder);
        }
        //console.log(JSON.stringify(data));
      });
  }

  // **** POST new note to database **** //

  function postRequest(event, post) {
    event.preventDefault();
    const noteTitle = event.target.noteTitle.value;
    const noteBody = event.target.noteBody.value;
    post = {
      noteTitle: noteTitle,
      noteBody: noteBody
    };
    const options = {
      method: "POST",
      body: JSON.stringify(post),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    };
    return fetch("/notes", options)
      .then(res => res.json())
      .then(function(data) {
        modalText.innerText = data.message;
        toggleModal();
        event.target.noteTitle.value = "";
        event.target.noteBody.value = "";
        //console.log("Notification: ", data);
      })
      .then(getRequestAll());
  }

  // **** UPDATE existing note on database **** //

  function saveRequest(event, post) {
    const noteId = event.target.attributes.getNamedItem("data-save").value;
    const noteContent = document.getElementById(noteId);
    const noteTitleElement = noteContent.querySelector("[data-title]");
    const noteTextElement = noteContent.querySelector("[data-bodytext]");
    const noteTitle = noteTitleElement.innerText;
    const noteBody = noteTextElement.innerText;
    post = {
      noteTitle: noteTitle,
      noteBody: noteBody
    };
    const options = {
      method: "PATCH",
      body: JSON.stringify(post),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    };
    const URL = `/notes/${noteId}`;

    return fetch(URL, options)
      .then(res => res.json())
      .then(function(data) {
        noteTitleElement.removeAttribute("contenteditable");
        noteTitleElement.className = "";
        noteTextElement.removeAttribute("contenteditable");
        noteTextElement.className = "";
        modalText.innerText = data.message;
        toggleModal();
        //console.log("Notification: ", data);
      })
      .then(getRequestAll());
  }

  // **** DELETE note from database **** //

  function deleteRequest(event) {
    const noteId = event.target.attributes.getNamedItem("data-remove").value;
    const options = {
      method: "DELETE",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        noteId: noteId
      })
    };
    const URL = `/notes/${noteId}`;

    fetch(URL, options)
      .then(res => res.json())
      .then(function(data) {
        modalText.innerText = data.message;
        toggleModal();
        //console.log("Notification: ", data);
      })
      .then(getRequestAll());
  }

  // **** HELPERS **** //

  // Create Note Items
  function createNoteList(data) {
    if (data.length) {
      const notes = document.createElement("div");
      for (let i = 0; i < data.length; i++) {
        const noteHolder = document.createElement("div");
        const noteHeader = document.createElement("div");
        const noteTitle = document.createElement("h3");
        const noteTitleSpan = document.createElement("span");
        const noteIdentifier = document.createElement("span");
        const noteText = document.createElement("p");
        const noteTextSpan = document.createElement("span");
        const noteDate = document.createElement("p");
        const noteEdit = document.createElement("button");
        const noteSave = document.createElement("button");
        const noteRemove = document.createElement("button");

        noteHolder.setAttribute("class", "note");
        noteHolder.setAttribute("id", `${data[i]._id}`);
        noteHeader.setAttribute("class", "note-header");
        noteTitleSpan.setAttribute("data-title", `${data[i]._id}`);
        noteTitleSpan.innerText = `${data[i].noteTitle}`;
        noteIdentifier.className = "note-id";
        noteIdentifier.innerText = `Id: ${data[i]._id}`;
        noteTextSpan.setAttribute("data-bodytext", `${data[i]._id}`);
        noteTextSpan.innerText = `${data[i].noteBody}`;

        data[i].changeDate != null
          ? (noteDate.innerText = `Last Updated: ${new Date(
              data[i].changeDate
            )}`)
          : (noteDate.innerText = `Created: ${new Date(data[i].creationDate)}`);

        noteEdit.setAttribute("data-edit", `${data[i]._id}`);
        noteEdit.setAttribute("class", "btn--primary-inverse");
        noteEdit.addEventListener("click", editRequest);
        noteEdit.innerText = "Edit";

        noteSave.setAttribute("data-save", `${data[i]._id}`);
        noteSave.setAttribute("class", "btn--primary");
        noteSave.addEventListener("click", saveRequest);
        noteSave.innerText = "Save";

        noteRemove.setAttribute("data-remove", `${data[i]._id}`);
        noteRemove.setAttribute("class", "btn--warning");
        noteRemove.addEventListener("click", deleteRequest);
        noteRemove.innerText = "Delete";

        noteTitle.appendChild(noteTitleSpan);
        noteHeader.appendChild(noteTitle);
        noteHeader.appendChild(noteIdentifier);
        noteHolder.appendChild(noteHeader);
        noteText.appendChild(noteTextSpan);
        noteHolder.appendChild(noteText);
        noteHolder.appendChild(noteDate);
        noteHolder.appendChild(noteEdit);
        noteHolder.appendChild(noteSave);
        noteHolder.appendChild(noteRemove);
        notes.appendChild(noteHolder);
      }
      return notes;
    }
  }

  //Prepare Editable Note Content Areas
  function editRequest(event) {
    const noteId = event.target.attributes.getNamedItem("data-edit").value;
    const noteContent = document.getElementById(noteId);
    const noteTitle = noteContent.querySelector("[data-title]");
    const noteText = noteContent.querySelector("[data-bodytext]");
    noteTitle.setAttribute("contenteditable", "true");
    noteTitle.className = "status--editable";
    noteText.setAttribute("contenteditable", "true");
    noteText.className = "status--editable";
  }

  // Modal Dialog Box
  function toggleModal() {
    modal.classList.toggle("show-modal");
  }

  function windowOnClick(event) {
    if (event.target === modal) {
      toggleModal();
    }
  }
})();
