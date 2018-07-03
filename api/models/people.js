var _ = require('lodash');
var Person = require('../models/neo4j/person');

var _singlePersonWithDetails = function (record) {
  if (record.length) {
    var result = {};
    _.extend(result, new Person(record.get('person')));
    // mappings are temporary until the neo4j driver team decides what to do about numbers
    result.actedIn = _.map(record.get('actedIn'), record => {
      if (record.id) {
        record.id = record.id;
      }
      return record;
    });
    result.related = _.map(record.get('related'), record => {
      if (record.id) {
        record.id = record.id;
      }
      return record;
    });
    return result;
  }
  else {
    return null;
  }
};

// return many people
function _manyPeople(neo4jResult) {
  return neo4jResult.records.map(r => new Person(r.get('person')))
}

// get a single person by id
var getById = function (session, id, output) {
  var query = [
    'MATCH (person:Person {id:{id}})',
    'OPTIONAL MATCH (person)-[:DIRECTED]->(d:Movie)',
    'OPTIONAL MATCH (person)<-[:PRODUCED]->(p:Movie)',
    'OPTIONAL MATCH (person)<-[:WRITER_OF]->(w:Movie)',
    'OPTIONAL MATCH (person)<-[r:ACTS_IN]->(a:Movie)',
    'OPTIONAL MATCH (person)-->(movies)<-[relatedRole:ACTS_IN]-(relatedPerson)',
    'RETURN DISTINCT person,',
    'collect(DISTINCT { name:d.title, id:d.id, imageUrl:d.imageUrl}) AS directed,',
    'collect(DISTINCT { name:p.title, id:p.id, imageUrl:p.imageUrl}) AS produced,',
    'collect(DISTINCT { name:w.title, id:w.id, imageUrl:w.imageUrl}) AS wrote,',
    'collect(DISTINCT{ name:a.title, id:a.id, imageUrl:a.imageUrl, role:r.name}) AS actedIn,',
    'collect(DISTINCT{ name:relatedPerson.name, id:relatedPerson.id, imageUrl:relatedPerson.profileImageUrl, role:relatedRole.name}) AS related'
  ].join('\n');

  return session
    .run(query, {id: id})
    .then(result => {
      if ( output == "d3" ) {
        return graphOutput(result.records);
      } else if (!_.isEmpty(result.records)) {
        return _singlePersonWithDetails(result.records[0]);
      }
      else {
        throw {message: 'person not found', status: 404}
      }
    });
};

// get all people
var getAll = function (session, output) {
  return session.run('MATCH (person:Person) RETURN person')
    .then(result => {
      if ( output == "d3" ) {
        return graphOutput(result);
      } else {
        return _manyPeople(result)}
      });
};


// get a single person by name
var getByName = function (session, name1, output) {
  var query = [
    // 'MATCH (person:Person {name:{name1}})',
    `MATCH (person:Person) WHERE person.name =~ "(?i)${ name1 }"`,
    'OPTIONAL MATCH (person)-[:DIRECTED]->(d:Movie)',
    'OPTIONAL MATCH (person)<-[:PRODUCED]->(p:Movie)',
    'OPTIONAL MATCH (person)<-[:WRITER_OF]->(w:Movie)',
    'OPTIONAL MATCH (person)<-[r:ACTS_IN]->(a:Movie)',
    'OPTIONAL MATCH (person)-->(movies)<-[relatedRole:ACTS_IN]-(relatedPerson)',
    'RETURN DISTINCT person,',
    'collect(DISTINCT { name:d.title, id:d.id, imageUrl:d.imageUrl}) AS directed,',
    'collect(DISTINCT { name:p.title, id:p.id, imageUrl:p.imageUrl}) AS produced,',
    'collect(DISTINCT { name:w.title, id:w.id, imageUrl:w.imageUrl}) AS wrote,',
    'collect(DISTINCT{ name:a.title, id:a.id, imageUrl:a.imageUrl, role:r.name}) AS actedIn,',
    'collect(DISTINCT{ name:relatedPerson.name, id:relatedPerson.id, profileImageUrl:relatedPerson.profileImageUrl, role:relatedRole.name}) AS related'
  ].join('\n');

  return session
    .run(query, {name1: name1})
    .then(result => {
      if ( output == "d3" ) {
        return graphOutput(result.records);
      } else if (!_.isEmpty(result.records)) {
        return _singlePersonWithDetails(result.records[0]);
      }
      else {
        throw {message: 'person not found', status: 404}
      }
    });
};

