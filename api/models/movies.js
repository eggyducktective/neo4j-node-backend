var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');
var Movie = require('../models/neo4j/movie');
var Person = require('../models/neo4j/person');

var _singleMovieWithDetails = function (record) {
  if (record.length) {
    var result = {};
    _.extend(result, new Movie(record.get('movie')));

    result.actors = _.map(record.get('actors'), record => {
      if (record.id >= 0) {
        record.id = record.id;
      }
      return record;
    });
    result.related = _.map(record.get('related'), record => {
      return new Movie(record);
    });
    result.keywords = record.get('keywords');
    return result;
  } else {
    return null;
  }
};

/**
 *  Query Functions
 */


function manyMovies(neo4jResult) {
  return neo4jResult.records.map(r => new Movie(r.get('movie')))
}

// get all movies
var getAll = function (session, output) {
  return session
    .run('MATCH (movie:Movie) RETURN movie')
    .then(r => manyMovies(r));
};

// get a single movie by id
var getById = function (session, movieId, output) {
  var query = [
    'MATCH (movie:Movie {id: {movieId}})',
    'OPTIONAL MATCH (movie)<-[r:ACTS_IN]-(a:Person)',
    'OPTIONAL MATCH (related:Movie)<--(a:Person) WHERE related <> movie',
    'OPTIONAL MATCH (movie)-[:HAS_KEYWORD]->(keyword:Keyword)',
    'OPTIONAL MATCH (movie)-[:HAS_GENRE]->(genre:Genre)',
    'OPTIONAL MATCH (movie)<-[:DIRECTED]-(d:Person)',
    'OPTIONAL MATCH (movie)<-[:PRODUCED]-(p:Person)',
    'OPTIONAL MATCH (movie)<-[:WRITER_OF]-(w:Person)',
    'WITH DISTINCT movie,',
    'genre, keyword, d, p, w, a, r, related, count(related) AS countRelated',
    'ORDER BY countRelated DESC',
    'RETURN DISTINCT movie,',
    'collect(DISTINCT keyword) AS keywords, ',
    'collect(DISTINCT d) AS directors,',
    'collect(DISTINCT p) AS producers,',
    'collect(DISTINCT w) AS writers,',
    'collect(DISTINCT{ name:a.name, id:a.id, profileImageUrl:a.profileImageUrl, role:r.name}) AS actors,',
    'collect(DISTINCT related) AS related,',
    'collect(DISTINCT genre) AS genres',
  ].join('\n');

  return session.run(query, {
    movieId: movieId
    }).then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleMovieWithDetails(result.records[0]);
    }
    else {
      throw {message: 'movie not found', status: 404}
    }
  });
};

// get a single movie by id
var getByName = function (session, name1, output) {
  var query = [
    `MATCH (movie:Movie) WHERE movie.title =~ "(?i).*${ name1 }.*"`,
    'OPTIONAL MATCH (movie)<-[r:ACTS_IN]-(a:Person)',
    'OPTIONAL MATCH (related:Movie)<--(a:Person) WHERE related <> movie',
    'OPTIONAL MATCH (movie)-[:HAS_KEYWORD]->(keyword:Keyword)',
    'OPTIONAL MATCH (movie)-[:HAS_GENRE]->(genre:Genre)',
    'OPTIONAL MATCH (movie)<-[:DIRECTED]-(d:Person)',
    'OPTIONAL MATCH (movie)<-[:PRODUCED]-(p:Person)',
    'OPTIONAL MATCH (movie)<-[:WRITER_OF]-(w:Person)',
    'WITH DISTINCT movie,',
    'genre, keyword, d, p, w, a, r, related, count(related) AS countRelated',
    'ORDER BY countRelated DESC',
    'RETURN DISTINCT movie,',
    'collect(DISTINCT keyword) AS keywords, ',
    'collect(DISTINCT d) AS directors,',
    'collect(DISTINCT p) AS producers,',
    'collect(DISTINCT w) AS writers,',
    'collect(DISTINCT{ name:a.name, id:a.id, profileImageUrl:a.profileImageUrl, role:r.name}) AS actors,',
    'collect(DISTINCT related) AS related,',
    'collect(DISTINCT genre) AS genres',
  ].join('\n');

  return session.run(query, {
    name1: name1
    }).then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleMovieWithDetails(result.records[0]);
    }
    else {
      throw {message: 'movie not found', status: 404}
    }
  });
};

// Get by date range
var getByActor = function (session, id, output) {
  var query = [
    'MATCH (person:Person {id:{id}})-[:ACTS_IN]->(movie:Movie)',
    'RETURN DISTINCT movie'
  ].join('\n');

  return session.run(query, {
    id: id
  }).then(result => manyMovies(result))
};

// var getGraph = function () {
//   var session = driver.session();
//   return session.run(
//     'MATCH (m:Movie)<-[:ACTED_IN]-(a:Person) \
//     RETURN m.title AS movie, collect(a.name) AS cast \
//     LIMIT {limit}', {limit: 100})
//     .then(results => {
//       session.close();
//       var nodes = [], rels = [], i = 0;
//       results.records.forEach(res => {
//         nodes.push({title: res.get('movie'), label: 'movie'});
//         var target = i;
//         i++;
//
//         res.get('cast').forEach(name => {
//           var actor = {title: name, label: 'actor'};
//           var source = _.findIndex(nodes, actor);
//           if (source == -1) {
//             nodes.push(actor);
//             source = i;
//             i++;
//           }
//           rels.push({source, target})
//         })
//       });
//
//       return {nodes, links: rels};
//     });
// }

// export exposed functions
module.exports = {
  getByName: getByName,
  getAll: getAll,
  getById: getById,
  getByActor: getByActor
};
