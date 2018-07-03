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
    .then(result => {
    if ( output == "d3" ) {
      return graphOutput(result);
    } else  {
      return manyMovies(result);
    }
  });
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
    if ( output == "d3" ) {
      return graphOutput(result.records);
    } else if (!_.isEmpty(result.records)) {
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
    if ( output == "d3" ) {
      return graphOutput(result.records);
    } else if (!_.isEmpty(result.records)) {
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
  }).then(result => {
    if ( output == "d3" ) {
      return graphOutput(result);
    } else  {
      return manyMovies(result);
    }
  });
};

var randomColor = function () {
  var c1 = String(Math.floor(Math.random() * 255));
  var c2 = String(Math.floor(Math.random() * 255));
  var c3 = String(Math.floor(Math.random() * 255));
  var color = `rgb(${c1}, ${c2}, ${c3})`;
  return color;
}

var graphOutput = function(data) {
  // return data;
  // return results;
  var myColor = randomColor();
  var nodes = [], rels = [], i = 0;
  data.forEach(res => {
    var movie_id = res.get('movie').properties.id;
    var movie_node = res.get('movie').properties;
    movie_node['label'] = "movie";
    movie_node['symbolType'] = "circle";
    movie_node['color'] = myColor;

    if ( "version" in movie_node ) {
      delete movie_node.version;
    }
    if ( "runtime" in movie_node ) {
      delete movie_node.runtime;
    }
    nodes.push(movie_node);
    var target = movie_id;

    res.get('actors').forEach(name => {
      var person_id = name.id;
      var person_node = name
      person_node['symbolType'] = "star";
      person_node['color'] = myColor;
      person_node['label'] = "person";
      var source = person_id;
      nodes.push(person_node);
      rels.push({source, target})
    })
  });

  return {nodes, links: rels};
}

// export exposed functions
module.exports = {
  getByName: getByName,
  getAll: getAll,
  getById: getById,
  getByActor: getByActor
};
