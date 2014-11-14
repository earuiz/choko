/*
 * Create and initialize the Choko application.
 */

var fs = require('fs');
var path = require('path');
var util = require('util');
var lodash = require('lodash');
var Application = require('./lib/application');

var args = getArguments();
var settings = getSettings(args.path);

var application = new Application(settings);
application.start(args.port);

/**
 * Build settings object.
 */
function getSettings(appDir) {
  var modes = [];
  var mergingSettings = [];
  var applicationPaths = {
    default: path.resolve('./applications/default'),
    main: path.resolve(appDir)
  };

  // Always add environment mode.
  modes.push(process.env.NODE_ENV);

  // Default settings.
  var settings = {
    baseDir: path.resolve(__dirname),
    applicationDir: path.resolve(appDir)
  };

  // Loop through applications.
  Object.keys(applicationPaths).forEach(function(name) {

    // Initiate possible settings files paths array.
    var applicationSettings = [];

    // Add default main settings file for this application.
    applicationSettings.push(applicationPaths[name] + '/settings.json');
    applicationSettings.push(applicationPaths[name] + '/settings.local.json');

    // Loop through modes to register possible file paths.
    modes.forEach(function(mode) {
      var filePath = applicationPaths[name] + '/settings.' + mode;

      // Register possible file paths for both 'mode' and 'mode.local'.
      applicationSettings.push(filePath + '.json');
      applicationSettings.push(filePath + '.local.json');
    });

    // Loop through defined file paths to load the ones that exist.
    applicationSettings.forEach(function(filePath) {
      if (fs.existsSync(filePath)) {
        mergingSettings.push(JSON.parse(fs.readFileSync(path.relative(settings.baseDir, filePath), 'utf-8')));
      }
    });
  });

  // Load and merge all the settings.
  lodash.merge.apply(null, [settings].concat(mergingSettings));

  return settings;
}

/**
 * Get port and applications folder path from command line arguments. Use port
 * from "-p" or fallback to 3000. Default folder is ./applicaions.
 */
function getArguments() {
  var port = 3000;
  var path = './applications';
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
