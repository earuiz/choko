var async = require('async');
var validator = require('validator/lib/validators');
var uuid = require('node-uuid');
var utils = require('prana').utils;

var field = module.exports = {};

/**
 * The field() hook.
 */
field.field = function(fields, callback) {
  var newFields = {};

  newFields['id'] = {
    title: 'Identifier',
    description: 'A Universally unique identifier.',
    schema: {
      type: 'string'
    },
    beforeCreate: function(settings, item, next) {
      if (!(settings.name in item)) {
        // Generate an UUID v4.
        item[settings.name] = uuid.v4();
      }
      next();
    }
  };

  newFields['text'] = {
    title: 'Text',
    schema: function(settings) {
      var schema = {
        type: (settings.maxLength > 256) ? 'text' : 'string'
      };

      // Add max/min properties if set.
      ['maxLength', 'minLength'].map(function(what) {
        if (what in settings) {
          schema[what] = settings[what];
        }
      });

      return schema;
    },
    element: function(fieldSettings) {
      return  {
        // If options is set, use a select element instead of text one.
        type: 'options' in fieldSettings ? 'select' : 'text'
      };
    },
    validate: function(settings, item, next) {
      // Default minLenght to 1.
      settings.minLength = settings.minLength || 1;

      // Default maxLenght to 256.
      settings.maxLength = settings.maxLength || 256;

      next(null, !validator.notEmpty(item[settings.name]) || validator.len(item[settings.name].toString(), settings.minLength, settings.maxLength) || 'Value must have from ' + settings.minLength + ' to ' + settings.maxLength + ' characters.');
    }
  };

  newFields['number'] = {
    title: 'Number',
    schema: function(settings) {
      var schema = {
        type: (settings.decimals && settings.decimals > 0) ? 'float' : 'integer'
      };

      // Add max/min properties if set.
      ['max', 'min'].map(function(what) {
        if (what in settings) {
          schema[what] = settings[what];
        }
      });

      return schema;
    },
    element: 'number',
    validate: function(settings, item, next) {
      next(null, validator.isNumeric(item[settings.name].toString()) || 'Invalid number.');
    }
  };

  newFields['date'] = {
    title: 'Date',
    schema: 'date',
    element: 'date',
    validate: function(settings, item, next) {
      next(null, validator.isDate(item[settings.name].toString()) || 'Invalid date.');
    }
  };

  newFields['datetime'] = {
    title: 'Datetime',
    schema: 'datetime',
    element: 'datetime',
    validate: function(settings, item, next) {
      next(null, validator.isDate(item[settings.name].toString()) || 'Invalid date/time.');
    }
  };

  newFields['boolean'] = {
    title: 'Boolean',
    description: 'True or false, yes or no, on or off.',
    schema: 'boolean',
    element: 'checkbox'
  };

  newFields['email'] = {
    title: 'Email',
    schema: {
      type: 'string',
      email: true
    },
    element: 'email',
    validate: function(settings, item, next) {
      // Email validator oddly returns the email itself, so need to convert to
      // boolean.
      next(null, new Boolean(validator.isEmail(item[settings.name].toString())) || 'Invalid email.');
    }
  };

  newFields['url'] = {
    title: 'URL',
    schema: {
      type: 'string',
      url: true
    },
    element: 'url',
    validate: function(settings, item, next) {
      next(null, validator.isUrl(item[settings.name].toString()) || 'Invalid URL.');
    }
  };

  newFields['telephone'] = newFields['tel'] = {
    title: 'Telephone',
    schema: {
      type: 'string'
    },
    element: 'tel'
  };

  newFields['password'] = {
    title: 'Password',
    schema: 'string',
    element: 'password',
    validate: function(settings, item, next) {
      var minLength = settings.minLength || 6;
      next(null, validator.len(item[settings.name].toString(), settings.minLength || 6) || 'Password must have at least ' + minLength + ' characters.');
    }
  };

  newFields['reference'] = {
    title: 'Reference',
    schema: function(settings) {
      var schema = {
        type: settings.multiple ? 'array' : 'json'
      };

      return schema;
    },
    element: 'reference',
    validate: function(settings, item, next) {
      // @todo: validate references.
      next();
    }
  };

  callback(null, newFields);
};

/**
 * Generate a hook implementation for each pre/post operations that calls a
 * callback on the field type with the same name.
 */
field.fieldCallback = function(hook) {
  return function(type, data, callback) {
    var application = this.application;
    var type = application.types[type]
    if (type.fields) {
      // Validate type fields.
      async.each(Object.keys(type.fields), function(fieldName, next) {
        var fieldSettings = type.fields[fieldName];

        // Add fieldName to fieldSettings.
        fieldSettings.name = fieldName;

        application.pick('field', fieldSettings.type, function(error, field) {
          if (error) {
            // Application error.
            return next(error);
          }
          if (!field || !(hook in field)) {
            // Field is of an unrecognized type or there's not a callback.
            return next();
          }

          field[hook](fieldSettings, data, function(error, result) {
            if (error) {
              // Application error.
              return next(error);
            }

            next();
          });
        });
      },
      function(error) {
        if (error) {
          // Application error.
          return callback(error);
        }
        callback();
      });
    }
    else {
      callback();
    }
  };
};

/**
 * Create hook implementations for all type operations to call field hooks.
 */
['create', 'update', 'validate', 'destroy'].forEach(function(operation) {
  var operationCapitalized = utils.capitalizeFirstLetter(operation);

  // Add pre operation hooks that call callbacks on fields.
  ['before', 'after'].forEach(function(kind) {
    var hook = kind + operationCapitalized;
    field[hook] = field.fieldCallback(hook);
  });
});

/**
 * The find() hook;
 *
 * Allow fields to alter queries being executed.
 */
field.find = field.fieldCallback('find');

/**
 * The list() hook;
 *
 * Allow fields to alter data being listed.
 */
field.list = field.fieldCallback('list');
