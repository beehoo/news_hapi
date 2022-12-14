const users = require('./users');
const articles = require('./articles');

const routes = [
  ...users,
  ...articles
];

module.exports = routes;