"use strict";
const mongoose = require("mongoose"); // Need to require mongoose

// Do everything inside this function so it is imported to server.js properly
module.exports = (app) => {
  let uri = process.env.ISSUE_TRACKER_MONGO_URI;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const Schema = mongoose.Schema;

  // Use the next four lines to see if you are conneted to mongoose correctly
  // var db = mongoose.connection;
  // db.on("error", console.error.bind(console, "connection error:"));
  // db.once("open", () => {
  //   console.log("Connection Successful!");
  // });

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
        created_on: new Date(),
        updated_on: new Date(),
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
      let id = req.body._id;

      // Everytime object updates we should change the updated_on date
      let updatedObject = { updated_on: new Date() };

      // Object.keys grabs every key in an object. We then loop through to see if any do not equal "".
      Object.keys(req.body).forEach((key) => {
        //If an update field was entered we add it to updatedObject to pass into findByIdAndUpdate
        if (req.body[key] !== "") {
          updatedObject[key] = req.body[key];
        }
      });
      if (!id) {
        return res.json({ error: "missing _id" });
      }
      // Because req.bodyincludes id we need to do <= as id and updated_on will always be in updatedObject
      else if (Object.keys(updatedObject).length <= 2) {
        return res.json({ error: "no update field(s) sent", _id: id });
      }
      // If correctly inputted by user update the issue
      else {
        Issue.findByIdAndUpdate(
          id,
          { $set: updatedObject }, // Update the issue.
          { new: true }, // {new, true} returns the updated version and not the original. (Default is false)
          (error, issueToUpdate) => {
            // If issueToUpdate is not found and updated then send error message
            if (!issueToUpdate) {
              return res.json({ error: "could not update", _id: id });
            }
            // If issueToUpdate is updated and there is no error then send successful res.json()
            else if (!error && issueToUpdate) {
              res.json({ result: "successfully updated", _id: id });
            }
          }
        );
      }
    })

    .delete((req, res) => {
      let id = req.body._id;
      if (!id) {
        return res.json({ error: "missing _id" });
      } else {
        Issue.findByIdAndDelete(id, (error, deletedIssue) => {
          // If deltedIssue is not found then send error message
          if (!deletedIssue) {
            return res.json({ error: "could not delete", _id: id });
          }
          // else if deletedIssue is found and there is no error delete the issue and display the correct json object
          else if (!error && deletedIssue) {
            return res.json({ result: "successfully deleted", _id: id });
          }
        });
      }
    });
};
