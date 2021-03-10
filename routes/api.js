"use strict";
const mongoose = require("mongoose"); // Need to require mongoose

// Do everything inside this function so it is imported to server.js properly
module.exports = (app) => {
  let uri = process.env.ISSUE_TRACKER_MONGO_URI;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const Schema = mongoose.Schema;

  // Use the next four lines to see if you are conneted to mongoose correctly
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connection Successful!");
  });

  // Set a issueSchema
  const issueSchema = new Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    open: { type: Boolean, required: true },
    project_name: String,
  });

  // Set a model for issue using issueSchema
  const Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")

    .get((req, res) => {
      let projectName = req.params.project;
    })

    .post((req, res) => {
      let projectName = req.params.project;
      let projectBody = req.body;
      console.log(projectBody);
      // Create new issue model to be stored in database
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        open: true,
        project_name: projectName,
      });

      // Save new issue to database
      newIssue.save((error, savedIssue) => {
        if (error) return console.log(error);
        if (!error && savedIssue) {
          console.log(savedIssue);
        }
      });
    })

    .put((req, res) => {
      let projectName = req.params.project;
    })

    .delete((req, res) => {
      let projectName = req.params.project;
    });
};
