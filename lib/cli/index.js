var path = require('path');
var utils = require('../utils');
var program = require('commander');
var getLocalBins = require('./get-local-bins');
var getNpmScripts = require('./get-npm-scripts');
var debug = require('debug')('donejs-cli:binary');
var isWindows = require('os').platform() === 'win32';




program
  .version(pkg.version)

var output = function(msg){
  var v = pkg.version
  console.log("------------")
  console.log("DIREKTSPEED Server v" + v + " – DIREKTSPEED. 2015–2017")
  if(msg){
    console.log(msg)
    console.log("Press Ctl+C to stop the server")
  }
  console.log("------------")
}

program
  .command("server [path]")
  .option("-i, --ip <ip>", "Specify IP to bind to")
  .option("-p, --port <port>", "Specify a port to listen on")
  .option("-c, --config <path>", "Specify a port to listen on")
  .usage("starts a DIREKTSPEED Server in current directory, or in the specified directory.")
  .description("Start a DIREKTSPEED Server in current directory")
  .action(function(path, program){
    var projectPath = nodePath.resolve(process.cwd(), path || "")
    var ip          = program.ip || '0.0.0.0'
    var port        = program.port || 9000
    var options = { 
      ip: ip, 
      port: port 
    }
    
    prerender.server(projectPath, options, function(){
      var address = ''
      if(ip == '0.0.0.0' || ip == '127.0.0.1') {
        address = 'localhost'
      } else {
        address = ip
      }
      var hostUrl = "http://" + address + ":" + port + "/"
      output("Your server is listening at " + hostUrl)
    })
  })

program
  .command("multihost [path]")
  .option("-i, --ip <ip>", "Specify IP to bind to")
  .option("-p, --port <port>", "Specify a port to listen on")
  .option("-c, --config <path>", "Specify a port to listen on")
  .usage("starts a DIREKTSPEED Server to host a directory of DIREKTSPEED Server projects.")
  .description("Start a DIREKTSPEED Server to host a directory of DIREKTSPEED Server projects")
  .action(function(path, program){
    var projectPath = nodePath.resolve(process.cwd(), path || "")
    var port        = program.port || 9000
    var options = { 
      port: port 
    }
    
    prerender.multihost(projectPath, options, function(){
      if(port == "80"){
        var loc = "http://dssrv.nu"
      }else{
        var loc = "http://dssrv.nu:" + port
      }
      output("Your server is hosting multiple projects at " + loc)
    })
  })

program.on("--help", function(){
  console.log("  Use 'dssrv <command> --help' to get more information or visit http://server.dspeed.eu/ to learn more.")
  console.log('')
})


// commands
var add = require('./cmd-add');
var init = require('./cmd-init');
var generate = require('./cmd-generate');
var commandList = ['init', 'generate', 'add'];

module.exports = function(root) {
  var mypkg = require(path.join(__dirname, '..', '..', 'package.json'));

  debug('mypkg', mypkg);

  program.version(mypkg.version)
    .description(
      'The DoneJS command line utility lets you run generators, NPM scripts ' +
      'and binaries local to your project.'
    );

  // donejs init
  program.command('init [folder]')
    .option('-S, --skip-install')
    .option('-T, --type [type]')
    .description(
      'Initialize a new DoneJS application or plugin (--type plugin) in ' +
      'a new folder or the current one'
    )
    .action(function(folder, options) {
      utils.log(init(root, mypkg, folder, options));
    });

  // donejs generate
  program.command('generate <name> [options...]')
    .description('Run a generator.')
    .action(function(type, options) {
      utils.log(generate(root, type, options));
    });

  // donejs add
  program.command('add <name> [params...]')
    .description('Add functionality to your project')
    .action(function(name, params) {
      utils.log(add(root, name, params));
    });

  // add package npm scripts as commands
  var scripts = getNpmScripts(root);
  Object.keys(scripts).forEach(function(script) {
    if (commandList.indexOf(script) === -1) {
      commandList.push(script);
      program.command(script + ' [...args]')
        .description('`' + scripts[script] + '` (package.json)')
        .action(function(args) {
          debug('Running script', script, args);
          utils.log(utils.runScript(script, args));
        });
    }
  });

  // add all other local binaries
  var binPath = path.join(path.join(root, 'node_modules'), '.bin');
  getLocalBins(binPath).forEach(function(name) {
    if (commandList.indexOf(name) === -1) {
      commandList.push(name);

      program.command(name + ' [...args]')
        .description('')
        .action(function(args) {
          var filename = name + (isWindows ? '.cmd': '');
          debug('Running command', name, args);
          utils.log(utils.runCommand(path.join(binPath, filename), args));
        });
    }
  });

  // catchall
  program.command('*')
    .description('')
    .action(function(command) {
      console.error('Could not run `' + command + '`');
      program.help();
    });

  return program;
};
