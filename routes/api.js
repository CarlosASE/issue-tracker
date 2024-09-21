/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const findOrCreateProject = require('../dbFunctions').findOrCreateProject;
const createIssue = require('../dbFunctions').createIssue;
const queryIssuesByProject = require('../dbFunctions').queryIssuesByProject;
const getIssueById = require('../dbFunctions').getIssueById;
const updateIssueById = require('../dbFunctions').updateIssueById;
const deleteIssueById = require('../dbFunctions').deleteIssueById;

const defaultIssue = {
  _id: '0',
  issue_title: 'No Issues in Project',
  issue_text: 'This is the default issue returned, if there is a database error',
  created_on: '1970-01-01T00:00:00.000Z',
  updated_on: '1970-01-01T00:00:00.000Z',
  created_by: 'System',
  assigned_to: 'System',
  open: true,
  status_text: 'Bug/Error',
};

const createResult = (data) => {
  return {
    _id: data._id,
    issue_title: data.issue_title,
    issue_text: data.issue_text,
    created_on: data.created_on.toISOString(),
    updated_on: data.updated_on.toISOString(),
    created_by: data.created_by,
    assigned_to: data.assigned_to,
    open: data.open,
    status_text: data.status_text,
  };
};

module.exports = app => {

  app.route('/api/issues/:project')

      .get((req, res) => {
        const project = req.params.project.toLowerCase();
        const queryParams = req.query;
        // Change the query parameters to the correct types
        // Do some basic validation
        if (queryParams.hasOwnProperty('open')) {
          switch (queryParams.open.toLowerCase()) {
            case 'true':
              // noinspection JSValidateTypes
              queryParams.open = true;
              break;
            case 'false':
              // noinspection JSValidateTypes
              queryParams.open = false;
              break;
            default:
              delete queryParams.open;
          }
        }
        if (queryParams.hasOwnProperty('created_on')) {
          // noinspection JSCheckFunctionSignatures
          queryParams.created_on = new Date(queryParams.created_on);
          if (queryParams.created_on.toString === 'Invalid Date') {
            delete queryParams.created_on;
          }
        }
        if (queryParams.hasOwnProperty('updated_on')) {
          // noinspection JSCheckFunctionSignatures
          queryParams.updated_on = new Date(queryParams.updated_on);
          if (queryParams.updated_on.toString === 'Invalid Date') {
            delete queryParams.updated_on;
          }
        }
        queryIssuesByProject(project, queryParams, (err, data) => {
          if (err) {
            res.json([defaultIssue]);
          } else {
            res.json(data.map(d => createResult(d)));
          }
        });
      })

      .post((req, res) => {
        const project = req.params.project.toLowerCase();
        const issue = req.body;
        findOrCreateProject(project, (err, data) => {
          if (err) {
            //console.error(err);
            res.status(400).send(err._message)
          } else {
            issue.project = data._id;
            createIssue(issue, (err, data) => {
              if (err) {
                //console.error(err);
                res.status(400).send(err._message)
              } else {
                res.json(createResult(data));
              }
            });
          }
        });
      })

      .put((req, res) => {
        const issue = req.body;
        const issueId = issue._id;
        delete issue._id;

        if (Object.keys(issue).length !== 0) {
          Object.keys(issue).forEach(key => {
            if (issue[key] === '') {
              delete issue[key];
            }
          });
        }
        if (Object.keys(issue).length !== 0 && issueId) {
          updateIssueById(issueId, issue, (err, data) => {
            if (err) {
              console.log(err);
              res.json({error: err});
            } else {
              res.json(createResult(data));
            }
          });
        } else {
          res.send("no updated field sent")
        }
      })

      .delete((req, res) => {
        const issueId = req.body._id;
        if (issueId) {
          deleteIssueById(issueId, (err, data) => {
            if (err) {
              console.error(err)
              res.json({error: err});
            } else if (data) {
              res.send(`deleted ${issueId}`);
            } else {
              res.send(`could not delete ${issueId}`);
            }
          });
        } else {
          res.send('_id error');
        }
      });
};
