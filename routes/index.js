const users = require('./users');
const articles = require('./articles');
const tags = require('./tags');

const routes = [
  ...users,
  ...articles,
  ...tags
];

module.exports = routes;