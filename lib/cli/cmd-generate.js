var path = require('path');
var generate = require('../utils').generate;
var debug = require('debug')('dssrv-cli:binary');

module.exports = function(root, type, options) {
  debug('Generating', 'generator-dssrv', type, options);

  return generate(
    path.join(root, 'node_modules'),
    'generator-dssrv',
    [[type].concat(options)]
  );
};
