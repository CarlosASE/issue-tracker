const mongoose = require('mongoose');

// Connect to Mongo
const connect = (dbURI) => {
  mongoose.connect(dbURI,
      {useNewUrlParser: true, useUnifiedTopology: true});
};

// Schema/Model
const ProjectSchema = mongoose.Schema({
  name: {type: String, required: true},
});

const Project = mongoose.model('Project', ProjectSchema);

const IssueSchema = new mongoose.Schema({
  project: {type: mongoose.Types.ObjectId, ref: 'Project', required: true},
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: {type: Date, required: true},
  created_by: {type: String, required: true},
  updated_on: {type: Date, required: true},
  open: {type: Boolean, default: true, required: true},
  assigned_to: {type: String, default: ''},
  status_text: {type: String, default: ''},
});

const Issue = mongoose.model('Issue', IssueSchema);

// Create
const findOrCreateProject = (name, cb) => {
  const newProject = new Project({name: name});
  Project.find({name: name}, (err, projectData) => {
    if (err) {
      cb(err, null);
    } else if (Array.isArray(projectData) && projectData.length) {
      cb(null, projectData[0]);
    } else {
      newProject.save((err, data) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, data);
        }
      });
    }
  });
};

const createIssue = (issue, cb) => {
  issue.created_on = new Date();
  issue.updated_on = issue.created_on;
  // TODO: Add checking for required fields?
  const newIssue = new Issue(issue);
  newIssue.save((err, data) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

// Read
const getProjectIdByName = (name, cb) => {
  Project.findOne({name: name}, (err, data) => {
    if (err) {
      cb(err, null);
    } else {
      if (data !== null) {
        cb(null, data._id);
      } else {
        cb(null, null)
      }
    }
  });
};

const queryIssuesByProject = (project, queryParams = {}, cb) => {
  getProjectIdByName(project, (err, projectId) => {
    if (err) {
      cb(err, null);
    } else {
      queryParams.project = projectId;
      let query = Issue.find(queryParams)
          .sort({created_on: 'descending'})
          .exec((err, data) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, data);
        }
      });
    }
  });
};

const getIssueById = (issueId, cb) => {
  Issue.findById(issueId, (err, data) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

// Update
const updateIssueById = (issueId, update, cb) => {
  update.updated_on = new Date();
  Issue.findByIdAndUpdate(issueId, update, {new: true, useFindAndModify: false},
      (err, data) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, data);
        }
      });
};

// Delete
const deleteIssueById = (issueId, cb) => {
  Issue.findByIdAndRemove(issueId, {useFindAndModify: false}, (err, data) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

exports.connect = connect;
exports.findOrCreateProject = findOrCreateProject;
exports.createIssue = createIssue;
exports.queryIssuesByProject = queryIssuesByProject;
exports.getIssueById = getIssueById;
exports.updateIssueById = updateIssueById;
exports.deleteIssueById = deleteIssueById;
