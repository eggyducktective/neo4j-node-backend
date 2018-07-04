// extracts just the data from the query results

var _ = require('lodash');

var Movie = module.exports = function (_node, myRating) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id;
  }
  if (this.runtime) {
    this.runtime = this.runtime.toNumber();
  }

  if(myRating || myRating === 0) {
    this['my_rating'] = myRating;
  }
};
