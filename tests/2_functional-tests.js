const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

/* START HERE. WE NEED TO ADD AN ID TO THE TEST ISSUES TO BE ABLE TO USE THEM IN THE PUT AND DELETE TESTS */
let id1 = "";
suite("Functional Tests", () => {
  suite("Routing Tests", () => {
    suite("POST /api/issues/{project} => object with issue data", () => {
      test("Issue with every field", (done) => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send({
            issue_title: "Title",
            issue_text: "text",
            created_by: "Me",
            assigned_to: "FCC",
            status_text: "In QA",
            _id: "",
          })

          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Title");
            assert.equal(res.body.issue_text, "text");
            assert.equal(res.body.created_by, "Me");
            assert.equal(res.body.assigned_to, "FCC");
            assert.equal(res.body.status_text, "In QA");

            // Set id1 variable to use this later in PUT tests
            id1 = res.body._id;
            done();
          });
      });

      test("Issue with only required fields", (done) => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send({
            issue_title: "Title",
            issue_text: "text",
            created_by: "Me",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Title");
            assert.equal(res.body.issue_text, "text");
            assert.equal(res.body.created_by, "Me");
            done();
          });
      });

      test("Issue with missing required fields", (done) => {
        chai
          .request(server)
          .post("/api/issues/test")
          .send({ issue_title: "Title", issue_text: "text" })
          .end((err, res) => {
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      });
    });

    suite("GET /api/issues/{project} => object with issue data", () => {
      test("issues with no filter", (done) => {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            // Check if res.body is an array and if each property that should exist is in the first element
            assert.isArray(res.body);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "project_name");
            done();
          });
      });

      test("View issues on a project with one filter", (done) => {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Me" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            // Loop through each issue in array after it has been filtered and check the key:value is same as in the query
            res.body.forEach((issueInFilter) => {
              assert.equal(issueInFilter.created_by, "Me");
            });
            done();
          });
      });

      test("View issues on a project with multiple filters", (done) => {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Me", issue_title: "Title" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            // Loop through each issue in array after it has been filtered and check the key:value is same as in the query
            res.body.forEach((issueInFilter) => {
              assert.equal(issueInFilter.created_by, "Me");
              assert.equal(issueInFilter.issue_title, "Title");
            });
            done();
          });
      });
    });

    suite("PUT /api/issues/{project} => object with issue data", () => {
      test("Update one field on an issue", (done) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: id1, issue_text: "bish" }) // Must send id we set in first test that issue goes to all of these tests
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            done();
          });
      });
      test("Update multiple fields on an issue", (done) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: id1, issue_text: "bish", created_by: "Hunter" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            done();
          });
      });
      test("Update an issue with missing _id", (done) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ issue_text: "bish" })
          .end((err, res) => {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
      test("Update an issue with no fields to update", (done) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: id1 })
          .end((err, res) => {
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, id1);
            done();
          });
      });
      test("Update an issue with an invalid _id", (done) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: "invalidId", issue_text: "sample" })
          .end((err, res) => {
            assert.equal(res.body.error, "could not update");
            assert.equal(res.body._id, "invalidId");
            done();
          });
      });
    });

    suite("DELETE /api/issues/{project} => object with issue data", () => {
      test("Delete an issue", (done) => {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: id1 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, id1);
            done();
          });
      });
      test("Delete an issue with an invalid _id", (done) => {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: "invalidId" })
          .end((err, res) => {
            assert.equal(res.body.error, "could not delete");
            assert.equal(res.body._id, "invalidId");
            done();
          });
      });
      test("Delete an issue with missing _id", (done) => {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({})
          .end((err, res) => {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});
