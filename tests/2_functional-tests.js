/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
var testIssueId;

chai.use(chaiHttp);

suite('Functional Tests', () => {

  suite('POST /api/issues/{project} => object with issue data', () => {

    test('Every field filled in', done => {
      chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA',
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by,
                'Functional Test - Every field filled in');
            assert.equal(res.body.assigned_to, 'Chai and Mocha');
            assert.equal(res.body.status_text, 'In QA');
            assert.isBoolean(res.body.open);
            assert.equal(res.body.open, true);

            const created_on = new Date(res.body.created_on);
            const updated_on = new Date(res.body.updated_on);
            assert.notEqual(created_on, 'Invalid Date');
            assert.notEqual(updated_on, 'Invalid Date');
            testIssueId = res.body._id;
            done();
          });
    });

    test('Required fields filled in', done => {
      chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title - 2',
            issue_text: 'text - 2',
            created_by: 'Functional Test - Every Required field filled in',
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title - 2', 'issue_title');
            assert.equal(res.body.issue_text, 'text - 2', 'issue_text');
            assert.equal(res.body.created_by,
                'Functional Test - Every Required field filled in',
                'created_by');
            assert.equal(res.body.assigned_to, '', 'assigned_to');
            assert.equal(res.body.status_text, '', 'status_text');
            assert.isBoolean(res.body.open);
            assert.equal(res.body.open, true, 'open');

            const created_on = new Date(res.body.created_on);
            const updated_on = new Date(res.body.updated_on);
            assert.notEqual(created_on, 'Invalid Date', 'created_on');
            assert.notEqual(updated_on, 'Invalid Date', 'updated_on');

            done();
          });
    });

    test('Missing required fields', done => {
      chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title - 3',
            issue_text: 'text - 3',
          })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'Issue validation failed');
            done();
          });
    });
  });

  suite('PUT /api/issues/{project} => text', () => {

    test('No body', done => {
      chai.request(server)
          .put('/api/issues/test')
          .send()
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no updated field sent');
            done();
          });
    });

    test('One field to update', done => {
      chai.request(server)
          .put('/api/issues/test')
          .send({_id: testIssueId, status_text: 'Finished QA'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by,
                'Functional Test - Every field filled in');
            assert.equal(res.body.assigned_to, 'Chai and Mocha');
            assert.equal(res.body.status_text, 'Finished QA');
            assert.isBoolean(res.body.open);
            assert.equal(res.body.open, true);
            done();
          });
    });

    test('Multiple fields to update', done => {
      chai.request(server)
          .put('/api/issues/test')
          .send({_id: testIssueId, status_text: 'Deployed', open: false})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by,
                'Functional Test - Every field filled in');
            assert.equal(res.body.assigned_to, 'Chai and Mocha');
            assert.equal(res.body.status_text, 'Deployed');
            assert.isBoolean(res.body.open);
            assert.equal(res.body.open, false);
            done();
          });
    });

  });

  suite('GET /api/issues/{project} => Array of objects with issue data',
      () => {

        test('No filter', done => {
          chai.request(server)
              .get('/api/issues/test')
              .query({})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.property(res.body[0], 'issue_title');
                assert.property(res.body[0], 'issue_text');
                assert.property(res.body[0], 'created_on');
                assert.property(res.body[0], 'updated_on');
                assert.property(res.body[0], 'created_by');
                assert.property(res.body[0], 'assigned_to');
                assert.property(res.body[0], 'open');
                assert.property(res.body[0], 'status_text');
                assert.property(res.body[0], '_id');
                done();
              });
        });

        test('One filter', done => {
          chai.request(server)
              .get('/api/issues/test')
              .query({open: false})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);

                // Results are returned sorted by descending created_on date
                // So the issue we closed above should be the first issue in
                // the response array

                assert.equal(res.body[0].issue_title, 'Title');
                assert.equal(res.body[0].issue_text, 'text');
                assert.equal(res.body[0].created_by,
                    'Functional Test - Every field filled in');
                assert.equal(res.body[0].assigned_to, 'Chai and Mocha');
                assert.equal(res.body[0].status_text, 'Deployed');
                assert.isBoolean(res.body[0].open);
                assert.equal(res.body[0].open, false);
                done();
              });
        });

        test(
            'Multiple filters (test for multiple fields you know will be in the db for a return)',
            done => {
              chai.request(server)
                  .get('/api/issues/test')
                  .query({open: true, issue_text: 'text - 2'})
                  .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body[0].issue_text, 'text - 2');
                    assert.isBoolean(res.body[0].open);
                    assert.equal(res.body[0].open, true);
                    done();
                  });
            });

      });

  suite('DELETE /api/issues/{project} => text', () => {

    test('No _id', done => {
      chai.request(server)
          .delete('/api/issues/test')
          .send()
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
    });

    test('Valid _id', done => {
      chai.request(server)
          .delete('/api/issues/test')
          .send({_id: testIssueId})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `deleted ${testIssueId}`);
            done();
          });
    });

    test('Invalid _id', done => {
      chai.request(server)
          .delete('/api/issues/test')
          .send({_id: testIssueId})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `could not delete ${testIssueId}`);
            done();
          });
    });

  });

});
