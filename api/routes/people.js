var People = require('../models/people')
  , _ = require('lodash')
  , writeResponse = require('../helpers/response').writeResponse
  , dbUtils = require('../neo4j/dbUtils');

/**
 * @swagger
 * definition:
 *   Person:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       born:
 *         type: integer
 *       poster_image:
 *         type: string
 */

/**
 * @swagger
 * /api/v0/people:
 *   get:
 *     tags:
 *     - people
 *     description: Returns all people
 *     summary: Returns all people
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of people
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Person'
 */
exports.list = function (req, res, next) {
  var output = req.query.output || 'default';
  People.getAll(dbUtils.getSession(req), output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/people/bacon:
 *   get:
 *     tags:
 *     - people
 *     description: Returns all Bacon paths from person 1 to person 2
 *     summary: Returns all Bacon paths from person 1 to person 2
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name1
 *         description: Name of the origin person
 *         in: query
 *         required: true
 *         type: string
 *       - name: name2
 *         description: Name of the target person
 *         in: query
 *         required: true
 *         type: string
 *       - name: output
 *         description: Output type - "default" or "d3"
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A list of people
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Person'
 */
exports.getBaconPeople = function (req, res, next) {
  var name1 = req.query.name1;
  var name2 = req.query.name2;
  var output = req.query.output || 'default';

  People.getBaconPeople(dbUtils.getSession(req), req.query.name1, req.query.name2, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/people/{id}:
 *   get:
 *     tags:
 *     - people
 *     description: Returns a person by id
 *     summary: Returns a person by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Person id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: output
 *         description: Output type - "default" or "d3"
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A person
 *         schema:
 *           $ref: '#/definitions/Person'
 *       400:
 *         description: Error message(s)
 *       404:
 *         description: Person not found
 */
exports.findById = function (req, res, next) {
  var id = req.params.id;
  var output = req.query.output || 'default';
  if (!id) throw {message: 'Invalid id', status: 400};

  People.getById(dbUtils.getSession(req), id, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};


/**
 * @swagger
 * /api/v0/people/name/{name}:
 *   get:
 *     tags:
 *     - people
 *     description: Returns a person by name
 *     summary: Returns a person by name
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Person name
 *         in: path
 *         required: true
 *         type: string
 *       - name: output
 *         description: Output type - "default" or "d3"
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A person
 *         schema:
 *           $ref: '#/definitions/Person'
 *       400:
 *         description: Error message(s)
 *       404:
 *         description: Person not found
 */
exports.findByName = function (req, res, next) {
  var name = req.params.name;
  var output = req.query.output || 'default';
  if (!name) throw {message: 'Invalid name', status: 400};

  People.getByName(dbUtils.getSession(req), name, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/people/search/{name}:
 *   get:
 *     tags:
 *     - people
 *     description: Returns an array of people based on keyword
 *     summary: Returns an array of people based on keyword
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Part of a name
 *         in: path
 *         required: true
 *         type: string
 *       - name: output
 *         description: Output type - "default" or "d3"
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: An array of persons
 *         schema:
 *           $ref: '#/definitions/Person'
 *       400:
 *         description: Error message(s)
 *       404:
 *         description: Person not found
 */
exports.search = function (req, res, next) {
  var name = req.params.name;
  var output = req.query.output || 'default';
  if (!name) throw {message: 'Invalid name', status: 400};

  People.search(dbUtils.getSession(req), name, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};


/**
 * @swagger
 * /api/v0/people/acting_in_by/{id}:
 *   get:
 *     tags:
 *     - people
 *     description: Returns people acting in the same movie
 *     summary: Returns people acting in the same movie
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the movie
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of actors
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/People'
 *       400:
 *         description: Error message(s)
 */
exports.findActorsByMovie = function (req, res, next) {
  var id = req.params.id;
  var output = req.query.output || 'default';
  if (!id) throw {message: 'Invalid id', status: 400};

  People.getByMovie(dbUtils.getSession(req), id, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};
