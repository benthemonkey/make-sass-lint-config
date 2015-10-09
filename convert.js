(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* globals _, jsyaml, CodeMirror, document */

var pjson = require('./package.json');
var translations = require('./translations');

var source, result;

var headerTemplate = _.template(['#',
  '# sass-lint config settings generated by make-sass-lint-config v<%= version %>',
  '#',
  '# The following scss-lint Linters are not yet supported by sass-lint:',
  '# <%= unsupported.join(", ") %>',
  '#',
  '# The following settings/values are unsupported by sass-lint:',
  '# <%= warnings.join("\\n# ") %>',
  '#'
  ].join('\n'));

var convert = function () {
  var sassSettings = {};
  var header = {
    version: pjson.version,
    unsupported: [],
    warnings: []
  };
  var scssSettings = jsyaml.safeLoad(source.getValue()).linters;

  _.forEach(scssSettings, function (linterValue, linterName) {
    var severity;
    var translatedSettings = {};
    var translation = translations[linterName];

    if (translation) {
      _.forEach(linterValue, function (optionValue, optionName) {
        if (optionName === 'enabled') {
          // if (translation.invert) {
          //   severity = optionValue ? 0 : 1
          // } else {
          //   severity = optionValue ? 1 : 0
          // }
          severity = optionValue ? 1 : 0;
          return;
        }

        var optionTranslation = translation.options ? translation.options[optionName] : false;

        if (!optionTranslation) {
          header.warnings.push('Linter ' + linterName + ', option "' + optionName + '"');
        }
        else if (optionTranslation.values) {
          if (_.has(optionTranslation.values, optionValue)) {
            translatedSettings[optionTranslation.name] = optionTranslation.values[optionValue];
          }
          else {
            header.warnings.push('Linter ' + linterName + ', option "' + optionName + '" with value "' + optionValue + '"');
          }
        }
        else {
          translatedSettings[optionTranslation.name] = optionValue;
        }
      });

      if (_.isEmpty(translatedSettings)) {
        sassSettings[translation.name] = severity;
      }
      else {
        sassSettings[translation.name] = [severity, translatedSettings];
      }
    }
    else {
      header.unsupported.push(linterName);
    }
  });

  result.setValue(headerTemplate(header) + jsyaml.safeDump(
      {
        options: {
          'merge-default-rules': false
        },
        rules: sassSettings
      },
      {
        sortKeys: true
      }));
};

document.addEventListener('DOMContentLoaded', function () {
  source = CodeMirror.fromTextArea(document.getElementById('source'), {
    mode: 'yaml',
    undoDepth: 1
  });

  source.on('change', _.throttle(convert, 500));

  result = CodeMirror.fromTextArea(document.getElementById('result'), {
    readOnly: true
  });
});

},{"./package.json":2,"./translations":3}],2:[function(require,module,exports){
module.exports={
  "name": "make-sass-lint-config",
  "version": "0.0.1",
  "description": "Convert your .scss-lint.yml config file into the equivalent .sass-lint.yml",
  "main": "index.js",
  "scripts": {
    "build": "./node_modules/browserify/bin/cmd.js index.js -o convert.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/benthemonkey/make-sass-lint-config.git"
  },
  "author": "Ben Rothman <bensrothman@gmail.com>",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/benthemonkey/make-sass-lint-config/issues"
  },
  "homepage": "https://github.com/benthemonkey/make-sass-lint-config#readme",
  "dependencies": {
    "browserify": "^11.2.0"
  },
  "devDependencies": {
    "eslint": "^1.6.0"
  }
}

},{}],3:[function(require,module,exports){
// TODO: BangFormat
module.exports.BorderZero = {
  name: 'border-zero',
  options: {
    convention: {
      name: 'convention'
    }
  }
};

module.exports.ColorKeyword = { name: 'no-color-keyword' };
module.exports.ColorVariable = { name: 'no-color-literals' };
module.exports.Comment = { name: 'no-css-comments' };
module.exports.DebugStatement = { name: 'no-debug' };
// TODO DeclarationOrder
module.exports.DuplicateProperty = { name: 'no-duplicate-properties' };
module.exports.EmptyLineBetweenBlocks = { name: 'empty-line-between-blocks' };
module.exports.EmptyRule = { name: 'no-empty-rulesets' };
module.exports.ExtendDirective = { name: 'no-extends' };

module.exports.FinalNewline = {
  name: 'final-newline',
  options: {
    present: {
      name: 'include'
    }
  }
};

module.exports.HexLength = {
  name: 'hex-length',
  options: {
    style: {
      name: 'style'
    }
  }
};

module.exports.HexNotation = {
  name: 'hex-notation',
  options: {
    style: {
      name: 'style'
    }
  }
};

module.exports.HexValidation = { name: 'no-invalid-hex' };
module.exports.IdSelector = { name: 'no-ids' };
module.exports.ImportantRule = { name: 'no-important' };

module.exports.ImportPath = {
  name: 'clean-import-paths',
  options: {
    leading_underscore: {
      name: 'leading-underscore'
    },
    filename_extension: {
      name: 'filename-extension'
    }
  }
};

module.exports.Indentation = {
  name: 'indentation',
  options: {
    width: {
      name: 'width'
    }
  }
};

module.exports.LeadingZero = {
  name: 'leading-zero',
  options: {
    style: {
      name: 'include',
      values: {
        exclude_zero: false,
        include_zero: true
      }
    }
  }
};

module.exports.MergeableSelector = { name: 'no-mergeable-selectors' };

// TODO: NameFormat

module.exports.NestingDepth = {
  name: 'nesting-depth',
  options: {
    max_depth: {
      name: 'max-depth'
    }
  }
};

module.exports.PlaceholderInExtend = { name: 'placeholder-in-extend' };

module.exports.PropertySortOrder = {
  name: 'property-sort-order',
  options: {
    order: {
      name: 'order'
    }
  }
};

module.exports.PropertySpelling = {
  name: 'no-misspelled-properties',
  options: {
    extra_properties: {
      name: 'extra-properties'
    }
  }
};

module.exports.QualifyingElement = {
  name: 'no-qualifying-elements',
  options: {
    allow_element_with_attribute: {
      name: 'allow-element-with-attribute'
    },
    allow_element_with_class: {
      name: 'allow-element-with-class'
    },
    allow_element_with_id: {
      name: 'allow-element-with-id'
    }
  }
};

module.exports.Shorthand = {
  name: 'shorthand-values',
  options: {
    allowed_shorthands: {
      name: 'allowed-shorthands'
    }
  }
};

module.exports.SingleLinePerProperty = {
  name: 'brace-style',
  options: {
    allow_single_line_rule_sets: {
      name: 'allow-single-line'
    }
  }
};

module.exports.SingleLinePerSelector = {
  name: 'single-line-per-selector'
};

module.exports.SpaceAfterComma = {
  name: 'space-after-comma',
  options: {
    style: {
      name: 'include',
      values: {
        one_space: true,
        no_space: false
      }
    }
  }
};

module.exports.SpaceAfterPropertyColon = {
  name: 'space-after-colon',
  options: {
    style: {
      name: 'include',
      values: {
        one_space: true,
        no_space: false
      }
    }
  }
};

module.exports.SpaceAfterPropertyName = { name: 'space-before-colon' };
module.exports.SpaceAfterVariableName = { name: 'space-before-colon' };

module.exports.SpaceBeforeBrace = {
  name: 'space-before-brace',
  options: {
    style: {
      name: 'include',
      values: {
        space: true
      }
    }
  }
};

module.exports.SpaceBetweenParens = {
  name: 'space-between-parens',
  options: {
    spaces: {
      name: 'include',
      values: {
        '0': false,
        '1': true
      }
    }
  }
};

module.exports.StringQuotes = {
  name: 'quotes',
  options: {
    style: {
      name: 'style',
      values: {
        single_quotes: 'single',
        double_quotes: 'double'
      }
    }
  }
};

module.exports.TrailingSemicolon = { name: 'trailing-semicolon' };
module.exports.TrailingZero = { name: 'no-trailing-zero' };
module.exports.TransitionAll = { name: 'no-transition-all' };
module.exports.UrlFormat = { name: 'no-url-protocols' };
module.exports.UrlQuotes = { name: 'url-quotes' };

module.exports.VariableForProperty = {
  name: 'variable-for-property',
  options: {
    properties: {
      name: 'properties'
    }
  }
};

module.exports.VendorPrefix = {
  name: 'no-vendor-prefixes',
  options: {
    additional_identifiers: {
      name: 'additional-identifiers'
    },
    excluded_identifiers: {
      name: 'excluded-identifiers'
    }
  }
};

module.exports.ZeroUnit = { name: 'zero-unit' };

},{}]},{},[1]);