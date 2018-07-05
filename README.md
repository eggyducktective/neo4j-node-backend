# README

This Neo4j-based node / react web app displays movie and person data in a manner similar to IMDB. The backend for my final project for my Web Development Bootcamp at General Assembly.

I followed a tutorial on Github to set this up. I also added a few customised routes and updated my models to reflect an alternate dataset (see below). Here are the instructions that come with the original Github project.

You can see my final project here [a link](https://github.com/eggyducktective/moviestar-react-frontend)

## The Model

![image of movie model](./setup/img/model.png)

### Data

I used the neo4j movies dataset [a link](https://neo4j.com/developer/movie-database/).
Updated it with images from TheMovieDatabase.

### Relationships

Though there are many relations in this dataset. The primary one I have built my project around is :

* `(:Person)-[:ACTS_IN {role:"some role"}]->(:Movie)`

## Database Setup

### Mac

To set up a local Dev environment you are able to install this database using "brew".
NOTE: That java 1.8 is needed.

### Hosted.

This can be installed on a hosted linux instance using the local package manager eg:
`yum install neo4j`

Digital Ocean is relatively straight forward and most cloud hosting providers seem to provide a pre-built image.

### Getting started

If you see `Input error: Directory 'neo4j-community-3.2.5/data/databases/graph.db' already contains a database`, delete the `graph.db` directory and try again.

The built in user is neo4j/neo4j

## Node API

From the root directory of this project:

* `npm install`
* `node app.js` starts the API

## API Documentation

There is a swagger doc for each API call available at:

* Take a look at the docs at [http://localhost:3000/docs](http://localhost:3000/docs)
(Currently seems to be unavailable when hosted on Heroku etc.)

## Contributing

### Node.js/Express API

The API itself is created using the [Express web framework for Node.js](https://expressjs.com/). The API endpoints
are documented using swagger and [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc) module.

To add a new API endpoint there are 3 steps:

1. Create a new route method in `/routes` directory
2. Describe the method with swagger specification inside a JSDoc comment to make it visible in swagger
3. Add the new route method to the list of route methods in `/app.js`.