// get a single person by name
var search = function (session, name1, output) {
  var query = [
    `MATCH (person:Person) WHERE person.name =~ "(?i).*${ name1 }.*"`,
    'OPTIONAL MATCH (person)-[:DIRECTED]->(d:Movie)',
    'OPTIONAL MATCH (person)<-[:PRODUCED]->(p:Movie)',
    'OPTIONAL MATCH (person)<-[:WRITER_OF]->(w:Movie)',
    'OPTIONAL MATCH (person)<-[r:ACTS_IN]->(a:Movie)',
    'OPTIONAL MATCH (person)-->(movies)<-[relatedRole:ACTS_IN]-(relatedPerson)',
    'RETURN DISTINCT person'
  ].join('\n');

  return session
    .run(query, {name1: name1})
    .then(result => {
      if ( output == "d3" ) {
        return graphOutput(result.records);
      } else if (!_.isEmpty(result.records)) {
        return _manyPeople(result);
      }
      else {
        throw {message: 'person not found', status: 404}
      }
    });
};

// get people in Bacon path, return many persons
var getBaconPeople = function (session, name1, name2, output) {
//needs to be optimized
  var query = [
    'MATCH p = shortestPath( (p1:Person {name:{name1} })-[:ACTS_IN*]-(target:Person {name:{name2} }) )',
    'WITH extract(n in nodes(p)|n) AS coll',
    'WITH filter(thing in coll where length(thing.name)> 0) AS bacon',
    'UNWIND(bacon) AS person',
    'RETURN DISTINCT person'
  ].join('\n');

  return session.run(query, {
    name1: name1,
    name2: name2
  }).then(result => {
    if ( output == "d3" ) {
      return graphOutput(result.records);
    } else if (!_.isEmpty(result.records)) {
      return _manyPeople(result);
    }
    else {
      throw {message: 'person not found', status: 404}
    }
  });
};


// Get by movie
var getByMovie = function (session, id, output) {
  var query = [
    'MATCH (person:Person)-[:ACTS_IN]->(movie:Movie {id:{id}})',
    'RETURN DISTINCT person'
  ].join('\n');

  return session.run(query, {
    id: id
  }).then(result => {
    if ( output == "d3" ) {
      return graphOutput(result.records);
    } else if (!_.isEmpty(result.records)) {
      return _manyPeople(result);
    }
    else {
      throw {message: 'person not found', status: 404}
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
  // return results;
  var myColor = randomColor();
  var nodes = [], rels = [], i = 0;
  data.forEach(res => {
    var person_id = res.get('person').properties.id;
    var person_node = res.get('person').properties;
    person_node['label'] = "person";
    person_node['symbolType'] = "star";
    person_node['color'] = myColor;
    if ( "version" in person_node ) {
      delete person_node.version;
    }
    nodes.push(person_node);
    var target = person_id;

    res.get('actedIn').forEach(name => {
      var movie_id = name.id;
      var movie_node = name
      if ( "role" in movie_node ){
        delete movie_node.role;
      }
      movie_node['label'] = "movie";
      movie_node['symbolType'] = "circle";
      movie_node['color'] = myColor;

      var source = movie_id;
      nodes.push(movie_node);
      rels.push({source, target})
    })
  });

  return {nodes, links: rels};
}

module.exports = {
  search: search,
  getByMovie: getByMovie,
  getByName: getByName,
  getAll: getAll,
  getById: getById,
  getBaconPeople: getBaconPeople
};
