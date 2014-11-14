/*
 * Create and initialize the Choko application.
 */

var Application = require('./lib/application');

var args = getArguments();

Application.bootstrap(args.path, args.port);

/**
 * Get port and applications folder path from command line arguments. Use port
 * from "-p" or fallback to 3000. Default folder is ./applicaions.
 */
function getArguments() {
  var port = 3000;
  var path = '.';
  var args = process.argv.slice(2);

  while (args.length) {
    var arg = args.shift();
    switch (arg) {
      case '-p':
        port = args.shift();
        break;
      default:
        path = arg;
    }
  }

  return {
    port: port,
    path: path
  };
}
