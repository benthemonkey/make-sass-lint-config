var jsyaml = require('js-yaml');
var pjson = require('./package.json');
var translations = require('./translations');

var headerTemplate = function (header) {
  var i, j,
      chunk = 4,
      out = [
        '# sass-lint config generated by make-sass-lint-config v' + header.version
      ];

  if (header.unsupported.length > 0) {
    out.push('', 'The following scss-lint Linters are not yet supported by sass-lint:');

    for (i = 0, j = header.unsupported.length; i < j; i += chunk) {
      out.push(header.unsupported.slice(i, i + chunk).join(', '));
    }
  }

  if (header.warnings.length > 0) {
    out.push('', 'The following settings/values are unsupported by sass-lint:');
    out = out.concat(header.warnings);
  }

  return out.join('\n# ') + '\n\n';
};

/**
 * Finds the severity level of a linter
 * @param   {string} linterName  - Name of the linter
 * @param   {Object} linterValue - Settings for a linter
 * @returns {bool}               - severity level of linter
 */
var getSeverity = function (linterName, linterValue) {
  var hasEnabled = linterValue.hasOwnProperty('enabled'),
      hasSeverity = linterValue.hasOwnProperty('severity');

  // special case for linters that are disabled by default:
  if (translations[linterName] && translations[linterName].defaultDisabled && !hasEnabled) {
    return 0;
  }
  else if (hasEnabled && linterValue.enabled === false) {
    return 0;
  }
  else if (hasSeverity && linterValue.severity === 'error') {
    return 2;
  }
  else {
    return 1;
  }
};

/**
 * Converts a scss-lint config file into a sass-lint config file
 * @param {Object} scssSettings  - Settings parsed from YAML
 * @param {Object} options       - options
 * @param {bool}   options.debug - include additional debug information in the returned settings object, default false
 * @returns {Object}             - sass-lint config settings
 */
var convert = function (scssSettings, options) {
  var sassSettings = {
        options: {
          formatter: 'stylish',
          'merge-default-rules': false
        },
        files: {
          include: '**/*.s+(a|c)ss'
        },
        rules: {}
      },
      unsupported = [],
      warnings = [];

  if (scssSettings.scss_files) {
    sassSettings.files.include = scssSettings.scss_files;
  }

  Object.keys(scssSettings.linters).forEach(function (linterName) {
    var linterValue = scssSettings.linters[linterName],
        severity = getSeverity(linterName, linterValue),
        translatedOptions = {},
        translation = translations[linterName];

    // handle special cases where one scss-lint rule converts to multiple sass-lint rules
    if (translation && translation.special_case) {
      translation.special_case(linterValue, sassSettings, severity);
    }
    else if (translation) {
      // go through set of options associated with the scss-lint rule and translate
      // them to sass-lint options, when possible
      Object.keys(linterValue).forEach(function (optionName) {
        var optionValue = linterValue[optionName],
            optionTranslation = translation.options ? translation.options[optionName] : false;

        if (optionName === 'enabled' || optionName === 'severity') {
          return;
        }

        if (!optionTranslation) {
          warnings.push('Linter ' + linterName + ', option "' + optionName + '"');
        }
        else if (optionTranslation.values) {
          // within an option for a rule, there is an additional layer of translation that needs
          // to occur for each possible value of the option
          // (e.g. for LeadingZero, 'style: exclude_zero' translates to 'include: false')
          if (optionTranslation.values.hasOwnProperty(optionValue)) {
            translatedOptions[optionTranslation.name] = optionTranslation.values[optionValue];
          }
          else {
            // we found a value of an option that isn't supported by sass-lint
            warnings.push('Linter ' + linterName + ', option "' + optionName + '" with value "' + optionValue + '"');
          }
        }
        else {
          // the values of this rule's options don't need additional translation
          translatedOptions[optionTranslation.name] = optionValue;
        }
      });

      // if the rule has options set use the form [severity, options], else just use severity
      if (Object.keys(translatedOptions).length > 0) {
        sassSettings.rules[translation.name] = [severity, translatedOptions];
      }
      else {
        sassSettings.rules[translation.name] = severity;
      }
    }
    else {
      unsupported.push(linterName);
    }
  });

  if (options && options.debug) {
    sassSettings.warnings = warnings;
    sassSettings.unsupported = unsupported;
  }

  return sassSettings;
};

/**
 * Perform 'convert' on a string and output the converted yaml
 * @param  {string} scssSettingsYaml - scss-lint config in YAML format
 * @returns {string}                 - sass-lint config in YAML format
 */
var convertYaml = function (scssSettingsYaml) {
  var sassSettings = convert(jsyaml.safeLoad(scssSettingsYaml), { debug: true });
  var header = headerTemplate({
    version: pjson.version,
    warnings: sassSettings.warnings,
    unsupported: sassSettings.unsupported
  });

  delete sassSettings.warnings;
  delete sassSettings.unsupported;

  return header + jsyaml.safeDump(sassSettings, { sortKeys: true });
};

module.exports = {
  convert: convert,
  convertYaml: convertYaml
};
