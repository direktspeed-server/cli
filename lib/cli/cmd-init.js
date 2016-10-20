var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var debug = require('debug')('dssrv-cli:binary');

var utils = require('../utils');
var generate = utils.generate;
var installIfMissing = utils.installIfMissing;

module.exports = function(root, mypkg, folder, options) {
  debug('Initializing new application', folder);

  if (folder) {
    var appDir = path.join(process.cwd(), folder);

    if (fs.existsSync(appDir)) {
      return Q.reject(new Error('Folder `' + folder + '` already exists.'));
    }

    console.log('Creating folder ' + folder);
    mkdirp.sync(appDir);
    process.chdir(appDir);
  }

  var nodeModules = path.join(process.cwd(), 'node_modules');

  if(!fs.existsSync(nodeModules)) {
    nodeModules = path.join(root, 'node_modules');
  }

  debug('Generating application in folder', process.cwd());

  var type = options.type || 'app';
  var genVersion = mypkg.dssrv.dependencies['generator-dssrv'];

  return installIfMissing(nodeModules, 'generator-dssrv', genVersion)()
    .then(function() {
      return generate(nodeModules, 'generator-dssrv', [type, {
        version: mypkg.version,
        packages: mypkg.dssrv,
        skipInstall: options.skipInstall
      }]);
    });
};
