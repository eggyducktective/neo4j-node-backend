// movies.js
var Movies = require('../models/movies')
  , _ = require('lodash')
  , writeResponse = require('../helpers/response').writeResponse
  , writeError = require('../helpers/response').writeError
  , loginRequired = require('../middlewares/loginRequired')
  , dbUtils = require('../neo4j/dbUtils');

/**
 * @swagger
 * definition:
 *   Movie:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       title:
 *         type: string
 *       summary:
 *         type: object
 *       released:
 *         type: integer
 *       duration:
 *         type: integer
 *       rated:
 *         type: string
 *       tagline:
 *         type: string
 *       poster_image:
 *         type: string
 *       my_rating:
 *         type: integer
 */

/**
 * @swagger
 * /api/v0/movies:
 *   get:
 *     tags:
 *     - movies
 *     description: Find all movies
 *     summary: Find all movies
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: output
 *         description: Output type - "default" or "d3"
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 */
exports.list = function (req, res, next) {
  var output = req.query.output || 'default';
  Movies.getAll(dbUtils.getSession(req), output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/movies/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Find movie by ID
 *     summary: Find movie by ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: movie id
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
 *         description: A movie
 *         schema:
 *           $ref: '#/definitions/Movie'
 *       404:
 *         description: movie not found
 */
exports.findById = function (req, res, next) {
  var output = req.query.output || 'default';
  Movies.getById(dbUtils.getSession(req), req.params.id, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/movies/acted_in_by/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies acted in by some person
 *     summary: Returns movies acted in by some person
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the actor who acted in the movies
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
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Error message(s)
 */
exports.findMoviesByActor = function (req, res, next) {
  var id = req.params.id;
  var output = req.query.output || 'default';
  if (!id) throw {message: 'Invalid id', status: 400};

  Movies.getByActor(dbUtils.getSession(req), id, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/movies/name/{name}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns a movie by name
 *     summary: Returns a movie by name
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Movie name
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
 *         description: A movie
 *         schema:
 *           $ref: '#/definitions/movie'
 *       400:
 *         description: Error message(s)
 *       404:
 *         description: Person not found
 */
exports.findByName = function (req, res, next) {
  var name = req.params.name;
  var output = req.query.output || 'default';
  if (!name) throw {message: 'Invalid name', status: 400};

  Movies.getByName(dbUtils.getSession(req), name, output)
    .then(response => writeResponse(res, response))
    .catch(next);
};
