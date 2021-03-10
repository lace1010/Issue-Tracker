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

      // To add a filter for querys to add on all fields, assign an object with query objects
      let filteredObject = Object.assign(req.query);
      // Add project_name so we are filtering through the correct project as well as the querys that are added on url.
      filteredObject["project_name"] = projectName;

      // Find all objects in database with correct project name and addtional querys. Then display them as an array
      Issue.find(filteredObject, (error, docs) => {
        if (error) return console.log(error);
        console.log("calling else");
        res.json([...docs]);
      });
    })

    .post((req, res) => {
      let projectName = req.params.project;

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
        // Don't respond with console.log(error) because fcc test wants this error message in res.json()
        if (error) return res.json({ error: "required field(s) missing" });
        if (!error && savedIssue) {
          // Do not need this. can just log savedIssue to see that it saves to database. Use res.json() to pass tests
          return res.json(savedIssue);
        }
      });
    })

    .put((req, res) => {
      // handle the error test
      let id = req.body._id;

      // Everytime object updates we should change the updated_on date
      let updatedObject = { updated_on: new Date().toUTCString() };

      // Object.keys grabs every key in an object. We then loop through to see if any do not equal "".
      Object.keys(req.body).forEach((key) => {
        //If an update field was entered we add it to updatedObject to pass into findByIdAndUpdate
        if (req.body[key] !== "") {
          updatedObject[key] = req.body[key];
        }
      });

      if (!id) {
        res.json({ error: "missing _id" });
      } else if (
        req.body.issue_title == "" &&
        req.body.issue_text == "" &&
        req.body.created_by == "" &&
        req.body.assigned_to == "" &&
        req.body.status_text == ""
      ) {
        res.json({ error: "no update field sent", _id: id });
      } else {
        Issue.findByIdAndUpdate(
          id,
          { $set: updatedObject }, // Update the issue.
          { new: true }, // {new, true} returns the updated version and not the original. (Default is false)
          (error, issueToUpdate) => {
            if (error) return res.json({ error: "could not update", _id: id });
            console.log(issueToUpdate, "update this issue");
            res.json({ result: "successfully updated", _id: id });
          }
        );
      }
    })

    .delete((req, res) => {
      let projectName = req.params.project;
    });
};

// 604834595a0acd3251168f14
