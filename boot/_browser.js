if (this.window == null) return;
void (function(){var _browser_require_ = function(module,exports,require){var modules, normalize, require, resolve;

if (this.global == null) {
  this.global = (function() {
    return this;
  })();
}

if (this.require != null) {
  return;
}

require = function(path) {
  var i, m, object, originalPath, steps;
  originalPath = path;
  m = modules[path];
  if (!m) {
    if (path[path.length - 1] !== '/') {
      path += '/';
    }
    path += "index";
    m = modules[path];
  }
  if (!m) {
    steps = path.replace(/\/index$/, "").split(/\//);
    object = this;
    i = 0;
    while ((object != null) && i < steps.length) {
      object = object[steps[i]];
      i++;
    }
    if (object != null) {
      m = modules[originalPath] = {
        exports: object
      };
    }
  }
  if (!m) {
    throw new Error("Couldn't find module for: " + path);
  }
  if (!m.exports) {
    m.exports = {};
    m.id = path;
    m.call(this, m, m.exports, resolve(path));
  }
  return m.exports;
};

modules = {};

normalize = require.normalize = function(curr, path) {
  var i, seg, segs;
  segs = curr.split("/");
  seg = void 0;
  if (path[0] !== ".") {
    return path;
  }
  segs.pop();
  path = path.split("/");
  i = 0;
  while (i < path.length) {
    seg = path[i];
    if (seg === "..") {
      segs.pop();
    } else {
      if (seg !== ".") {
        segs.push(seg);
      }
    }
    ++i;
  }
  return segs.join("/");
};

resolve = function(path) {
  return function(p) {
    return require(normalize(path, p));
  };
};

require.register = function(path, fn) {
  return modules[path] = fn;
};

require.loadAll = function() {
  var id, _results;
  _results = [];
  for (id in modules) {
    _results.push(require(id));
  }
  return _results;
};

require.getModuleIds = function() {
  return Object.keys(modules);
};

require.runTests = function(callback) {
  var fn;
  fn = function() {
    return require("ion/browser/tester").runTests(require.getModuleIds(), callback);
  };
  if (global.setTimeout != null) {
    return setTimeout(fn, 0);
  } else {
    return fn();
  }
};

if (typeof module === "undefined") {
  this.require = require;
} else {
  module.exports = require;
}

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('browser/require',_browser_require_);
    else
      _browser_require_.call(this, module, exports, require);
  }
  else {
    _browser_require_.call(this);
  }
}).call(this)
void (function(){var _browser_html_ = function(module,exports,require){var name, _fn, _i, _len, _ref;

_ref = ["div", "span", "input", "a", "br", "button", "caption", "fieldset", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "legend", "menu", "option", "select", "script", "pre", "table", "tbody", "td", "tr", "thead"];
_fn = function(name) {
  return exports[name] = function(properties) {
    var element, key, value;
    element = document.createElement(name);
    if (properties != null) {
      for (key in properties) {
        value = properties[key];
        element[key] = value;
      }
    }
    return element;
  };
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  _fn(name);
}

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('browser/html',_browser_html_);
    else
      _browser_html_.call(this, module, exports, require);
  }
  else {
    _browser_html_.call(this);
  }
}).call(this)
void (function(){var _browser_tester_ = function(module,exports,require){var args, file, manifest, manifestFile, moduleId, modules, np, runTest, runTests, spawnTests, utility, _i, _len, _ref;

runTest = function(name, test, callback) {
  var e, expectedCallbacks, key, result, value;
  expectedCallbacks = [];
  if (typeof test === 'object') {
    for (key in test) {
      value = test[key];
      expectedCallbacks = expectedCallbacks.concat(runTest(name + ' ' + key, value, callback));
    }
  } else if (typeof test === 'function') {
    if (/^\s*function\s*[a-zA-Z_0-9]*\s*\(\s*(done)?\s*\)/.test(test.toString())) {
      expectedCallbacks.push(name);
      try {
        if (test.length === 1) {
          test(function(error, warning) {
            return callback(name, error, warning);
          });
        } else {
          result = test();
          callback(name, null, result);
        }
      } catch (_error) {
        e = _error;
        callback(name, e, null);
      }
    }
  }
  return expectedCallbacks;
};

exports.spawnTests = spawnTests = function(manifestFile) {
  var command;
  command = "node" + (process.platform === 'win32' ? '.cmd' : '') + " " + __filename + " " + manifestFile;
  require('../builder/utility').spawn(command);
};

exports.runTests = runTests = function(moduleIds, callback) {
  var array, duration, e, error, expectedCallbacks, getIncompleteCallbacks, handler, inc, key, module, moduleId, name, timeout, waitingForFinishTimeout, warning, _i, _len,
    _this = this;
  if (!moduleIds) {
    throw new Error("moduleIds is required");
  }
  if (callback == null) {
    callback = exports.createCallback();
  }
  expectedCallbacks = {};
  waitingForFinishTimeout = null;
  handler = function(name, error, warning) {
    var inc;
    expectedCallbacks[name] = true;
    callback(name, error, warning);
    if (waitingForFinishTimeout != null) {
      inc = getIncompleteCallbacks();
      if (inc.length === 0) {
        clearTimeout(waitingForFinishTimeout);
        return callback();
      }
    }
  };
  for (key in moduleIds) {
    moduleId = moduleIds[key];
    try {
      module = require(moduleId);
      name = Array.isArray(moduleIds) ? moduleId : key;
      array = runTest(name, module.test, handler);
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        name = array[_i];
        if (expectedCallbacks[name] == null) {
          expectedCallbacks[name] = false;
        }
      }
    } catch (_error) {
      e = _error;
      handler(moduleId, e, null);
    }
  }
  getIncompleteCallbacks = function() {
    var value;
    return (function() {
      var _results;
      _results = [];
      for (name in expectedCallbacks) {
        value = expectedCallbacks[name];
        if (!value) {
          _results.push(name);
        }
      }
      return _results;
    })();
  };
  inc = getIncompleteCallbacks();
  if (inc.length === 0) {
    return callback();
  } else {
    duration = 10000;
    error = "Timed out after " + duration + " ms";
    warning = void 0;
    timeout = function() {
      var _j, _len1;
      inc = getIncompleteCallbacks();
      for (_j = 0, _len1 = inc.length; _j < _len1; _j++) {
        name = inc[_j];
        callback(name, error, warning);
      }
      return callback();
    };
    if (global.setTimeout != null) {
      return waitingForFinishTimeout = setTimeout(timeout, duration);
    } else {
      error = void 0;
      warning = "Platform missing setTimeout";
      return timeout();
    }
  }
};

exports.createCallback = function(options, html) {
  var beep, blue, endColor, endLine, fails, green, log, plain, red, start, tests, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
  if (html == null) {
    html = global.window != null;
  }
  if (options == null) {
    options = html ? {
      red: '<span style="color:red;white-space:pre">',
      green: '<span style="color:green;white-space:pre">',
      blue: '<span style="color:blue;white-space:pre">',
      plain: '<span>',
      endColor: '</span>',
      log: function(x) {
        return document.writeln(x);
      },
      beep: '',
      endLine: '<br>'
    } : {};
  }
  red = (_ref = options.red) != null ? _ref : '\u001b[31m';
  green = (_ref1 = options.green) != null ? _ref1 : '\u001b[32m';
  blue = (_ref2 = options.blue) != null ? _ref2 : '\u001b[36m';
  endColor = (_ref3 = options.endColor) != null ? _ref3 : '\u001b[0m';
  plain = (_ref4 = options.plain) != null ? _ref4 : '';
  beep = (_ref5 = options.beep) != null ? _ref5 : '\u0007';
  log = (_ref6 = options.log) != null ? _ref6 : function(x) {
    return console.log(x);
  };
  endLine = (_ref7 = options.endLine) != null ? _ref7 : '';
  tests = 0;
  fails = 0;
  start = null;
  return function(name, error, result) {
    var color, finish, passed, time, title, _ref10, _ref8, _ref9;
    if (start == null) {
      start = new Date().getTime();
    }
    if (name != null) {
      tests++;
      if (error != null) {
        fails++;
      }
      color = error != null ? red : result != null ? blue : plain;
      return log(color + name + ": " + ((_ref8 = (_ref9 = (_ref10 = error != null ? error.stack : void 0) != null ? _ref10 : error) != null ? _ref9 : result) != null ? _ref8 : "") + endColor + endLine);
    } else {
      finish = new Date().getTime();
      time = finish - start;
      passed = tests - fails;
      log(endLine);
      color = passed === tests ? green : red + beep;
      log(color + (title = "" + passed + "/" + tests + " Passed (" + time + " ms).") + endColor + endLine);
      if (global.document) {
        document.title = title;
      }
      return log(endLine);
    }
  };
};

exports.test = function() {
  var assert, tests;
  assert = {
    equal: function(a, b) {
      if (!a == b) {
        throw new Error("" + a + " != " + b);
      }
    }
  };
  tests = {
    alpha: function() {
      throw "Failure";
    },
    beta: function() {},
    charlie: function() {
      return "Return value";
    }
  };
  runTest('fail', (function() {
    throw 'Failure';
  }), function(name, error, result) {
    assert.equal(name, 'fail');
    assert.equal(error, 'Failure');
    return assert.equal(result, null);
  });
  runTest('pass', (function() {}), function(name, error, result) {
    assert.equal(name, 'pass');
    assert.equal(error, null);
    return assert.equal(result, null);
  });
  runTest('warn', (function() {
    return 'warning';
  }), function(name, error, result) {
    assert.equal(name, 'warn');
    assert.equal(error, null);
    return assert.equal(result, 'warning');
  });
};

if (require.main === module) {
  np = require('path');
  args = process.argv.slice(2).map(function(x) {
    return x.replace(/\\/g, '\/');
  });
  if (args.length < 1) {
    console.log("Usage: tester manifestFile");
    return;
  }
  manifestFile = args[0];
  utility = require('../builder/utility');
  manifest = JSON.parse(utility.read(manifestFile));
  modules = {};
  _ref = manifest.files;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    file = _ref[_i];
    moduleId = np.join(process.cwd(), np.dirname(manifestFile), file);
    modules[file] = moduleId;
  }
  console.log("------------------------------------------------------");
  runTests(modules);
}

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('browser/tester',_browser_tester_);
    else
      _browser_tester_.call(this, module, exports, require);
  }
  else {
    _browser_tester_.call(this);
  }
}).call(this)
void (function(){var _builder_Directory_ = function(module,exports,require){'use strict';
const fs = require('fs'), np = require('path'), utility = require('./utility'), watcher = require('./watcher'), File = require('./File'), ion = require('../');
const Directory = ion.defineClass({
        id: 'Directory',
        constructor: function Directory(path) {
            if (path != null) {
                this.path = String(path);
            }
        },
        properties: {
            exists: {
                get: function () {
                    return fs.existsSync(this.path);
                }
            },
            path: '.',
            toString: function () {
                return this.path;
            },
            get: function (path) {
                if (this.hasOwnProperty(path) || this[path] != null) {
                    return this[path];
                }
                path = this.getAbsoluteName(path);
                if (fs.existsSync(path)) {
                    return utility.read(path);
                } else {
                    return void 0;
                }
            },
            set: function (path, content) {
                if (this.hasOwnProperty(path) || this[path] != null) {
                    return this[path] = content;
                }
                path = this.getAbsoluteName(path);
                if (content != null) {
                    console.log('Writing: ' + path);
                } else {
                    console.log('Deleting: ' + path);
                }
                utility.write(path, content);
                return content;
            },
            getFile: function (path) {
                return new File(this.getAbsoluteName(path));
            },
            getDirectory: function (path) {
                return new Directory(this.getAbsoluteName(path));
            },
            getRelativeName: function (path) {
                return np.relative(this.path, String(path));
            },
            getAbsoluteName: function (path) {
                return np.join(this.path, String(path));
            },
            search: function (include, exclude) {
                let options = { initial: false };
                if (include != null) {
                    options.include = include;
                }
                if (exclude != null) {
                    options.exclude = exclude;
                }
                let results = {};
                ion.makeReactive(results, function () {
                    let unwatch = watcher.watchDirectory(this.path, options, function (filename) {
                            let path = this.getRelativeName(filename);
                            if (fs.existsSync(filename)) {
                                if (!(results[path] != null)) {
                                    results[path] = new File(filename);
                                }
                            } else {
                                delete results[path];
                            }
                        }.bind(this));
                    return unwatch;
                }.bind(this));
                let files = utility.list(this.path, options);
                for (let _i = 0; _i < files.length; _i++) {
                    let path = files[_i];
                    results[this.getRelativeName(path)] = new File(path);
                }
                return results;
            }
        }
    });
module.exports = exports = Directory;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/Directory',_builder_Directory_);
    else
      _builder_Directory_.call(this, module, exports, require);
  }
  else {
    _builder_Directory_.call(this);
  }
}).call(this)
void (function(){var _builder_File_ = function(module,exports,require){'use strict';
const fs = require('fs'), np = require('path'), utility = require('./utility'), ion = require('../');
const File = ion.defineClass({
        id: 'File',
        constructor: function File(path) {
            if ((path != null ? path.constructor : void 0) === File) {
                return path;
            }
            if (this.constructor !== File) {
                return new File(path);
            }
            if (typeof path !== 'string') {
                throw new Error('path string is required');
            }
            Object.defineProperties(this, {
                path: {
                    value: path,
                    enumerable: true,
                    writable: false
                }
            });
            this.modified = utility.getModified(path);
            ion.makeReactive(this, function () {
                let watcher;
                if (fs.existsSync(this.path)) {
                    watcher = fs.watch(this.path, function () {
                        this.modified = utility.getModified(this.path);
                    }.bind(this));
                }
                return function () {
                    return watcher != null ? watcher.close() : void 0;
                };
            }.bind(this));
        },
        properties: {
            directoryName: {
                get: function () {
                    return np.dirname(this.path);
                }
            },
            copyFrom: function (file) {
                file = File(file);
                this.write(file.read(null), null);
                console.log('Copied: ' + np.normalize(this.path));
            },
            read: function (encoding) {
                if (fs.existsSync(this.path)) {
                    return utility.read(this.path, encoding);
                } else {
                    return null;
                }
            },
            write: function (content, encoding) {
                return utility.write(this.path, content, encoding);
            },
            toString: function () {
                return this.path;
            },
            valueOf: function () {
                return this.path;
            }
        }
    });
module.exports = exports = File;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/File',_builder_File_);
    else
      _builder_File_.call(this, module, exports, require);
  }
  else {
    _builder_File_.call(this);
  }
}).call(this)
void (function(){var _builder_index_ = function(module,exports,require){var addBrowserShim, changeExtension, compileCoffeeScript, compileIon, compilePegjs, exports, fs, getModuleId, isPrivate, minify, normalizePath, np, removeExtension, shimJavascript, showPrettyError, syntaxErrorToString, utility, _;

if (global.window) {
  return;
}

_ = require('underscore');

utility = require('./utility');

fs = require('fs');

np = require('path');

process.on('uncaughtException', function(e) {
  var _ref;
  return console.error((_ref = e.stack) != null ? _ref : e);
});

module.exports = exports = {
  removeExtension: removeExtension = utility.removeExtension,
  changeExtension: changeExtension = utility.changeExtension,
  normalizePath: normalizePath = utility.normalizePath,
  minifyFromManifest: function(manifestFile, options) {
    var allName, files, minified, result, _ref, _ref1, _ref2, _ref3, _ref4;
    if (options == null) {
      options = {};
    }
    allName = "_browser.js";
    if (options.mangle == null) {
      options.mangle = (_ref = options.compress) != null ? _ref : false;
    }
    if (options.compress == null) {
      options.compress = (_ref1 = options.compress) != null ? _ref1 : false;
    }
    if (options.outSourceMap == null) {
      options.outSourceMap = allName + ".map";
    }
    files = (_ref2 = (_ref3 = JSON.parse((_ref4 = manifestFile.read()) != null ? _ref4 : "null")) != null ? _ref3.files : void 0) != null ? _ref2 : [];
    minified = minify(manifestFile.directoryName, files, options);
    result = {};
    result[allName] = "if (this.window == null) return;\n" + minified.code + "\n//# sourceMappingURL= " + options.outSourceMap;
    return result;
  },
  minify: minify = function(root, files, options) {
    var cwd, file;
    cwd = process.cwd();
    process.chdir(root);
    try {
      return {
        code: ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            _results.push(fs.readFileSync(file, 'utf8'));
          }
          return _results;
        })()).join('\n')
      };
    } finally {
      process.chdir(cwd);
    }
  },
  isPrivate: isPrivate = function(path) {
    var result;
    if (path == null) {
      return false;
    }
    path = normalizePath(path);
    result = path[0] === '_' || path.indexOf('/_') >= 0;
    return result;
  },
  link: function(object) {
    var existingPath, isDirectory, key, value, _results;
    _results = [];
    for (key in object) {
      value = object[key];
      if (!fs.existsSync(key)) {
        console.error("link source not found: " + key);
        continue;
      }
      isDirectory = utility.isDirectory(key);
      existingPath = np.relative(value, key);
      _results.push(console.log("link EXISTING: " + existing + "  LINK: " + value));
    }
    return _results;
  },
  runTests: (function() {
    var fn;
    fn = function(manifestFile) {
      return require('../browser/tester').spawnTests(manifestFile);
    };
    return _.debounce(_.throttle(fn, 100), 2000);
  })(),
  buildScriptIncludeFile: function(files, base) {
    if (base == null) {
      base = '';
    }
    return files.map(function(x) {
      return "document.writeln(\"<script type='text/javascript' src='" + base + (normalizePath(x)) + "'></script>\");";
    }).join('\n');
  },
  getModuleId: getModuleId = function(source, packageObject) {
    var path, root;
    if (typeof source === 'string') {
      root = source;
      path = packageObject;
      return normalizePath(removeExtension(np.join(root, path)));
    }
    if (packageObject != null) {
      return normalizePath(removeExtension(np.join(packageObject.name, np.relative(packageObject.directories.src, source.path))));
    } else {
      return null;
    }
  },
  showPrettyError: showPrettyError = function(e, filename, input) {
    var beep, message;
    message = e.message = syntaxErrorToString(e, filename, input);
    beep = '\x07';
    return console.error(message + beep);
  },
  syntaxErrorToString: syntaxErrorToString = function(e, filename, code) {
    var codeLine, colorize, end, first_column, first_line, last_column, last_line, marker, repeat, start, _ref, _ref1;
    if (e.location == null) {
      return e.toString();
    }
    repeat = function(str, n) {
      var res;
      res = '';
      while (n > 0) {
        if (n & 1) {
          res += str;
        }
        n >>>= 1;
        str += str;
      }
      return res;
    };
    _ref = e.location, first_line = _ref.first_line, first_column = _ref.first_column, last_line = _ref.last_line, last_column = _ref.last_column;
    if (last_line == null) {
      last_line = first_line;
    }
    if (last_column == null) {
      last_column = first_column;
    }
    codeLine = code.split('\n')[first_line];
    start = first_column;
    end = first_line === last_line ? last_column + 1 : codeLine.length;
    marker = repeat(' ', start) + repeat('^', end - start);
    colorize = function(str) {
      return "\x1B[1;31m" + str + "\x1B[0m";
    };
    codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
    marker = colorize(marker);
    return "" + filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + ((_ref1 = e.originalMessage) != null ? _ref1 : e.message) + "\n\n" + codeLine + "\n" + marker;
  },
  compileCoffeeScript: compileCoffeeScript = function(source, packageObject) {
    var compiled, cs, e, filename, input, moduleId, options;
    if (source.modified === 0) {
      return;
    }
    moduleId = typeof packageObject === 'string' ? packageObject : getModuleId(source, packageObject);
    input = source.read();
    filename = source.path;
    cs = require('coffee-script');
    try {
      console.log("Compile: " + filename);
      compiled = cs.compile(input, options = {
        bare: true
      });
      compiled = addBrowserShim(compiled, moduleId);
      return compiled;
    } catch (_error) {
      e = _error;
      showPrettyError(e, filename, input);
    }
  },
  compilePegjs: compilePegjs = function(source, packageObject) {
    var e, filename, input, moduleId, parser, peg;
    if (source.modified === 0) {
      return;
    }
    moduleId = typeof packageObject === 'string' ? packageObject : getModuleId(source, packageObject);
    filename = source.path;
    try {
      peg = require('pegjs');
      console.log("Building: " + filename);
      input = source.read();
      parser = peg.buildParser(input, {
        cache: true,
        output: "source"
      });
      source = "module.exports = " + parser;
      source = addBrowserShim(source, moduleId);
      return source;
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  },
  compileIon: compileIon = function(source, packageObject) {
    var e, filename, input, ionCompiler, moduleId;
    if (source.modified === 0) {
      return;
    }
    moduleId = typeof packageObject === 'string' ? packageObject : getModuleId(source, packageObject);
    filename = source.path;
    try {
      console.log("Compile: " + filename);
      ionCompiler = require('../compiler');
      input = source.read();
      source = ionCompiler.compile(input, {
        id: filename
      });
      source = addBrowserShim(source, moduleId);
      return source;
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  },
  shimJavascript: shimJavascript = function(source, packageObject) {
    var moduleId;
    if (source.modified === 0) {
      return;
    }
    moduleId = typeof packageObject === 'string' ? packageObject : getModuleId(source, packageObject);
    return addBrowserShim(source.read(), moduleId);
  },
  addBrowserShim: addBrowserShim = function(sourceText, moduleId) {
    var safeId;
    if (moduleId != null) {
      safeId = "_" + moduleId.replace(/[^a-zA-Z0-9]/g, '_') + "_";
      sourceText = "void (function(){var " + safeId + " = function(module,exports,require){" + sourceText + "\n  }\n  if (typeof require === 'function') {\n    if (require.register)\n      require.register('" + moduleId + "'," + safeId + ");\n    else\n      " + safeId + ".call(this, module, exports, require);\n  }\n  else {\n    " + safeId + ".call(this);\n  }\n}).call(this)";
    }
    return sourceText;
  }
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/index',_builder_index_);
    else
      _builder_index_.call(this, module, exports, require);
  }
  else {
    _builder_index_.call(this);
  }
}).call(this)
void (function(){var _builder_ModuleBuilder_ = function(module,exports,require){'use strict';
const ion = require('ion');
const File = require('./File'), Directory = require('./Directory'), builder = require('./'), compilers = [
        {
            extension: '.coffee',
            compile: builder.compileCoffeeScript
        },
        {
            extension: '.pegjs',
            compile: builder.compilePegjs
        },
        {
            extension: '.js',
            compile: builder.shimJavascript
        },
        {
            extension: '.ion',
            compile: builder.compileIon
        }
    ];
module.exports = exports = function _template(inputName, outputName, options) {
    if (this != null && this.constructor === _template) {
        return ion.createRuntime({
            type: 'Template',
            body: [
                {
                    type: 'VariableDeclaration',
                    declarations: [{
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'input'
                            },
                            init: {
                                type: 'NewExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'Directory'
                                },
                                arguments: [{
                                        type: 'Identifier',
                                        name: 'inputName'
                                    }]
                            }
                        }],
                    kind: 'let'
                },
                {
                    type: 'VariableDeclaration',
                    declarations: [{
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'output'
                            },
                            init: {
                                type: 'NewExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'Directory'
                                },
                                arguments: [{
                                        type: 'Identifier',
                                        name: 'outputName'
                                    }]
                            }
                        }],
                    kind: 'let'
                },
                {
                    type: 'VariableDeclaration',
                    declarations: [{
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'moduleName'
                            },
                            init: {
                                type: 'ConditionalExpression',
                                test: {
                                    type: 'BinaryExpression',
                                    operator: '!=',
                                    left: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'options'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'name'
                                        },
                                        existential: true
                                    },
                                    right: {
                                        type: 'Literal',
                                        value: null
                                    }
                                },
                                consequent: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: {
                                        type: 'Identifier',
                                        name: 'options'
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'name'
                                    },
                                    existential: true
                                },
                                alternate: {
                                    type: 'Literal',
                                    value: ''
                                }
                            }
                        }],
                    kind: 'let'
                },
                {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: 'output'
                    },
                    value: {
                        type: 'ObjectExpression',
                        objectType: null,
                        properties: [
                            {
                                type: 'ForOfStatement',
                                left: {
                                    type: 'VariableDeclaration',
                                    declarations: [{
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: '_ref6'
                                            },
                                            init: null
                                        }],
                                    kind: 'let'
                                },
                                right: {
                                    type: 'Identifier',
                                    name: 'compilers'
                                },
                                body: {
                                    type: 'BlockStatement',
                                    body: [
                                        {
                                            type: 'VariableDeclaration',
                                            declarations: [{
                                                    type: 'VariableDeclarator',
                                                    id: {
                                                        type: 'Identifier',
                                                        name: '_ref9'
                                                    },
                                                    init: {
                                                        type: 'Identifier',
                                                        name: '_ref6'
                                                    }
                                                }]
                                        },
                                        {
                                            type: 'VariableDeclaration',
                                            declarations: [{
                                                    type: 'VariableDeclarator',
                                                    id: {
                                                        type: 'Identifier',
                                                        name: 'extension'
                                                    },
                                                    init: {
                                                        type: 'MemberExpression',
                                                        object: {
                                                            type: 'Identifier',
                                                            name: '_ref9'
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'extension'
                                                        },
                                                        computed: false
                                                    }
                                                }],
                                            kind: 'let'
                                        },
                                        {
                                            type: 'VariableDeclaration',
                                            declarations: [{
                                                    type: 'VariableDeclarator',
                                                    id: {
                                                        type: 'Identifier',
                                                        name: 'compile'
                                                    },
                                                    init: {
                                                        type: 'MemberExpression',
                                                        object: {
                                                            type: 'Identifier',
                                                            name: '_ref9'
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'compile'
                                                        },
                                                        computed: false
                                                    }
                                                }],
                                            kind: 'let'
                                        },
                                        {
                                            type: 'ForInStatement',
                                            left: {
                                                type: 'VariableDeclaration',
                                                declarations: [
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'path'
                                                        },
                                                        init: null
                                                    },
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'source'
                                                        },
                                                        init: null
                                                    }
                                                ],
                                                kind: 'let'
                                            },
                                            right: {
                                                type: 'CallExpression',
                                                callee: {
                                                    type: 'MemberExpression',
                                                    computed: false,
                                                    object: {
                                                        type: 'Identifier',
                                                        name: 'input'
                                                    },
                                                    property: {
                                                        type: 'Identifier',
                                                        name: 'search'
                                                    }
                                                },
                                                arguments: [{
                                                        type: 'Identifier',
                                                        name: 'extension'
                                                    }]
                                            },
                                            body: {
                                                type: 'BlockStatement',
                                                body: [
                                                    {
                                                        type: 'VariableDeclaration',
                                                        declarations: [{
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'targetPath'
                                                                },
                                                                init: {
                                                                    type: 'CallExpression',
                                                                    callee: {
                                                                        type: 'MemberExpression',
                                                                        computed: false,
                                                                        object: {
                                                                            type: 'Identifier',
                                                                            name: 'builder'
                                                                        },
                                                                        property: {
                                                                            type: 'Identifier',
                                                                            name: 'changeExtension'
                                                                        }
                                                                    },
                                                                    arguments: [
                                                                        {
                                                                            type: 'Identifier',
                                                                            name: 'path'
                                                                        },
                                                                        {
                                                                            type: 'Literal',
                                                                            value: '.js'
                                                                        }
                                                                    ]
                                                                }
                                                            }],
                                                        kind: 'let'
                                                    },
                                                    {
                                                        type: 'VariableDeclaration',
                                                        declarations: [{
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'moduleId'
                                                                },
                                                                init: {
                                                                    type: 'CallExpression',
                                                                    callee: {
                                                                        type: 'MemberExpression',
                                                                        computed: false,
                                                                        object: {
                                                                            type: 'Identifier',
                                                                            name: 'builder'
                                                                        },
                                                                        property: {
                                                                            type: 'Identifier',
                                                                            name: 'getModuleId'
                                                                        }
                                                                    },
                                                                    arguments: [
                                                                        {
                                                                            type: 'Identifier',
                                                                            name: 'moduleName'
                                                                        },
                                                                        {
                                                                            type: 'Identifier',
                                                                            name: 'path'
                                                                        }
                                                                    ]
                                                                }
                                                            }],
                                                        kind: 'let'
                                                    },
                                                    {
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'targetPath'
                                                        },
                                                        value: {
                                                            type: 'CallExpression',
                                                            callee: {
                                                                type: 'Identifier',
                                                                name: 'compile'
                                                            },
                                                            arguments: [
                                                                {
                                                                    type: 'Identifier',
                                                                    name: 'source'
                                                                },
                                                                {
                                                                    type: 'Identifier',
                                                                    name: 'moduleId'
                                                                }
                                                            ]
                                                        },
                                                        kind: 'init',
                                                        computed: true
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'outputFiles'
                                        },
                                        init: {
                                            type: 'CallExpression',
                                            callee: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'output'
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'search'
                                                }
                                            },
                                            arguments: [
                                                {
                                                    type: 'Literal',
                                                    value: '.js'
                                                },
                                                {
                                                    type: 'Literal',
                                                    value: /^_/
                                                }
                                            ]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'top'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            objectType: {
                                                type: 'ArrayExpression',
                                                elements: []
                                            },
                                            properties: [{
                                                    type: 'ForInStatement',
                                                    left: {
                                                        type: 'VariableDeclaration',
                                                        declarations: [{
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'key'
                                                                },
                                                                init: null
                                                            }],
                                                        kind: 'let'
                                                    },
                                                    right: {
                                                        type: 'Identifier',
                                                        name: 'outputFiles'
                                                    },
                                                    body: {
                                                        type: 'BlockStatement',
                                                        body: [{
                                                                type: 'IfStatement',
                                                                test: {
                                                                    type: 'CallExpression',
                                                                    callee: {
                                                                        type: 'MemberExpression',
                                                                        computed: false,
                                                                        object: {
                                                                            type: 'Identifier',
                                                                            name: 'key'
                                                                        },
                                                                        property: {
                                                                            type: 'Identifier',
                                                                            name: 'endsWith'
                                                                        }
                                                                    },
                                                                    arguments: [{
                                                                            type: 'Literal',
                                                                            value: 'require.js'
                                                                        }]
                                                                },
                                                                consequent: {
                                                                    type: 'BlockStatement',
                                                                    body: [{
                                                                            type: 'ExpressionStatement',
                                                                            expression: {
                                                                                type: 'Identifier',
                                                                                name: 'key'
                                                                            }
                                                                        }]
                                                                }
                                                            }]
                                                    }
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'sortedFiles'
                                        },
                                        init: {
                                            type: 'CallExpression',
                                            callee: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'top'
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'concat'
                                                }
                                            },
                                            arguments: [{
                                                    type: 'ObjectExpression',
                                                    objectType: {
                                                        type: 'ArrayExpression',
                                                        elements: []
                                                    },
                                                    properties: [{
                                                            type: 'ForInStatement',
                                                            left: {
                                                                type: 'VariableDeclaration',
                                                                declarations: [{
                                                                        type: 'VariableDeclarator',
                                                                        id: {
                                                                            type: 'Identifier',
                                                                            name: 'key'
                                                                        },
                                                                        init: null
                                                                    }],
                                                                kind: 'let'
                                                            },
                                                            right: {
                                                                type: 'Identifier',
                                                                name: 'outputFiles'
                                                            },
                                                            body: {
                                                                type: 'BlockStatement',
                                                                body: [{
                                                                        type: 'IfStatement',
                                                                        test: {
                                                                            type: 'BinaryExpression',
                                                                            operator: '&&',
                                                                            left: {
                                                                                type: 'UnaryExpression',
                                                                                operator: '!',
                                                                                argument: {
                                                                                    type: 'CallExpression',
                                                                                    callee: {
                                                                                        type: 'MemberExpression',
                                                                                        computed: false,
                                                                                        object: {
                                                                                            type: 'Identifier',
                                                                                            name: 'builder'
                                                                                        },
                                                                                        property: {
                                                                                            type: 'Identifier',
                                                                                            name: 'isPrivate'
                                                                                        }
                                                                                    },
                                                                                    arguments: [{
                                                                                            type: 'Identifier',
                                                                                            name: 'key'
                                                                                        }]
                                                                                }
                                                                            },
                                                                            right: {
                                                                                type: 'BinaryExpression',
                                                                                operator: '<',
                                                                                left: {
                                                                                    type: 'CallExpression',
                                                                                    callee: {
                                                                                        type: 'MemberExpression',
                                                                                        computed: false,
                                                                                        object: {
                                                                                            type: 'Identifier',
                                                                                            name: 'top'
                                                                                        },
                                                                                        property: {
                                                                                            type: 'Identifier',
                                                                                            name: 'indexOf'
                                                                                        }
                                                                                    },
                                                                                    arguments: [{
                                                                                            type: 'Identifier',
                                                                                            name: 'key'
                                                                                        }]
                                                                                },
                                                                                right: {
                                                                                    type: 'Literal',
                                                                                    value: 0
                                                                                }
                                                                            }
                                                                        },
                                                                        consequent: {
                                                                            type: 'BlockStatement',
                                                                            body: [{
                                                                                    type: 'ExpressionStatement',
                                                                                    expression: {
                                                                                        type: 'Identifier',
                                                                                        name: 'key'
                                                                                    }
                                                                                }]
                                                                        }
                                                                    }]
                                                            }
                                                        }]
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'manifestFileName'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 'manifest.json'
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'manifest'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            objectType: null,
                                            properties: [
                                                {
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'modified'
                                                    },
                                                    value: {
                                                        type: 'CallExpression',
                                                        callee: {
                                                            type: 'MemberExpression',
                                                            computed: false,
                                                            object: {
                                                                type: 'MemberExpression',
                                                                computed: false,
                                                                object: {
                                                                    type: 'Identifier',
                                                                    name: 'Math'
                                                                },
                                                                property: {
                                                                    type: 'Identifier',
                                                                    name: 'max'
                                                                }
                                                            },
                                                            property: {
                                                                type: 'Identifier',
                                                                name: 'apply'
                                                            }
                                                        },
                                                        arguments: [
                                                            {
                                                                type: 'Literal',
                                                                value: null
                                                            },
                                                            {
                                                                type: 'ObjectExpression',
                                                                objectType: {
                                                                    type: 'ArrayExpression',
                                                                    elements: []
                                                                },
                                                                properties: [{
                                                                        type: 'ForInStatement',
                                                                        left: {
                                                                            type: 'VariableDeclaration',
                                                                            declarations: [
                                                                                {
                                                                                    type: 'VariableDeclarator',
                                                                                    id: {
                                                                                        type: 'Identifier',
                                                                                        name: 'path'
                                                                                    },
                                                                                    init: null
                                                                                },
                                                                                {
                                                                                    type: 'VariableDeclarator',
                                                                                    id: {
                                                                                        type: 'Identifier',
                                                                                        name: 'file'
                                                                                    },
                                                                                    init: null
                                                                                }
                                                                            ],
                                                                            kind: 'let'
                                                                        },
                                                                        right: {
                                                                            type: 'Identifier',
                                                                            name: 'outputFiles'
                                                                        },
                                                                        body: {
                                                                            type: 'ExpressionStatement',
                                                                            expression: {
                                                                                type: 'MemberExpression',
                                                                                computed: false,
                                                                                object: {
                                                                                    type: 'Identifier',
                                                                                    name: 'file'
                                                                                },
                                                                                property: {
                                                                                    type: 'Identifier',
                                                                                    name: 'modified'
                                                                                }
                                                                            }
                                                                        }
                                                                    }]
                                                            }
                                                        ]
                                                    },
                                                    kind: 'init'
                                                },
                                                {
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'files'
                                                    },
                                                    value: {
                                                        type: 'ObjectExpression',
                                                        objectType: {
                                                            type: 'ArrayExpression',
                                                            elements: []
                                                        },
                                                        properties: [{
                                                                type: 'ForOfStatement',
                                                                left: {
                                                                    type: 'VariableDeclaration',
                                                                    declarations: [{
                                                                            type: 'VariableDeclarator',
                                                                            id: {
                                                                                type: 'Identifier',
                                                                                name: 'path'
                                                                            },
                                                                            init: null
                                                                        }],
                                                                    kind: 'let'
                                                                },
                                                                right: {
                                                                    type: 'Identifier',
                                                                    name: 'sortedFiles'
                                                                },
                                                                body: {
                                                                    type: 'ExpressionStatement',
                                                                    expression: {
                                                                        type: 'CallExpression',
                                                                        callee: {
                                                                            type: 'MemberExpression',
                                                                            computed: false,
                                                                            object: {
                                                                                type: 'Identifier',
                                                                                name: 'builder'
                                                                            },
                                                                            property: {
                                                                                type: 'Identifier',
                                                                                name: 'normalizePath'
                                                                            }
                                                                        },
                                                                        arguments: [{
                                                                                type: 'Identifier',
                                                                                name: 'path'
                                                                            }]
                                                                    }
                                                                }
                                                            }]
                                                    },
                                                    kind: 'init'
                                                }
                                            ]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'manifestFileName'
                                },
                                value: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'JSON'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'stringify'
                                        }
                                    },
                                    arguments: [
                                        {
                                            type: 'Identifier',
                                            name: 'manifest'
                                        },
                                        {
                                            type: 'Literal',
                                            value: null
                                        },
                                        {
                                            type: 'Literal',
                                            value: '  '
                                        }
                                    ]
                                },
                                kind: 'init',
                                computed: true
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'manifestFile'
                                        },
                                        init: {
                                            type: 'CallExpression',
                                            callee: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'output'
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'getFile'
                                                }
                                            },
                                            arguments: [{
                                                    type: 'Identifier',
                                                    name: 'manifestFileName'
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'minifiedFiles'
                                        },
                                        init: {
                                            type: 'CallExpression',
                                            callee: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'builder'
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'minifyFromManifest'
                                                }
                                            },
                                            arguments: [
                                                {
                                                    type: 'Identifier',
                                                    name: 'manifestFile'
                                                },
                                                {
                                                    type: 'ObjectExpression',
                                                    properties: []
                                                }
                                            ]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ForInStatement',
                                left: {
                                    type: 'VariableDeclaration',
                                    declarations: [
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'path'
                                            },
                                            init: null
                                        },
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'content'
                                            },
                                            init: null
                                        }
                                    ],
                                    kind: 'let'
                                },
                                right: {
                                    type: 'Identifier',
                                    name: 'minifiedFiles'
                                },
                                body: {
                                    type: 'BlockStatement',
                                    body: [{
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'path'
                                            },
                                            value: {
                                                type: 'Identifier',
                                                name: 'content'
                                            },
                                            kind: 'init',
                                            computed: true
                                        }]
                                }
                            },
                            {
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'builder'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'runTests'
                                        }
                                    },
                                    arguments: [
                                        {
                                            type: 'Identifier',
                                            name: 'manifestFile'
                                        },
                                        {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: {
                                                type: 'Identifier',
                                                name: 'manifestFile'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'modified'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    kind: 'init'
                }
            ]
        }, {
            require: require,
            module: module,
            exports: exports,
            inputName: inputName,
            outputName: outputName,
            options: options,
            File: File,
            Directory: Directory,
            builder: builder,
            compilers: compilers
        });
    }
    let input = new Directory(inputName);
    let output = new Directory(outputName);
    let moduleName = (options != null ? options.name : void 0) != null ? options.name : '';
    let _ref = [];
    for (let key in outputFiles) {
        if (key.endsWith('require.js')) {
            _ref.push(key);
        }
    }
    let _ref2 = [];
    for (let key in outputFiles) {
        if (!builder.isPrivate(key) && top.indexOf(key) < 0) {
            _ref2.push(key);
        }
    }
    let _ref3 = [];
    for (let path in outputFiles) {
        let file = outputFiles[path];
        _ref3.push(file.modified);
    }
    let _ref4 = [];
    for (let _i = 0; _i < sortedFiles.length; _i++) {
        let path = sortedFiles[_i];
        _ref4.push(builder.normalizePath(path));
    }
    let _ref7 = {};
    {
        for (let _i2 = 0; _i2 < compilers.length; _i2++) {
            let _ref8 = compilers[_i2];
            let extension = _ref8.extension;
            let compile = _ref8.compile;
            {
                let _ref5 = input.search(extension);
                for (let path in _ref5) {
                    let source = _ref5[path];
                    let targetPath = builder.changeExtension(path, '.js');
                    let moduleId = builder.getModuleId(moduleName, path);
                    _ref7[targetPath] = compile(source, moduleId);
                }
            }
        }
        let outputFiles = output.search('.js', /^_/);
        let top = _ref;
        let sortedFiles = top.concat(_ref2);
        let manifestFileName = 'manifest.json';
        let manifest = {
                modified: Math.max.apply(null, _ref3),
                files: _ref4
            };
        _ref7[manifestFileName] = JSON.stringify(manifest, null, '  ');
        let manifestFile = output.getFile(manifestFileName);
        let minifiedFiles = builder.minifyFromManifest(manifestFile, {});
        for (let path in minifiedFiles) {
            let content = minifiedFiles[path];
            _ref7[path] = content;
        }
        ion.add(_ref7, builder.runTests(manifestFile, manifestFile.modified));
    }
    ion.patch(output, _ref7);
};
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/ModuleBuilder',_builder_ModuleBuilder_);
    else
      _builder_ModuleBuilder_.call(this, module, exports, require);
  }
  else {
    _builder_ModuleBuilder_.call(this);
  }
}).call(this)
void (function(){var _builder_utility_ = function(module,exports,require){var buildCoffee, changeExtension, copy, copyMetadata, cp, exec, exports, fixCommand, fs, getModified, isDirectory, isFile, isMatch, isWindows, list, makeDirectories, makeParentDirectories, normalizePath, np, read, removeExtension, spawn, touch, watchCoffee, write;

if (global.window) {
  return;
}

fs = require('fs');

np = require('path');

cp = require('child_process');

isWindows = process.platform === 'win32';

fixCommand = function(command) {
  if (!isWindows) {
    command = command.replace(/\.cmd\b/, "");
  }
  return command;
};

module.exports = exports = {
  spawn: spawn = function(command, options, callback) {
    var args, child, e, originalCommand;
    originalCommand = command;
    if (command == null) {
      return typeof callback === "function" ? callback() : void 0;
    }
    command = fixCommand(command);
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    if (options == null) {
      options = {};
    }
    if (options.stdio == null) {
      options.stdio = 'inherit';
    }
    args = command.split(/\s+/);
    command = args.shift();
    try {
      child = cp.spawn(command, args, options);
      if (callback != null) {
        child.on('exit', callback);
      }
      child.on('error', function(error) {
        console.log("Error running " + originalCommand + "\n" + error);
        return typeof callback === "function" ? callback() : void 0;
      });
    } catch (_error) {
      e = _error;
      console.log(originalCommand);
      throw e;
    }
    return child;
  },
  exec: exec = function(command, options, callback) {
    var e, originalCommand;
    originalCommand = command;
    if (command == null) {
      return typeof callback === "function" ? callback() : void 0;
    }
    command = fixCommand(command);
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    if (options == null) {
      options = {};
    }
    try {
      return cp.exec(command, options, function(err, stdout, stderr) {
        if (err != null) {
          console.log(err);
        }
        if (stdout != null) {
          console.log(stdout.toString());
        }
        if (stderr != null) {
          console.log(stderr.toString());
        }
        return typeof callback === "function" ? callback() : void 0;
      });
    } catch (_error) {
      e = _error;
      console.log(originalCommand);
      throw e;
    }
  },
  copyMetadata: copyMetadata = function(source, target) {
    var file, from, to, _i, _len, _ref, _results;
    _ref = ["package.json", "README.md"];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      from = np.join(source, file);
      to = np.join(target, file);
      if (fs.existsSync(from)) {
        _results.push(copy(from, to));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  buildCoffee: buildCoffee = function(input, output, callback) {
    return spawn("coffee.cmd -c -o " + output + " " + input, callback);
  },
  watchCoffee: watchCoffee = function(input, output) {
    return spawn("coffee.cmd -w -c -o " + output + " " + input);
  },
  isMatch: isMatch = function(value, match, defaultValue) {
    var item, _i, _len;
    if (defaultValue == null) {
      defaultValue = false;
    }
    if (match == null) {
      return defaultValue;
    }
    if ('function' === typeof match) {
      return match(value);
    }
    if (Array.isArray(match)) {
      for (_i = 0, _len = match.length; _i < _len; _i++) {
        item = match[_i];
        if (isMatch(value, item)) {
          return true;
        }
      }
      return false;
    }
    value = normalizePath(value);
    if (typeof match === 'string') {
      return value.substring(value.length - match.length) === match;
    }
    value = value.split(/[\/\\]/g).pop();
    return match.test(value);
  },
  defaultFileExclude: ["node_modules", "www"],
  removeExtension: removeExtension = function(file) {
    var dot;
    dot = file.lastIndexOf('.');
    if (dot > 0) {
      return file.substring(0, dot);
    } else {
      return file;
    }
  },
  changeExtension: changeExtension = function(file, ext) {
    return removeExtension(file) + ext;
  },
  touch: touch = function(file) {
    var now;
    now = new Date();
    return fs.utimesSync(file, now, now);
  },
  getModified: getModified = function(path) {
    var e, stats, _ref, _ref1;
    try {
      if (fs.existsSync(path)) {
        stats = fs.statSync(path);
        return (_ref = (_ref1 = stats.mtime) != null ? _ref1.getTime() : void 0) != null ? _ref : 0;
      }
    } catch (_error) {
      e = _error;
      console.warn(e);
    }
    return 0;
  },
  isFile: isFile = function(file) {
    var _ref;
    return ((_ref = fs.statSync(file)) != null ? typeof _ref.isFile === "function" ? _ref.isFile() : void 0 : void 0) === true;
  },
  isDirectory: isDirectory = function(file) {
    var _ref;
    return ((_ref = fs.statSync(file)) != null ? typeof _ref.isDirectory === "function" ? _ref.isDirectory() : void 0 : void 0) === true;
  },
  list: list = function(dir, options, files) {
    var exclude, file, recursive, _i, _len, _ref, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    if (files == null) {
      files = [];
    }
    exclude = (_ref = options.exclude) != null ? _ref : exports.defaultFileExclude;
    recursive = (_ref1 = options.recursive) != null ? _ref1 : true;
    if (fs.existsSync(dir)) {
      _ref2 = fs.readdirSync(dir);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        file = _ref2[_i];
        file = np.join(dir, file);
        if (!isMatch(file, exclude, false)) {
          if (isFile(file)) {
            if (isMatch(file, options.include, true)) {
              files.push(file);
            }
          } else if (recursive) {
            list(file, options, files);
          }
        }
      }
    }
    return files;
  },
  makeDirectories: makeDirectories = function(dir) {
    if (typeof dir !== 'string') {
      throw new Error("dir is not a string: " + (JSON.stringify(dir)));
    }
    if (!fs.existsSync(dir)) {
      makeDirectories(np.dirname(dir));
      return fs.mkdirSync(dir);
    }
  },
  makeParentDirectories: makeParentDirectories = function(file) {
    return makeDirectories(np.dirname(file));
  },
  read: read = function(file, encoding) {
    if (encoding === void 0) {
      encoding = 'utf8';
    }
    return fs.readFileSync(file, encoding);
  },
  write: write = function(file, content, encoding) {
    makeParentDirectories(file);
    if (content != null) {
      if (encoding === void 0 && typeof content === 'string') {
        encoding = 'utf8';
      }
      return fs.writeFileSync(file, content, encoding);
    } else {
      return fs.unlinkSync(file);
    }
  },
  copy: copy = function(source, target, include) {
    var content, file, files, _i, _len, _results;
    target = np.normalize(target);
    if (isFile(source)) {
      if (isMatch(source, include, true)) {
        content = read(source);
        write(target, content);
        return console.log("Copied: " + (np.normalize(target)));
      }
    } else if (isDirectory(source)) {
      files = fs.readdirSync(source);
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _results.push(copy(np.join(source, file), np.join(target, file), include));
      }
      return _results;
    }
  },
  normalizePath: normalizePath = function(path) {
    return path != null ? path.replace(/\\/g, "\/") : void 0;
  },
  watchCopy: function(input, output, include) {
    var watcher;
    watcher = require('./watcher');
    return watcher.watchDirectory(input, {
      include: include
    }, function(inputFile) {
      var outputFile;
      outputFile = np.join(output, np.relative(input, inputFile));
      return copy(inputFile, outputFile);
    });
  },
  getMatches: function(s, regex, group) {
    var match, results;
    if (!regex.global) {
      throw 'regex must be declared with global modifier /trailing/g';
    }
    results = [];
    while (match = regex.exec(s)) {
      results.push(group > 0 ? match[group] : match);
    }
    return results;
  }
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/utility',_builder_utility_);
    else
      _builder_utility_.call(this, module, exports, require);
  }
  else {
    _builder_utility_.call(this);
  }
}).call(this)
void (function(){var _builder_watcher_ = function(module,exports,require){var fs, np, util;

if (global.window) {
  return;
}

fs = require('fs');

np = require('path');

util = require('./utility');

exports.watchDirectory = function(dirname, options, listener) {
  var filter, fsListener, initial, notifyListener, unwatchFile, watchFile, watchedFiles;
  if (listener == null) {
    listener = options;
    options = {};
  }
  if (options.persistent == null) {
    options.persistent = true;
  }
  if (options.interval == null) {
    options.interval = 100;
  }
  if (options.recursive == null) {
    options.recursive = true;
  }
  if (options.initial == null) {
    options.initial = 'initial';
  }
  if (options.exclude == null) {
    options.exclude = util.defaultFileExclude;
  }
  filter = function(name) {
    if (util.isMatch(name, options.exclude, false)) {
      return false;
    } else {
      return util.isMatch(name, options.include, true);
    }
  };
  watchedFiles = {};
  notifyListener = function(filename, curr, prev, change, async) {
    if (async == null) {
      async = false;
    }
    if (filter(filename)) {
      if (async) {
        return process.nextTick(function() {
          return listener(filename, curr, prev, change);
        });
      } else {
        return listener(filename, curr, prev, change);
      }
    }
  };
  fsListener = function(filename, depth, curr, prev) {
    var change;
    change = curr.nlink === 0 ? 'deleted' : prev.nlink === 0 ? 'created' : 'modified';
    notifyListener(filename, curr, prev, change);
    if (change !== 'deleted') {
      return watchFile(filename, depth, curr);
    } else {
      return unwatchFile(filename);
    }
  };
  unwatchFile = function(filename) {
    fs.unwatchFile(filename, watchedFiles[filename]);
    return delete watchedFiles[filename];
  };
  watchFile = function(filename, depth, stats) {
    var boundListener, child, _i, _len, _ref;
    if (depth == null) {
      depth = 0;
    }
    if (fs.existsSync(filename)) {
      if (stats == null) {
        stats = fs.statSync(filename);
      }
      if (stats.nlink > 0) {
        if (stats.isDirectory()) {
          if (!util.isMatch(filename, options.exclude, false)) {
            if (depth === 0 || options.recursive) {
              _ref = fs.readdirSync(filename);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                child = np.join(filename, child);
                watchFile(child, depth + 1);
              }
            }
          }
        }
        if (watchedFiles[filename] == null) {
          boundListener = fsListener.bind(this, filename, depth);
          watchedFiles[filename] = boundListener;
          fs.watchFile(filename, options, boundListener);
          if (initial) {
            notifyListener(filename, stats, stats, initial, true);
          }
        }
      }
    }
  };
  initial = options.initial;
  watchFile(dirname);
  initial = 'created';
  return function() {
    var key, _results;
    _results = [];
    for (key in watchedFiles) {
      _results.push(unwatchFile(key));
    }
    return _results;
  };
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('builder/watcher',_builder_watcher_);
    else
      _builder_watcher_.call(this, module, exports, require);
  }
  else {
    _builder_watcher_.call(this);
  }
}).call(this)
void (function(){var _compiler_astFunctions_ = function(module,exports,require){'use strict';
const addStatement = exports.addStatement = function (node, statement, index, offset) {
        let body = node.body;
        if (body.type === 'BlockStatement') {
            body = body.body;
        } else if (!Array.isArray(body)) {
            node.body = {
                type: 'BlockStatement',
                body: body = [node.body]
            };
        }
        if (!(index != null)) {
            index = 0;
        } else if (index.type != null) {
            index = body.indexOf(index) + (offset != null ? offset : 1);
        }
        index = Math.max(0, Math.min(index, body.length));
        body.splice(index, 0, statement);
    }, forEachDestructuringAssignment = exports.forEachDestructuringAssignment = function (pattern, expression, callback) {
        if (pattern.type === 'Identifier') {
            callback(pattern, expression);
        } else if (pattern.properties != null) {
            {
                let _ref = pattern.properties;
                for (let _i = 0; _i < _ref.length; _i++) {
                    let _ref3 = _ref[_i];
                    let key = _ref3.key;
                    let value = _ref3.value;
                    forEachDestructuringAssignment(value, {
                        type: 'MemberExpression',
                        object: expression,
                        property: key,
                        computed: key.type !== 'Identifier'
                    }, callback);
                }
            }
        } else if (pattern.elements != null) {
            {
                let _ref2 = pattern.elements;
                for (let _i2 = 0; _i2 < _ref2.length; _i2++) {
                    let index = _i2;
                    let value = _ref2[_i2];
                    forEachDestructuringAssignment(value, {
                        type: 'MemberExpression',
                        object: expression,
                        property: {
                            type: 'Literal',
                            value: index
                        },
                        computed: true
                    }, callback);
                }
            }
        }
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/astFunctions',_compiler_astFunctions_);
    else
      _compiler_astFunctions_.call(this, module, exports, require);
  }
  else {
    _compiler_astFunctions_.call(this);
  }
}).call(this)
void (function(){var _compiler_common_ = function(module,exports,require){'use strict';
const lineDelimiter = '\n', isEmpty = function (s) {
        return !(s != null) || s.length === 0 || (s.trim != null ? s.trim().length : void 0) === 0;
    };
const indentToken = exports.indentToken = '{{{{', outdentToken = exports.outdentToken = '}}}}', splitLines = exports.splitLines = function (s) {
        return s.split(lineDelimiter);
    }, joinLines = exports.joinLines = function (array) {
        return array.join(lineDelimiter);
    }, getIndent = exports.getIndent = function (s, regex) {
        regex = regex != null ? regex : /^([ ]*)/;
        return (regex.exec(s) != null ? regex.exec(s)[1].length : void 0) != null ? regex.exec(s)[1].length : Number.MAX_VALUE;
    }, unindentString = exports.unindentString = function (s, sourceMapping) {
        let lines = splitLines(s.trimRight());
        let minIndent = unindentLines(lines);
        if (sourceMapping != null) {
            sourceMapping.columnOffset = minIndent;
        }
        return joinLines(lines);
    }, getMinIndent = exports.getMinIndent = function (lines, regex) {
        let minIndent = Number.MAX_VALUE;
        for (let _i = 0; _i < lines.length; _i++) {
            let line = lines[_i];
            if (typeof line === 'string' && !isEmpty(line)) {
                minIndent = Math.min(minIndent, getIndent(line, regex));
            }
        }
        return minIndent;
    }, unindentLines = exports.unindentLines = function (lines) {
        let minIndent = getMinIndent(lines);
        for (let _i2 = 0; _i2 < lines.length; _i2++) {
            let i = _i2;
            let line = lines[_i2];
            if (typeof line === 'string') {
                lines[i] = isEmpty(line) ? '' : line.substring(minIndent);
            }
        }
        return minIndent;
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/common',_compiler_common_);
    else
      _compiler_common_.call(this, module, exports, require);
  }
  else {
    _compiler_common_.call(this);
  }
}).call(this)
void (function(){var _compiler_index_ = function(module,exports,require){'use strict';
const makePrettyError = function (e, source, id) {
    if (typeof e.line === 'number' && typeof e.column === 'number' && e.line > 0 && e.column > 0) {
        let line = source.split('\n')[e.line - 1];
        let caret = '^';
        for (let i = 1; i < e.column; i++) {
            caret = ' ' + caret;
        }
        let newMessage = '' + (id != null ? id : '(anonymous)') + ':' + e.line + ':' + e.column + ': ' + e.message + '\n' + line + '\n' + caret;
        e.originalMessage = e.message;
        e.message = newMessage;
        e.stack = newMessage;
    }
};
const parse = exports.parse = function (content, options) {
        if (options == null)
            options = {};
        options.generate = false;
        return compile(content, options);
    }, compile = exports.compile = function (content, options) {
        if (options == null)
            options = {};
        options.loc = options.loc != null ? options.loc : true;
        const preprocessor = require('./preprocessor'), parser = require('./parser'), postprocessor = require('./postprocessor'), escodegen = require('escodegen');
        let sourceMapping = {}, result = preprocessor.preprocess(content, sourceMapping), preprocessed = result, sourceLocationsFixed = false;
        try {
            result = parser.parse(result, options != null ? options : {});
            if (options.loc) {
                result.loc.source = content;
            }
            result = preprocessor.fixSourceLocations(result, sourceMapping);
            sourceLocationsFixed = true;
            if (options.postprocess !== false) {
                result = postprocessor.postprocess(result, options);
                if ((options != null ? options.generate : void 0) !== false) {
                    result = escodegen.generate(result);
                }
            }
        } catch (e) {
            if (!sourceLocationsFixed) {
                preprocessor.fixSourceLocation(e, sourceMapping);
            }
            makePrettyError(e, content, options.id);
            throw e;
        }
        return result;
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/index',_compiler_index_);
    else
      _compiler_index_.call(this, module, exports, require);
  }
  else {
    _compiler_index_.call(this);
  }
}).call(this)
void (function(){var _compiler_nodes_ = function(module,exports,require){'use strict';
const BlockStatement = exports.BlockStatement = {
        isBlock: true,
        newScope: true
    }, Program = exports.Program = {
        isBlock: true,
        newScope: true,
        reactive: false
    }, FunctionExpression = exports.FunctionExpression = {
        isFunction: true,
        paramKind: 'let',
        newScope: true,
        shadow: true,
        reactive: false
    }, FunctionDeclaration = exports.FunctionDeclaration = FunctionExpression, Template = exports.Template = {
        isFunction: true,
        paramKind: 'const',
        newScope: true,
        shadow: true,
        reactive: true
    }, ForStatement = exports.ForStatement = {
        newScope: true,
        allowedInReactive: false
    }, ForInStatement = exports.ForInStatement = { newScope: true }, ForOfStatement = exports.ForOfStatement = { newScope: true }, ExportStatement = exports.ExportStatement = { allowedInReactive: false }, ClassExpression = exports.ClassExpression = { allowedInReactive: false }, ThrowStatement = exports.ThrowStatement = { allowedInReactive: false }, TryStatement = exports.TryStatement = { allowedInReactive: false };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/nodes',_compiler_nodes_);
    else
      _compiler_nodes_.call(this, module, exports, require);
  }
  else {
    _compiler_nodes_.call(this);
  }
}).call(this)
void (function(){var _compiler_parser_ = function(module,exports,require){module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { Program: peg$parseProgram },
        peg$startRuleFunction  = peg$parseProgram,

        peg$c0 = peg$FAILED,
        peg$c1 = [],
        peg$c2 = function(start, body, end) { return node("Program", {body:body}, start, end) },
        peg$c3 = null,
        peg$c4 = function(a) { return a },
        peg$c5 = function(start, value, end) { return node('ExportStatement', {value:value}, start, end) },
        peg$c6 = function(start, argument, end) { return node("ReturnStatement", {argument:argument}, start, end) },
        peg$c7 = function(start, argument, end) { return node("ThrowStatement", {argument:argument}, start, end) },
        peg$c8 = function(start, end) { return node("BreakStatement", {}, start, end) },
        peg$c9 = function(start, end) { return node("ContinueStatement", {}, start, end) },
        peg$c10 = function(a) {return {expression:a, text:text()}},
        peg$c11 = function(start, properties, end) { return node('AssertStatement', properties, start, end) },
        peg$c12 = function(start, expression, end) { return node("ExpressionStatement", {expression:expression}, start, end) },
        peg$c13 = function(a) {return a},
        peg$c14 = function(start, test, consequent, alternate, end) { return node("IfStatement", {test:test, consequent:consequent, alternate:alternate}, start, end) },
        peg$c15 = function(start, block, handler, finalizer, end) { return node("TryStatement", {block:block, handler:handler, finalizer:finalizer}, start, end) },
        peg$c16 = function(start, block, finalizer, end) { return node("TryStatement", {block:block, finalizer:finalizer}, start, end) },
        peg$c17 = function(start, param, body, end) { return node("CatchClause", {param:param, guard:null, body:body}, start, end) },
        peg$c18 = function(start, test, body, end) { return node("WhileStatement", {test:test, body:body}, start, end)},
        peg$c19 = function() { return "ForOfStatement" },
        peg$c20 = function() { return "ForInStatement" },
        peg$c21 = function(test) { return test },
        peg$c22 = function(left, type, right, test, inner) { return {type:type, left:left, right:right, test:test || undefined, inner: inner || undefined} },
        peg$c23 = function(start, head, body, end) {
                head = clone(head)
                head.body = body
                return node(head.type, head, start, end)
            },
        peg$c24 = ";",
        peg$c25 = { type: "literal", value: ";", description: "\";\"" },
        peg$c26 = function(start, init, test, update, body, end) { return node("ForStatement", {init:init, test:test, update:update, body:body}, start, end) },
        peg$c27 = "[",
        peg$c28 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c29 = "]",
        peg$c30 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c31 = function(start, value, comprehension, end) {
                // value must be defined AFTER comprehension so that it reflects the actual order of usage.
                // This is important for the checkVariableDeclarations processor.
                return node("ArrayExpression", {comprehension:comprehension, value:value}, start, end)
            },
        peg$c32 = function(start, body, end) { return node("BlockStatement", {body:body}, start, end) },
        peg$c33 = function(start, name, _extends, properties, end) {
                if (name == null)
                    name = {name:null,computed:false}
                return node("ClassExpression", {name:name.name, computed:name.computed, 'extends':_extends || [], properties:(properties != null ? properties.body : [])}, start, end)
            },
        peg$c34 = function(name) { return {name:name,computed:false} },
        peg$c35 = function(name) { return {name:name,computed:true} },
        peg$c36 = function(baseClasses) { return baseClasses },
        peg$c37 = ".",
        peg$c38 = { type: "literal", value: ".", description: "\".\"" },
        peg$c39 = function(head, tail) { return [head].concat(tail) },
        peg$c40 = ":",
        peg$c41 = { type: "literal", value: ":", description: "\":\"" },
        peg$c42 = function(start, key, value, end) { return node("Property", { key: key, value:value, kind: 'init'}, start, end) },
        peg$c43 = function(start, key, value, end) { return node("Property", { key: key, value:value, kind: 'init', computed: true}, start, end) },
        peg$c44 = void 0,
        peg$c45 = function(start, kind, declarations, end) { return node("VariableDeclaration", {declarations:declarations, kind:kind != null ? kind : "let"}, start, end) },
        peg$c46 = ",",
        peg$c47 = { type: "literal", value: ",", description: "\",\"" },
        peg$c48 = function(declarations) { return declarations },
        peg$c49 = function(start, pattern, init, end) { return node("VariableDeclarator", {id:pattern,init:init}, start, end) },
        peg$c50 = "=",
        peg$c51 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c52 = function(pattern) { /* due to packrat parsing, you MUST clone before modifying anything. */ pattern = clone(pattern); pattern.type = "ObjectPattern"; return pattern },
        peg$c53 = function(pattern) { /* due to packrat parsing, you MUST clone before modifying anything. */ pattern = clone(pattern); pattern.type = "ArrayPattern"; return pattern },
        peg$c54 = "...",
        peg$c55 = { type: "literal", value: "...", description: "\"...\"" },
        peg$c56 = function(start, e, end) { return node("SpreadExpression", {expression:e}, start, end) },
        peg$c57 = function(arg) { return arg },
        peg$c58 = function(property) { return property },
        peg$c59 = function(start, properties, end) { return [node("ObjectExpression", {properties:properties}, start, end)] },
        peg$c60 = function(start, callee, args, end) {
                if (callee.type === 'NewExpression' && callee.arguments.length === 0)
                    return node("NewExpression", {callee: callee.callee, arguments: args}, start, end)
                return node("CallExpression", {callee: callee, arguments: args}, start, end)
            },
        peg$c61 = "+=",
        peg$c62 = { type: "literal", value: "+=", description: "\"+=\"" },
        peg$c63 = "-=",
        peg$c64 = { type: "literal", value: "-=", description: "\"-=\"" },
        peg$c65 = "*=",
        peg$c66 = { type: "literal", value: "*=", description: "\"*=\"" },
        peg$c67 = "/=",
        peg$c68 = { type: "literal", value: "/=", description: "\"/=\"" },
        peg$c69 = "%=",
        peg$c70 = { type: "literal", value: "%=", description: "\"%=\"" },
        peg$c71 = "<<=",
        peg$c72 = { type: "literal", value: "<<=", description: "\"<<=\"" },
        peg$c73 = ">>=",
        peg$c74 = { type: "literal", value: ">>=", description: "\">>=\"" },
        peg$c75 = ">>>=",
        peg$c76 = { type: "literal", value: ">>>=", description: "\">>>=\"" },
        peg$c77 = "^=",
        peg$c78 = { type: "literal", value: "^=", description: "\"^=\"" },
        peg$c79 = "&=",
        peg$c80 = { type: "literal", value: "&=", description: "\"&=\"" },
        peg$c81 = "??=",
        peg$c82 = { type: "literal", value: "??=", description: "\"??=\"" },
        peg$c83 = "?=",
        peg$c84 = { type: "literal", value: "?=", description: "\"?=\"" },
        peg$c85 = function(start, left, op, right, end) { return node("AssignmentExpression", {operator:op, left:left, right:right}, start, end) },
        peg$c86 = "?",
        peg$c87 = { type: "literal", value: "?", description: "\"?\"" },
        peg$c88 = function(start, test, consequent, alternate, end) { return node('ConditionalExpression', {test:test,consequent:consequent,alternate:alternate}, start, end) },
        peg$c89 = "??",
        peg$c90 = { type: "literal", value: "??", description: "\"??\"" },
        peg$c91 = function(start, head, tail) { return leftAssociateBinaryExpressions(start, head, tail) },
        peg$c92 = "|",
        peg$c93 = { type: "literal", value: "|", description: "\"|\"" },
        peg$c94 = "^",
        peg$c95 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c96 = "&",
        peg$c97 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c98 = "<=",
        peg$c99 = { type: "literal", value: "<=", description: "\"<=\"" },
        peg$c100 = ">=",
        peg$c101 = { type: "literal", value: ">=", description: "\">=\"" },
        peg$c102 = "<",
        peg$c103 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c104 = ">",
        peg$c105 = { type: "literal", value: ">", description: "\">\"" },
        peg$c106 = ">>>",
        peg$c107 = { type: "literal", value: ">>>", description: "\">>>\"" },
        peg$c108 = ">>",
        peg$c109 = { type: "literal", value: ">>", description: "\">>\"" },
        peg$c110 = "<<",
        peg$c111 = { type: "literal", value: "<<", description: "\"<<\"" },
        peg$c112 = "+",
        peg$c113 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c114 = "-",
        peg$c115 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c116 = "*",
        peg$c117 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c118 = "/",
        peg$c119 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c120 = "%",
        peg$c121 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c122 = function(start, op, arg, end) { return node('UnaryExpression', {operator:op, argument:arg}, start, end) },
        peg$c123 = { type: "other", description: "unaryOperator" },
        peg$c124 = "~",
        peg$c125 = { type: "literal", value: "~", description: "\"~\"" },
        peg$c126 = "++",
        peg$c127 = { type: "literal", value: "++", description: "\"++\"" },
        peg$c128 = "--",
        peg$c129 = { type: "literal", value: "--", description: "\"--\"" },
        peg$c130 = function(start, op, arg, end) { return node('UpdateExpression', {operator:op, argument:arg, prefix:true}, start, end) },
        peg$c131 = function(start, arg, op, end) { return node('UpdateExpression', {operator:op, argument:arg, prefix:false}, start, end) },
        peg$c132 = function(start, arg, op, end) { return node('UnaryExpression', {operator:op, argument:arg}, start, end) },
        peg$c133 = function(start, head, tail) { return leftAssociateCallsOrMembers(start, head, tail) },
        peg$c134 = function() {return true},
        peg$c135 = function(existential, args, end) { return ["callee", node("CallExpression", {callee:null, arguments:args, existential:existential || undefined}), end] },
        peg$c136 = function(existential, property, end) { return ["object", node("MemberExpression", {computed:true, object:null, property:property, existential:existential || undefined}), end] },
        peg$c137 = function(existential, property, end) { return ["object", node("MemberExpression", {computed:false, object:null, property:property, existential:existential || undefined}), end] },
        peg$c138 = "(",
        peg$c139 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c140 = ")",
        peg$c141 = { type: "literal", value: ")", description: "\")\"" },
        peg$c142 = function(a) { return a ? a : [] },
        peg$c143 = function(c) {return c},
        peg$c144 = function(a, b) { return [a].concat(b) },
        peg$c145 = function(start, callee, args, end) { return node("NewExpression", {callee:callee,arguments:args || []}, start, end) },
        peg$c146 = function(start, name, end) { return node('ImportExpression', {name:name}, start, end) },
        peg$c147 = function(start, f, end) {
                var args;
                if (f.params != null)
                    args = f.params.map(function(x){ return x.name != null ? clone(x) : error("do parameters must be Identifiers") })
                else
                    args = []
                return node("CallExpression", {callee:f,arguments:args}, start, end)
            },
        peg$c148 = "->",
        peg$c149 = { type: "literal", value: "->", description: "\"->\"" },
        peg$c150 = function() { return false },
        peg$c151 = "=>",
        peg$c152 = { type: "literal", value: "=>", description: "\"=>\"" },
        peg$c153 = function() { return true },
        peg$c154 = function(start, template, id, params, bound, body, end) {
                if (params == null) params = []
                paramPatterns = params.map(function(x) { return x[0] })
                paramDefaults = params.map(function(x) { return x[1] })
                // convert expression closures to return statements in a block
                if (body == null)
                    body = node('BlockStatement', {body:[]})
                else if (body.type === 'ThrowStatement')
                    body = node('BlockStatement', {body:[body]})
                else if (body.type !== 'BlockStatement')
                    body = node('BlockStatement', {body:[node('ReturnStatement', {argument:body})]})
                return node('FunctionExpression', {id:id, params:paramPatterns, defaults:paramDefaults, body:body, bound:bound, template:template ? true : undefined}, start, end)
            },
        peg$c155 = function(params) { return params != null ? params : [] },
        peg$c156 = function(param, init) { return [param,init] },
        peg$c157 = { type: "other", description: "primaryExpression" },
        peg$c158 = "`",
        peg$c159 = { type: "literal", value: "`", description: "\"`\"" },
        peg$c160 = { type: "any", description: "any character" },
        peg$c161 = function(start, a, end) { return node("JavascriptExpression", {text:text().slice(1, -1)}, start, end) },
        peg$c162 = function(start, elements, end) { return node("ArrayExpression", {elements:elements || []}, start, end) },
        peg$c163 = function(item) {return item},
        peg$c164 = "{",
        peg$c165 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c166 = "}",
        peg$c167 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c168 = function(start, assignments, end) { return node("ObjectExpression", {properties:assignments || []}, start, end) },
        peg$c169 = function(start, key, end) { return node("Property", { key: key, value:clone(key), kind: 'init'}, start, end) },
        peg$c170 = function(start, type, properties, end) { return node("ObjectExpression", {objectType:type,properties:properties.body}, start, end) },
        peg$c171 = function(start, properties, end) { return node("ObjectExpression", {objectType:null,properties:properties.body}, start, end) },
        peg$c172 = { type: "other", description: "group" },
        peg$c173 = function(expression) { return expression },
        peg$c174 = function(value) { return value },
        peg$c175 = function(start, name, end) { return node("Identifier", {name:name}, start, end) },
        peg$c176 = { type: "other", description: "this" },
        peg$c177 = "@@",
        peg$c178 = { type: "literal", value: "@@", description: "\"@@\"" },
        peg$c179 = function(start, property, end) { return thisExpression(start, end, "constructor", property) },
        peg$c180 = "@",
        peg$c181 = { type: "literal", value: "@", description: "\"@\"" },
        peg$c182 = function(start, property, end) { return thisExpression(start, end, property) },
        peg$c183 = function(start, end) { return thisExpression(start, end, "constructor") },
        peg$c184 = function(start, end) { return thisExpression(start, end) },
        peg$c185 = { type: "other", description: "literal" },
        peg$c186 = function(start, value, end) { return node('Literal', {value:value}, start, end) },
        peg$c187 = function(start, end) { return node('UnaryExpression', {operator:'void', prefix:true, argument:node('Literal', {value:0}, start, end)}, start, end) },
        peg$c188 = function() { return {line:line(),column:column()-1} },
        peg$c189 = function() { return offset() },
        peg$c190 = function(a, b) { return new RegExp(a, b) },
        peg$c191 = "\\",
        peg$c192 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c193 = /^[^\/]/,
        peg$c194 = { type: "class", value: "[^\\/]", description: "[^\\/]" },
        peg$c195 = /^[gimy]/,
        peg$c196 = { type: "class", value: "[gimy]", description: "[gimy]" },
        peg$c197 = "'",
        peg$c198 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c199 = /^['\\\/bfnrt]/,
        peg$c200 = { type: "class", value: "['\\\\\\/bfnrt]", description: "['\\\\\\/bfnrt]" },
        peg$c201 = "u",
        peg$c202 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c203 = /^[^'\\\r\n]/,
        peg$c204 = { type: "class", value: "[^'\\\\\\r\\n]", description: "[^'\\\\\\r\\n]" },
        peg$c205 = function() { return eval(text()) },
        peg$c206 = "\"",
        peg$c207 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c208 = /^["\\\/bfnrt]/,
        peg$c209 = { type: "class", value: "[\"\\\\\\/bfnrt]", description: "[\"\\\\\\/bfnrt]" },
        peg$c210 = /^[^"\\\r\n]/,
        peg$c211 = { type: "class", value: "[^\"\\\\\\r\\n]", description: "[^\"\\\\\\r\\n]" },
        peg$c212 = "\"\"",
        peg$c213 = { type: "literal", value: "\"\"", description: "\"\\\"\\\"\"" },
        peg$c214 = function(start, content, end) { return concatenate(unindent(content)) },
        peg$c215 = function(a) { return Array.prototype.concat.apply([], a) },
        peg$c216 = "{{",
        peg$c217 = { type: "literal", value: "{{", description: "\"{{\"" },
        peg$c218 = function() { return text() },
        peg$c219 = "''",
        peg$c220 = { type: "literal", value: "''", description: "\"''\"" },
        peg$c221 = "}}",
        peg$c222 = { type: "literal", value: "}}", description: "\"}}\"" },
        peg$c223 = function(a) { return concatenate(a) },
        peg$c224 = function() { return eval('"' + text() + '"') },
        peg$c225 = /^[+\-]/,
        peg$c226 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
        peg$c227 = /^[eE]/,
        peg$c228 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c229 = function() { return parseFloat(text()) },
        peg$c230 = function() { return parseInt(text()) },
        peg$c231 = /^[0-9]/,
        peg$c232 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c233 = "0",
        peg$c234 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c235 = "0x",
        peg$c236 = { type: "literal", value: "0x", description: "\"0x\"" },
        peg$c237 = function() { return parseInt(text(), 16) },
        peg$c238 = /^[0-9a-fA-F]/,
        peg$c239 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
        peg$c240 = { type: "other", description: "identifier" },
        peg$c241 = { type: "other", description: "identifierName" },
        peg$c242 = /^[$_]/,
        peg$c243 = { type: "class", value: "[$_]", description: "[$_]" },
        peg$c244 = "\\u",
        peg$c245 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c246 = function(h0, h1, h2, h3) { return String.fromCharCode(parseInt(h0 + h1 + h2 + h3, 16)); },
        peg$c247 = /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uFF21-\uFF3Aa-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D62-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7C\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2D00-\u2D25\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D61\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA717-\uA71F\uA770\uA788\uA9CF\uAA70\uAADD\uFF70\uFF9E\uFF9F\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u1100-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BC0-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u2135-\u2138\u2D30-\u2D65\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400\u4DB5\u4E00\u9FCB\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA2D\uFA30-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,
        peg$c248 = { type: "class", value: "[A-Z\\xC0-\\xD6\\xD8-\\xDE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178\\u0179\\u017B\\u017D\\u0181\\u0182\\u0184\\u0186\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193\\u0194\\u0196-\\u0198\\u019C\\u019D\\u019F\\u01A0\\u01A2\\u01A4\\u01A6\\u01A7\\u01A9\\u01AC\\u01AE\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A\\u023B\\u023D\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uFF21-\\uFF3Aa-z\\xAA\\xB5\\xBA\\xDF-\\xF6\\xF8-\\xFF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0561-\\u0587\\u1D00-\\u1D2B\\u1D62-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6\\u1FC7\\u1FD0-\\u1FD3\\u1FD6\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6\\u1FF7\\u210A\\u210E\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73\\u2C74\\u2C76-\\u2C7C\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3\\u2CE4\\u2CEC\\u2CEE\\u2D00-\\u2D25\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7FA\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5\\u06E6\\u07F4\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D61\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA717-\\uA71F\\uA770\\uA788\\uA9CF\\uAA70\\uAADD\\uFF70\\uFF9E\\uFF9F\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u1100-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BC0-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u2135-\\u2138\\u2D30-\\u2D65\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FCB\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB\\uAADC\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA2D\\uFA30-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]", description: "[A-Z\\xC0-\\xD6\\xD8-\\xDE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178\\u0179\\u017B\\u017D\\u0181\\u0182\\u0184\\u0186\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193\\u0194\\u0196-\\u0198\\u019C\\u019D\\u019F\\u01A0\\u01A2\\u01A4\\u01A6\\u01A7\\u01A9\\u01AC\\u01AE\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A\\u023B\\u023D\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uFF21-\\uFF3Aa-z\\xAA\\xB5\\xBA\\xDF-\\xF6\\xF8-\\xFF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0561-\\u0587\\u1D00-\\u1D2B\\u1D62-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6\\u1FC7\\u1FD0-\\u1FD3\\u1FD6\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6\\u1FF7\\u210A\\u210E\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73\\u2C74\\u2C76-\\u2C7C\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3\\u2CE4\\u2CEC\\u2CEE\\u2D00-\\u2D25\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7FA\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5\\u06E6\\u07F4\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D61\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA717-\\uA71F\\uA770\\uA788\\uA9CF\\uAA70\\uAADD\\uFF70\\uFF9E\\uFF9F\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u1100-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BC0-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u2135-\\u2138\\u2D30-\\u2D65\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FCB\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB\\uAADC\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA2D\\uFA30-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]" },
        peg$c249 = "\uD82C",
        peg$c250 = { type: "literal", value: "\uD82C", description: "\"\\uD82C\"" },
        peg$c251 = /^[\uDC00\uDC01]/,
        peg$c252 = { type: "class", value: "[\\uDC00\\uDC01]", description: "[\\uDC00\\uDC01]" },
        peg$c253 = "\uD808",
        peg$c254 = { type: "literal", value: "\uD808", description: "\"\\uD808\"" },
        peg$c255 = /^[\uDC00-\uDF6E]/,
        peg$c256 = { type: "class", value: "[\\uDC00-\\uDF6E]", description: "[\\uDC00-\\uDF6E]" },
        peg$c257 = "\uD869",
        peg$c258 = { type: "literal", value: "\uD869", description: "\"\\uD869\"" },
        peg$c259 = /^[\uDED6\uDF00]/,
        peg$c260 = { type: "class", value: "[\\uDED6\\uDF00]", description: "[\\uDED6\\uDF00]" },
        peg$c261 = "\uD809",
        peg$c262 = { type: "literal", value: "\uD809", description: "\"\\uD809\"" },
        peg$c263 = /^[\uDC00-\uDC62]/,
        peg$c264 = { type: "class", value: "[\\uDC00-\\uDC62]", description: "[\\uDC00-\\uDC62]" },
        peg$c265 = "\uD835",
        peg$c266 = { type: "literal", value: "\uD835", description: "\"\\uD835\"" },
        peg$c267 = /^[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]/,
        peg$c268 = { type: "class", value: "[\\uDC00-\\uDC19\\uDC34-\\uDC4D\\uDC68-\\uDC81\\uDC9C\\uDC9E\\uDC9F\\uDCA2\\uDCA5\\uDCA6\\uDCA9-\\uDCAC\\uDCAE-\\uDCB5\\uDCD0-\\uDCE9\\uDD04\\uDD05\\uDD07-\\uDD0A\\uDD0D-\\uDD14\\uDD16-\\uDD1C\\uDD38\\uDD39\\uDD3B-\\uDD3E\\uDD40-\\uDD44\\uDD46\\uDD4A-\\uDD50\\uDD6C-\\uDD85\\uDDA0-\\uDDB9\\uDDD4-\\uDDED\\uDE08-\\uDE21\\uDE3C-\\uDE55\\uDE70-\\uDE89\\uDEA8-\\uDEC0\\uDEE2-\\uDEFA\\uDF1C-\\uDF34\\uDF56-\\uDF6E\\uDF90-\\uDFA8\\uDFCA\\uDC1A-\\uDC33\\uDC4E-\\uDC54\\uDC56-\\uDC67\\uDC82-\\uDC9B\\uDCB6-\\uDCB9\\uDCBB\\uDCBD-\\uDCC3\\uDCC5-\\uDCCF\\uDCEA-\\uDD03\\uDD1E-\\uDD37\\uDD52-\\uDD6B\\uDD86-\\uDD9F\\uDDBA-\\uDDD3\\uDDEE-\\uDE07\\uDE22-\\uDE3B\\uDE56-\\uDE6F\\uDE8A-\\uDEA5\\uDEC2-\\uDEDA\\uDEDC-\\uDEE1\\uDEFC-\\uDF14\\uDF16-\\uDF1B\\uDF36-\\uDF4E\\uDF50-\\uDF55\\uDF70-\\uDF88\\uDF8A-\\uDF8F\\uDFAA-\\uDFC2\\uDFC4-\\uDFC9\\uDFCB]", description: "[\\uDC00-\\uDC19\\uDC34-\\uDC4D\\uDC68-\\uDC81\\uDC9C\\uDC9E\\uDC9F\\uDCA2\\uDCA5\\uDCA6\\uDCA9-\\uDCAC\\uDCAE-\\uDCB5\\uDCD0-\\uDCE9\\uDD04\\uDD05\\uDD07-\\uDD0A\\uDD0D-\\uDD14\\uDD16-\\uDD1C\\uDD38\\uDD39\\uDD3B-\\uDD3E\\uDD40-\\uDD44\\uDD46\\uDD4A-\\uDD50\\uDD6C-\\uDD85\\uDDA0-\\uDDB9\\uDDD4-\\uDDED\\uDE08-\\uDE21\\uDE3C-\\uDE55\\uDE70-\\uDE89\\uDEA8-\\uDEC0\\uDEE2-\\uDEFA\\uDF1C-\\uDF34\\uDF56-\\uDF6E\\uDF90-\\uDFA8\\uDFCA\\uDC1A-\\uDC33\\uDC4E-\\uDC54\\uDC56-\\uDC67\\uDC82-\\uDC9B\\uDCB6-\\uDCB9\\uDCBB\\uDCBD-\\uDCC3\\uDCC5-\\uDCCF\\uDCEA-\\uDD03\\uDD1E-\\uDD37\\uDD52-\\uDD6B\\uDD86-\\uDD9F\\uDDBA-\\uDDD3\\uDDEE-\\uDE07\\uDE22-\\uDE3B\\uDE56-\\uDE6F\\uDE8A-\\uDEA5\\uDEC2-\\uDEDA\\uDEDC-\\uDEE1\\uDEFC-\\uDF14\\uDF16-\\uDF1B\\uDF36-\\uDF4E\\uDF50-\\uDF55\\uDF70-\\uDF88\\uDF8A-\\uDF8F\\uDFAA-\\uDFC2\\uDFC4-\\uDFC9\\uDFCB]" },
        peg$c269 = "\uD804",
        peg$c270 = { type: "literal", value: "\uD804", description: "\"\\uD804\"" },
        peg$c271 = /^[\uDC03-\uDC37\uDC83-\uDCAF]/,
        peg$c272 = { type: "class", value: "[\\uDC03-\\uDC37\\uDC83-\\uDCAF]", description: "[\\uDC03-\\uDC37\\uDC83-\\uDCAF]" },
        peg$c273 = "\uD800",
        peg$c274 = { type: "literal", value: "\uD800", description: "\"\\uD800\"" },
        peg$c275 = /^[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1E\uDF30-\uDF40\uDF42-\uDF49\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDD40-\uDD74\uDF41\uDF4A\uDFD1-\uDFD5]/,
        peg$c276 = { type: "class", value: "[\\uDC00-\\uDC0B\\uDC0D-\\uDC26\\uDC28-\\uDC3A\\uDC3C\\uDC3D\\uDC3F-\\uDC4D\\uDC50-\\uDC5D\\uDC80-\\uDCFA\\uDE80-\\uDE9C\\uDEA0-\\uDED0\\uDF00-\\uDF1E\\uDF30-\\uDF40\\uDF42-\\uDF49\\uDF80-\\uDF9D\\uDFA0-\\uDFC3\\uDFC8-\\uDFCF\\uDD40-\\uDD74\\uDF41\\uDF4A\\uDFD1-\\uDFD5]", description: "[\\uDC00-\\uDC0B\\uDC0D-\\uDC26\\uDC28-\\uDC3A\\uDC3C\\uDC3D\\uDC3F-\\uDC4D\\uDC50-\\uDC5D\\uDC80-\\uDCFA\\uDE80-\\uDE9C\\uDEA0-\\uDED0\\uDF00-\\uDF1E\\uDF30-\\uDF40\\uDF42-\\uDF49\\uDF80-\\uDF9D\\uDFA0-\\uDFC3\\uDFC8-\\uDFCF\\uDD40-\\uDD74\\uDF41\\uDF4A\\uDFD1-\\uDFD5]" },
        peg$c277 = "\uD80C",
        peg$c278 = { type: "literal", value: "\uD80C", description: "\"\\uD80C\"" },
        peg$c279 = /^[\uDC00-\uDFFF]/,
        peg$c280 = { type: "class", value: "[\\uDC00-\\uDFFF]", description: "[\\uDC00-\\uDFFF]" },
        peg$c281 = "\uD801",
        peg$c282 = { type: "literal", value: "\uD801", description: "\"\\uD801\"" },
        peg$c283 = /^[\uDC00-\uDC9D]/,
        peg$c284 = { type: "class", value: "[\\uDC00-\\uDC9D]", description: "[\\uDC00-\\uDC9D]" },
        peg$c285 = "\uD86E",
        peg$c286 = { type: "literal", value: "\uD86E", description: "\"\\uD86E\"" },
        peg$c287 = /^[\uDC1D]/,
        peg$c288 = { type: "class", value: "[\\uDC1D]", description: "[\\uDC1D]" },
        peg$c289 = "\uD803",
        peg$c290 = { type: "literal", value: "\uD803", description: "\"\\uD803\"" },
        peg$c291 = /^[\uDC00-\uDC48]/,
        peg$c292 = { type: "class", value: "[\\uDC00-\\uDC48]", description: "[\\uDC00-\\uDC48]" },
        peg$c293 = "\uD840",
        peg$c294 = { type: "literal", value: "\uD840", description: "\"\\uD840\"" },
        peg$c295 = /^[\uDC00]/,
        peg$c296 = { type: "class", value: "[\\uDC00]", description: "[\\uDC00]" },
        peg$c297 = "\uD87E",
        peg$c298 = { type: "literal", value: "\uD87E", description: "\"\\uD87E\"" },
        peg$c299 = /^[\uDC00-\uDE1D]/,
        peg$c300 = { type: "class", value: "[\\uDC00-\\uDE1D]", description: "[\\uDC00-\\uDE1D]" },
        peg$c301 = "\uD86D",
        peg$c302 = { type: "literal", value: "\uD86D", description: "\"\\uD86D\"" },
        peg$c303 = /^[\uDF34\uDF40]/,
        peg$c304 = { type: "class", value: "[\\uDF34\\uDF40]", description: "[\\uDF34\\uDF40]" },
        peg$c305 = "\uD81A",
        peg$c306 = { type: "literal", value: "\uD81A", description: "\"\\uD81A\"" },
        peg$c307 = /^[\uDC00-\uDE38]/,
        peg$c308 = { type: "class", value: "[\\uDC00-\\uDE38]", description: "[\\uDC00-\\uDE38]" },
        peg$c309 = "\uD802",
        peg$c310 = { type: "literal", value: "\uD802", description: "\"\\uD802\"" },
        peg$c311 = /^[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDD00-\uDD15\uDD20-\uDD39\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72]/,
        peg$c312 = { type: "class", value: "[\\uDC00-\\uDC05\\uDC08\\uDC0A-\\uDC35\\uDC37\\uDC38\\uDC3C\\uDC3F-\\uDC55\\uDD00-\\uDD15\\uDD20-\\uDD39\\uDE00\\uDE10-\\uDE13\\uDE15-\\uDE17\\uDE19-\\uDE33\\uDE60-\\uDE7C\\uDF00-\\uDF35\\uDF40-\\uDF55\\uDF60-\\uDF72]", description: "[\\uDC00-\\uDC05\\uDC08\\uDC0A-\\uDC35\\uDC37\\uDC38\\uDC3C\\uDC3F-\\uDC55\\uDD00-\\uDD15\\uDD20-\\uDD39\\uDE00\\uDE10-\\uDE13\\uDE15-\\uDE17\\uDE19-\\uDE33\\uDE60-\\uDE7C\\uDF00-\\uDF35\\uDF40-\\uDF55\\uDF60-\\uDF72]" },
        peg$c313 = "\uD80D",
        peg$c314 = { type: "literal", value: "\uD80D", description: "\"\\uD80D\"" },
        peg$c315 = /^[\uDC00-\uDC2E]/,
        peg$c316 = { type: "class", value: "[\\uDC00-\\uDC2E]", description: "[\\uDC00-\\uDC2E]" },
        peg$c317 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0900-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1DC0-\u1DE6\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E\u094F\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u19B0-\u19C0\u19C8\u19C9\u1A19-\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC]/,
        peg$c318 = { type: "class", value: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1BE6\\u1BE8\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u094F\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2\\u1BF3\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]", description: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1BE6\\u1BE8\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u094F\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2\\u1BF3\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]" },
        peg$c319 = "\uDB40",
        peg$c320 = { type: "literal", value: "\uDB40", description: "\"\\uDB40\"" },
        peg$c321 = /^[\uDD00-\uDDEF]/,
        peg$c322 = { type: "class", value: "[\\uDD00-\\uDDEF]", description: "[\\uDD00-\\uDDEF]" },
        peg$c323 = "\uD834",
        peg$c324 = { type: "literal", value: "\uD834", description: "\"\\uD834\"" },
        peg$c325 = /^[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44\uDD65\uDD66\uDD6D-\uDD72]/,
        peg$c326 = { type: "class", value: "[\\uDD67-\\uDD69\\uDD7B-\\uDD82\\uDD85-\\uDD8B\\uDDAA-\\uDDAD\\uDE42-\\uDE44\\uDD65\\uDD66\\uDD6D-\\uDD72]", description: "[\\uDD67-\\uDD69\\uDD7B-\\uDD82\\uDD85-\\uDD8B\\uDDAA-\\uDDAD\\uDE42-\\uDE44\\uDD65\\uDD66\\uDD6D-\\uDD72]" },
        peg$c327 = /^[\uDC01\uDC38-\uDC46\uDC80\uDC81\uDCB3-\uDCB6\uDCB9\uDCBA\uDC00\uDC02\uDC82\uDCB0-\uDCB2\uDCB7\uDCB8]/,
        peg$c328 = { type: "class", value: "[\\uDC01\\uDC38-\\uDC46\\uDC80\\uDC81\\uDCB3-\\uDCB6\\uDCB9\\uDCBA\\uDC00\\uDC02\\uDC82\\uDCB0-\\uDCB2\\uDCB7\\uDCB8]", description: "[\\uDC01\\uDC38-\\uDC46\\uDC80\\uDC81\\uDCB3-\\uDCB6\\uDCB9\\uDCBA\\uDC00\\uDC02\\uDC82\\uDCB0-\\uDCB2\\uDCB7\\uDCB8]" },
        peg$c329 = /^[\uDDFD]/,
        peg$c330 = { type: "class", value: "[\\uDDFD]", description: "[\\uDDFD]" },
        peg$c331 = /^[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F]/,
        peg$c332 = { type: "class", value: "[\\uDE01-\\uDE03\\uDE05\\uDE06\\uDE0C-\\uDE0F\\uDE38-\\uDE3A\\uDE3F]", description: "[\\uDE01-\\uDE03\\uDE05\\uDE06\\uDE0C-\\uDE0F\\uDE38-\\uDE3A\\uDE3F]" },
        peg$c333 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
        peg$c334 = { type: "class", value: "[0-9\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]", description: "[0-9\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]" },
        peg$c335 = /^[\uDFCE-\uDFFF]/,
        peg$c336 = { type: "class", value: "[\\uDFCE-\\uDFFF]", description: "[\\uDFCE-\\uDFFF]" },
        peg$c337 = /^[\uDC66-\uDC6F]/,
        peg$c338 = { type: "class", value: "[\\uDC66-\\uDC6F]", description: "[\\uDC66-\\uDC6F]" },
        peg$c339 = /^[\uDCA0-\uDCA9]/,
        peg$c340 = { type: "class", value: "[\\uDCA0-\\uDCA9]", description: "[\\uDCA0-\\uDCA9]" },
        peg$c341 = /^[_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F]/,
        peg$c342 = { type: "class", value: "[_\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]", description: "[_\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]" },
        peg$c343 = "\u200C",
        peg$c344 = { type: "literal", value: "\u200C", description: "\"\\u200C\"" },
        peg$c345 = "\u200D",
        peg$c346 = { type: "literal", value: "\u200D", description: "\"\\u200D\"" },
        peg$c347 = "true",
        peg$c348 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c349 = "false",
        peg$c350 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c351 = "new",
        peg$c352 = { type: "literal", value: "new", description: "\"new\"" },
        peg$c353 = "this",
        peg$c354 = { type: "literal", value: "this", description: "\"this\"" },
        peg$c355 = "null",
        peg$c356 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c357 = function() { return null },
        peg$c358 = "undefined",
        peg$c359 = { type: "literal", value: "undefined", description: "\"undefined\"" },
        peg$c360 = function() { return undefined },
        peg$c361 = "and",
        peg$c362 = { type: "literal", value: "and", description: "\"and\"" },
        peg$c363 = function() { return "&&" },
        peg$c364 = "or",
        peg$c365 = { type: "literal", value: "or", description: "\"or\"" },
        peg$c366 = function() { return "||" },
        peg$c367 = "is",
        peg$c368 = { type: "literal", value: "is", description: "\"is\"" },
        peg$c369 = function() { return "===" },
        peg$c370 = "isnt",
        peg$c371 = { type: "literal", value: "isnt", description: "\"isnt\"" },
        peg$c372 = function() { return "!==" },
        peg$c373 = "not",
        peg$c374 = { type: "literal", value: "not", description: "\"not\"" },
        peg$c375 = function() { return "!" },
        peg$c376 = "typeof",
        peg$c377 = { type: "literal", value: "typeof", description: "\"typeof\"" },
        peg$c378 = function() { return "typeof"},
        peg$c379 = "void",
        peg$c380 = { type: "literal", value: "void", description: "\"void\"" },
        peg$c381 = function() { return "void"},
        peg$c382 = "delete",
        peg$c383 = { type: "literal", value: "delete", description: "\"delete\"" },
        peg$c384 = function() { return "delete"},
        peg$c385 = "var",
        peg$c386 = { type: "literal", value: "var", description: "\"var\"" },
        peg$c387 = "const",
        peg$c388 = { type: "literal", value: "const", description: "\"const\"" },
        peg$c389 = function() { return "const" },
        peg$c390 = "let",
        peg$c391 = { type: "literal", value: "let", description: "\"let\"" },
        peg$c392 = function() { return "let" },
        peg$c393 = "in",
        peg$c394 = { type: "literal", value: "in", description: "\"in\"" },
        peg$c395 = function() { return "in" },
        peg$c396 = "instanceof",
        peg$c397 = { type: "literal", value: "instanceof", description: "\"instanceof\"" },
        peg$c398 = function() { return "instanceof" },
        peg$c399 = "while",
        peg$c400 = { type: "literal", value: "while", description: "\"while\"" },
        peg$c401 = "for",
        peg$c402 = { type: "literal", value: "for", description: "\"for\"" },
        peg$c403 = "of",
        peg$c404 = { type: "literal", value: "of", description: "\"of\"" },
        peg$c405 = "if",
        peg$c406 = { type: "literal", value: "if", description: "\"if\"" },
        peg$c407 = "else",
        peg$c408 = { type: "literal", value: "else", description: "\"else\"" },
        peg$c409 = "return",
        peg$c410 = { type: "literal", value: "return", description: "\"return\"" },
        peg$c411 = "try",
        peg$c412 = { type: "literal", value: "try", description: "\"try\"" },
        peg$c413 = "catch",
        peg$c414 = { type: "literal", value: "catch", description: "\"catch\"" },
        peg$c415 = "finally",
        peg$c416 = { type: "literal", value: "finally", description: "\"finally\"" },
        peg$c417 = "throw",
        peg$c418 = { type: "literal", value: "throw", description: "\"throw\"" },
        peg$c419 = "break",
        peg$c420 = { type: "literal", value: "break", description: "\"break\"" },
        peg$c421 = "continue",
        peg$c422 = { type: "literal", value: "continue", description: "\"continue\"" },
        peg$c423 = "do",
        peg$c424 = { type: "literal", value: "do", description: "\"do\"" },
        peg$c425 = "import",
        peg$c426 = { type: "literal", value: "import", description: "\"import\"" },
        peg$c427 = "export",
        peg$c428 = { type: "literal", value: "export", description: "\"export\"" },
        peg$c429 = "class",
        peg$c430 = { type: "literal", value: "class", description: "\"class\"" },
        peg$c431 = "extends",
        peg$c432 = { type: "literal", value: "extends", description: "\"extends\"" },
        peg$c433 = "assert",
        peg$c434 = { type: "literal", value: "assert", description: "\"assert\"" },
        peg$c435 = "template",
        peg$c436 = { type: "literal", value: "template", description: "\"template\"" },
        peg$c437 = { type: "other", description: "INDENT" },
        peg$c438 = "{{{{",
        peg$c439 = { type: "literal", value: "{{{{", description: "\"{{{{\"" },
        peg$c440 = { type: "other", description: "OUTDENT" },
        peg$c441 = "}}}}",
        peg$c442 = { type: "literal", value: "}}}}", description: "\"}}}}\"" },
        peg$c443 = { type: "other", description: "space" },
        peg$c444 = " ",
        peg$c445 = { type: "literal", value: " ", description: "\" \"" },
        peg$c446 = "#",
        peg$c447 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c448 = "\n",
        peg$c449 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c450 = { type: "other", description: "end of line" },
        peg$c451 = "\r",
        peg$c452 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c453 = { type: "other", description: "end of file" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$cache = {},
        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parseProgram() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 0,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseStatement();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseStatement();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c2(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseStatement() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 1,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseeol();
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssertStatement();
          if (s3 === peg$FAILED) {
            s3 = peg$parseExportStatement();
            if (s3 === peg$FAILED) {
              s3 = peg$parseVariableDeclaration();
              if (s3 === peg$FAILED) {
                s3 = peg$parsePropertyDeclaration();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseIterationStatement();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parseIfStatement();
                    if (s3 === peg$FAILED) {
                      s3 = peg$parseReturnStatement();
                      if (s3 === peg$FAILED) {
                        s3 = peg$parseBreakStatement();
                        if (s3 === peg$FAILED) {
                          s3 = peg$parseContinueStatement();
                          if (s3 === peg$FAILED) {
                            s3 = peg$parseThrowStatement();
                            if (s3 === peg$FAILED) {
                              s3 = peg$parseTryStatement();
                              if (s3 === peg$FAILED) {
                                s3 = peg$parseExpressionStatement();
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeol();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c4(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseExportStatement() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 2,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseexport();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseVariableDeclaration();
            if (s4 === peg$FAILED) {
              s4 = peg$parseRightHandSideExpression();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c5(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseReturnStatement() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 3,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsereturn();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseRightHandSideExpression();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c6(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseThrowStatement() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 4,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsethrow();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseRightHandSideExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c7(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBreakStatement() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 5,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsebreak();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c8(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseContinueStatement() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 6,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecontinue();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c9(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseAssertStatement() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 7,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseassert();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parseAssignmentExpression();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s4;
              s5 = peg$c10(s5);
            }
            s4 = s5;
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c11(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseExpressionStatement() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 8,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseExpression();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c12(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseIfStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      var key    = peg$currPos * 171 + 9,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseif();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseAssignmentExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseBlockStatement();
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$parseeol();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse_();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseelse();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse_();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseIfStatement();
                        if (s11 === peg$FAILED) {
                          s11 = peg$parseBlockStatement();
                        }
                        if (s11 !== peg$FAILED) {
                          peg$reportedPos = s6;
                          s7 = peg$c13(s11);
                          s6 = s7;
                        } else {
                          peg$currPos = s6;
                          s6 = peg$c0;
                        }
                      } else {
                        peg$currPos = s6;
                        s6 = peg$c0;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                if (s6 === peg$FAILED) {
                  s6 = peg$c3;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsestart();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c14(s1, s4, s5, s6, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseTryStatement() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 10,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetry();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseBlockStatement();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsecatchClause();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsefinallyClause();
              if (s5 === peg$FAILED) {
                s5 = peg$c3;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsestart();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c15(s1, s3, s4, s5, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsetry();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseBlockStatement();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsefinallyClause();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsestart();
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c16(s1, s3, s4, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefinallyClause() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 11,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseeol();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsefinally();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseBlockStatement();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c4(s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsecatchClause() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      var key    = peg$currPos * 171 + 12,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeol();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsecatch();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseIdentifier();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseBlockStatement();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsestart();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c17(s1, s6, s7, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseIterationStatement() {
      var s0;

      var key    = peg$currPos * 171 + 13,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseWhileStatement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseForInOfStatement();
        if (s0 === peg$FAILED) {
          s0 = peg$parseForStatement();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseWhileStatement() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 14,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhile();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseAssignmentExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseBlockStatement();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsestart();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c18(s1, s4, s5, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseForInOfHead() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

      var key    = peg$currPos * 171 + 15,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsefor();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseVariableDeclarationKindOptional();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parsein();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s5;
                s6 = peg$c19();
              }
              s5 = s6;
              if (s5 === peg$FAILED) {
                s5 = peg$currPos;
                s6 = peg$parseof();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s5;
                  s6 = peg$c20();
                }
                s5 = s6;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseAssignmentExpression();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$currPos;
                      s10 = peg$parseif();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parse_();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parseAssignmentExpression();
                          if (s12 !== peg$FAILED) {
                            peg$reportedPos = s9;
                            s10 = peg$c21(s12);
                            s9 = s10;
                          } else {
                            peg$currPos = s9;
                            s9 = peg$c0;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$c0;
                        }
                      } else {
                        peg$currPos = s9;
                        s9 = peg$c0;
                      }
                      if (s9 === peg$FAILED) {
                        s9 = peg$c3;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse_();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseForInOfHead();
                          if (s11 === peg$FAILED) {
                            s11 = peg$c3;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c22(s3, s5, s7, s9, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseForInOfStatement() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 16,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseForInOfHead();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseBlockStatement();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestart();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c23(s1, s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseForStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

      var key    = peg$currPos * 171 + 17,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefor();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseVariableDeclaration();
            if (s4 === peg$FAILED) {
              s4 = peg$parseAssignmentExpression();
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 59) {
                  s6 = peg$c24;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c25); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseAssignmentExpression();
                    if (s8 === peg$FAILED) {
                      s8 = peg$c3;
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse_();
                      if (s9 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 59) {
                          s10 = peg$c24;
                          peg$currPos++;
                        } else {
                          s10 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c25); }
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parse_();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseAssignmentExpression();
                            if (s12 === peg$FAILED) {
                              s12 = peg$c3;
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseBlockStatement();
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parsestart();
                                if (s14 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  s1 = peg$c26(s1, s4, s8, s12, s13, s14);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseArrayComprehension() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 18,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c27;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseAssignmentExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseForInOfHead();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s8 = peg$c29;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c30); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsestart();
                      if (s9 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c31(s1, s4, s6, s9);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBlockStatement() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 19,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseindent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeol();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseStatement();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseStatement();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseoutdent();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c32(s3, s4, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseClassExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      var key    = peg$currPos * 171 + 20,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseclass();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseclassName();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseclassExtends();
                if (s6 === peg$FAILED) {
                  s6 = peg$c3;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseBlockStatement();
                  if (s7 === peg$FAILED) {
                    s7 = peg$c3;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsestart();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c33(s1, s4, s6, s7, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseclassName() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 21,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseIdentifier();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c34(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c27;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseAssignmentExpression();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s5 = peg$c29;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c30); }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c35(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseclassExtends() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 22,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseextends();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseelementList();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c36(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsepath() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 23,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseIdentifier();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s4 = peg$c37;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c38); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseIdentifier();
          if (s5 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c13(s5);
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c37;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c38); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseIdentifier();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c13(s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsePropertyDeclaration() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      var key    = peg$currPos * 171 + 24,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepath();
        if (s2 === peg$FAILED) {
          s2 = peg$parseIdentifier();
          if (s2 === peg$FAILED) {
            s2 = peg$parseStringOrNumberLiteral();
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c40;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c41); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseRightHandSideExpression();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsestart();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c42(s1, s2, s6, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 91) {
            s2 = peg$c27;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c28); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseAssignmentExpression();
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s6 = peg$c29;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c30); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s8 = peg$c40;
                        peg$currPos++;
                      } else {
                        s8 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c41); }
                      }
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parse_();
                        if (s9 !== peg$FAILED) {
                          s10 = peg$parseRightHandSideExpression();
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parsestart();
                            if (s11 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              s1 = peg$c43(s1, s4, s10, s11);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseVariableDeclaration() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 25,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parsevariableKind();
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = peg$c44;
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseVariableDeclarationKindOptional();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseVariableDeclarationKindOptional() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 26,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsevariableKind();
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsevariableDeclaratorList();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c45(s1, s2, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevariableKind() {
      var s0;

      var key    = peg$currPos * 171 + 27,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parselet();
      if (s0 === peg$FAILED) {
        s0 = peg$parseconst();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevariableDeclaratorList() {
      var s0;

      var key    = peg$currPos * 171 + 28,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsemultilineVariableDeclaratorList();
      if (s0 === peg$FAILED) {
        s0 = peg$parseinlineVariableDeclaratorList();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinlineVariableDeclaratorList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 29,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseVariableDeclarator();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c46;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseVariableDeclarator();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c13(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c46;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseVariableDeclarator();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s3;
                  s4 = peg$c13(s7);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineVariableDeclaratorList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 30,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseindent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeol();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseVariableDeclarator();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseeol();
              if (s7 === peg$FAILED) {
                s7 = peg$c3;
              }
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s4;
                s5 = peg$c4(s6);
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseVariableDeclarator();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseeol();
                  if (s7 === peg$FAILED) {
                    s7 = peg$c3;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c4(s6);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseoutdent();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c48(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseVariableDeclarator() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 31,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsePattern();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsevariableInitializer();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c49(s1, s2, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevariableInitializer() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 32,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c50;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRightHandSideExpression();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c4(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsePattern() {
      var s0;

      var key    = peg$currPos * 171 + 33,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseIdentifier();
      if (s0 === peg$FAILED) {
        s0 = peg$parseObjectPattern();
        if (s0 === peg$FAILED) {
          s0 = peg$parseArrayPattern();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseObjectPattern() {
      var s0, s1;

      var key    = peg$currPos * 171 + 34,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseObjectLiteral();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c52(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseArrayPattern() {
      var s0, s1;

      var key    = peg$currPos * 171 + 35,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseArrayLiteral();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c53(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseSpreadPattern() {
      var s0;

      var key    = peg$currPos * 171 + 36,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseSpreadIdentifier();
      if (s0 === peg$FAILED) {
        s0 = peg$parsePattern();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsespread() {
      var s0;

      var key    = peg$currPos * 171 + 37,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (input.substr(peg$currPos, 3) === peg$c54) {
        s0 = peg$c54;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseSpreadExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 38,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespread();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseAssignmentExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c56(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseAssignmentExpression();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseSpreadIdentifier() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 39,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespread();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseIdentifier();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c56(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseIdentifier();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseRightHandSideExpression() {
      var s0;

      var key    = peg$currPos * 171 + 40,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseImpliedObjectExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseExpression();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseExpression() {
      var s0;

      var key    = peg$currPos * 171 + 41,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseMultilineExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseAssignmentExpression();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMultilineExpression() {
      var s0;

      var key    = peg$currPos * 171 + 42,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseClassExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseMultilineStringTemplate();
        if (s0 === peg$FAILED) {
          s0 = peg$parseMultilineStringLiteral();
          if (s0 === peg$FAILED) {
            s0 = peg$parseTypedObjectExpression();
            if (s0 === peg$FAILED) {
              s0 = peg$parseMultilineCallExpression();
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineCallArguments() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 43,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = [];
      s1 = peg$currPos;
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseExpression();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseeol();
          if (s4 !== peg$FAILED) {
            peg$reportedPos = s1;
            s2 = peg$c57(s3);
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$currPos;
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseExpression();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseeol();
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s1;
                s2 = peg$c57(s3);
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        }
      } else {
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsePropertyDeclaration();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseeol();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c58(s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsePropertyDeclaration();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseeol();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s3;
                    s4 = peg$c58(s5);
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            }
          } else {
            s2 = peg$c0;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsestart();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c59(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMultilineCallExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 44,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseGroupExpression();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseindent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeol();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsemultilineCallArguments();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsestart();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseoutdent();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c60(s1, s2, s5, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseAssignmentExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 45,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseConditionalOrDefaultExpression();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s4 = peg$c50;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c51); }
            }
            if (s4 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c61) {
                s4 = peg$c61;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s4 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c63) {
                  s4 = peg$c63;
                  peg$currPos += 2;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c64); }
                }
                if (s4 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c65) {
                    s4 = peg$c65;
                    peg$currPos += 2;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c66); }
                  }
                  if (s4 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c67) {
                      s4 = peg$c67;
                      peg$currPos += 2;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c68); }
                    }
                    if (s4 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c69) {
                        s4 = peg$c69;
                        peg$currPos += 2;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c70); }
                      }
                      if (s4 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c71) {
                          s4 = peg$c71;
                          peg$currPos += 3;
                        } else {
                          s4 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c72); }
                        }
                        if (s4 === peg$FAILED) {
                          if (input.substr(peg$currPos, 3) === peg$c73) {
                            s4 = peg$c73;
                            peg$currPos += 3;
                          } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c74); }
                          }
                          if (s4 === peg$FAILED) {
                            if (input.substr(peg$currPos, 4) === peg$c75) {
                              s4 = peg$c75;
                              peg$currPos += 4;
                            } else {
                              s4 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c76); }
                            }
                            if (s4 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c67) {
                                s4 = peg$c67;
                                peg$currPos += 2;
                              } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c68); }
                              }
                              if (s4 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c77) {
                                  s4 = peg$c77;
                                  peg$currPos += 2;
                                } else {
                                  s4 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c78); }
                                }
                                if (s4 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 2) === peg$c79) {
                                    s4 = peg$c79;
                                    peg$currPos += 2;
                                  } else {
                                    s4 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c80); }
                                  }
                                  if (s4 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 3) === peg$c81) {
                                      s4 = peg$c81;
                                      peg$currPos += 3;
                                    } else {
                                      s4 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c82); }
                                    }
                                    if (s4 === peg$FAILED) {
                                      if (input.substr(peg$currPos, 2) === peg$c83) {
                                        s4 = peg$c83;
                                        peg$currPos += 2;
                                      } else {
                                        s4 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c84); }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseRightHandSideExpression();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsestart();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c85(s1, s2, s4, s6, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseConditionalOrDefaultExpression();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseConditionalOrDefaultExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      var key    = peg$currPos * 171 + 46,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseLogicalOrExpression();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 63) {
              s4 = peg$c86;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c87); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseConditionalOrDefaultExpression();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s8 = peg$c40;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c41); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse_();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseConditionalOrDefaultExpression();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsestart();
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c88(s1, s2, s6, s10, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseLogicalOrExpression();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c89) {
                s6 = peg$c89;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c90); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 63) {
                  s6 = peg$c86;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c87); }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseLogicalOrExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c89) {
                  s6 = peg$c89;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c90); }
                }
                if (s6 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 63) {
                    s6 = peg$c86;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c87); }
                  }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseLogicalOrExpression();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsestart();
                      if (s9 !== peg$FAILED) {
                        s5 = [s5, s6, s7, s8, s9];
                        s4 = s5;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$c0;
                      }
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c91(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseLogicalOrExpression();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseLogicalOrExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 47,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseLogicalAndExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseor();
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseLogicalAndExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseor();
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseLogicalAndExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseLogicalAndExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 48,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBitwiseOrExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseand();
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseBitwiseOrExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseand();
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseBitwiseOrExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBitwiseOrExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 49,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBitwiseXorExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 124) {
              s6 = peg$c92;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c93); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseBitwiseXorExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 124) {
                s6 = peg$c92;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c93); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseBitwiseXorExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBitwiseXorExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 50,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBitwiseAndExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 94) {
              s6 = peg$c94;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c95); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseBitwiseAndExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 94) {
                s6 = peg$c94;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c95); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseBitwiseAndExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBitwiseAndExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 51,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEqualityExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 38) {
              s6 = peg$c96;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c97); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseEqualityExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 38) {
                s6 = peg$c96;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c97); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseEqualityExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseEqualityExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 52,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseRelationalExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseis();
            if (s6 === peg$FAILED) {
              s6 = peg$parseisnt();
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseRelationalExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseis();
              if (s6 === peg$FAILED) {
                s6 = peg$parseisnt();
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseRelationalExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseRelationalExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 53,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBitwiseShiftExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c98) {
              s6 = peg$c98;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c99); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c100) {
                s6 = peg$c100;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c101); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 60) {
                  s6 = peg$c102;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c103); }
                }
                if (s6 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 62) {
                    s6 = peg$c104;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c105); }
                  }
                  if (s6 === peg$FAILED) {
                    s6 = peg$parsein();
                    if (s6 === peg$FAILED) {
                      s6 = peg$parseinstanceof();
                    }
                  }
                }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseBitwiseShiftExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c98) {
                s6 = peg$c98;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c99); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c100) {
                  s6 = peg$c100;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c101); }
                }
                if (s6 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 60) {
                    s6 = peg$c102;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c103); }
                  }
                  if (s6 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s6 = peg$c104;
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c105); }
                    }
                    if (s6 === peg$FAILED) {
                      s6 = peg$parsein();
                      if (s6 === peg$FAILED) {
                        s6 = peg$parseinstanceof();
                      }
                    }
                  }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseBitwiseShiftExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseBitwiseShiftExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 54,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseAdditiveExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c106) {
              s6 = peg$c106;
              peg$currPos += 3;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c107); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c108) {
                s6 = peg$c108;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c109); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c110) {
                  s6 = peg$c110;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c111); }
                }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseAdditiveExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c106) {
                s6 = peg$c106;
                peg$currPos += 3;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c107); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c108) {
                  s6 = peg$c108;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c109); }
                }
                if (s6 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c110) {
                    s6 = peg$c110;
                    peg$currPos += 2;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c111); }
                  }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseAdditiveExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseAdditiveExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 55,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseMultiplicativeExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s6 = peg$c112;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c113); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s6 = peg$c114;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c115); }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseMultiplicativeExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 43) {
                s6 = peg$c112;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c113); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 45) {
                  s6 = peg$c114;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c115); }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseMultiplicativeExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMultiplicativeExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      var key    = peg$currPos * 171 + 56,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseUnaryExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 42) {
              s6 = peg$c116;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c117); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s6 = peg$c118;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c119); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 37) {
                  s6 = peg$c120;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c121); }
                }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseUnaryExpression();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsestart();
                  if (s9 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 42) {
                s6 = peg$c116;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c117); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 47) {
                  s6 = peg$c118;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c119); }
                }
                if (s6 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 37) {
                    s6 = peg$c120;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c121); }
                  }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseUnaryExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsestart();
                    if (s9 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c91(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseUnaryExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 57,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseunaryOperator();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseUpdateExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c122(s1, s2, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseUpdateExpression();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunaryOperator() {
      var s0, s1;

      var key    = peg$currPos * 171 + 58,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$parsenot();
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s0 = peg$c114;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c115); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 43) {
            s0 = peg$c112;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c113); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 126) {
              s0 = peg$c124;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c125); }
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parsetypeof();
              if (s0 === peg$FAILED) {
                s0 = peg$parsevoid();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsedelete();
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseUpdateExpression() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 59,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c126) {
          s2 = peg$c126;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c128) {
            s2 = peg$c128;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c129); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseCallExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestart();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c130(s1, s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseCallExpression();
            if (s3 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c126) {
                s4 = peg$c126;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c127); }
              }
              if (s4 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c128) {
                  s4 = peg$c128;
                  peg$currPos += 2;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c129); }
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsestart();
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c131(s1, s3, s4, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsestart();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseCallExpression();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 63) {
                  s4 = peg$c86;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c87); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s6 = peg$c37;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c38); }
                  }
                  peg$silentFails--;
                  if (s6 === peg$FAILED) {
                    s5 = peg$c44;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsestart();
                    if (s6 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c132(s1, s3, s4, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseCallExpression();
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseCallExpression() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 60,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseMemberExpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsetailCall();
          if (s4 === peg$FAILED) {
            s4 = peg$parsetailMember();
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsetailCall();
            if (s4 === peg$FAILED) {
              s4 = peg$parsetailMember();
            }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c133(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetailCall() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 61,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 63) {
          s3 = peg$c86;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
        }
        if (s3 !== peg$FAILED) {
          peg$reportedPos = s2;
          s3 = peg$c134();
        }
        s2 = s3;
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsearguments();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestart();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c135(s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetailMember() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      var key    = peg$currPos * 171 + 62,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 63) {
          s3 = peg$c86;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
        }
        if (s3 !== peg$FAILED) {
          peg$reportedPos = s2;
          s3 = peg$c134();
        }
        s2 = s3;
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 91) {
            s3 = peg$c27;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c28); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseAssignmentExpression();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s7 = peg$c29;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c30); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsestart();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c136(s2, s5, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 63) {
            s3 = peg$c86;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c87); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s2;
            s3 = peg$c134();
          }
          s2 = s3;
          if (s2 === peg$FAILED) {
            s2 = peg$c3;
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s3 = peg$c37;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c38); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseIdentifier();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsestart();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c137(s2, s5, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsearguments() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 63,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c138;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseargumentList();
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c140;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c141); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c142(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseargumentList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 64,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseAssignmentExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c46;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseAssignmentExpression();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c143(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c46;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseAssignmentExpression();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s3;
                  s4 = peg$c143(s7);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c144(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMemberExpression() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 65,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseDoExpression();
        if (s2 === peg$FAILED) {
          s2 = peg$parseImportExpression();
          if (s2 === peg$FAILED) {
            s2 = peg$parseFunctionExpression();
            if (s2 === peg$FAILED) {
              s2 = peg$parseNewExpression();
              if (s2 === peg$FAILED) {
                s2 = peg$parsePrimaryExpression();
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsetailMember();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsetailMember();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c133(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseNewExpression() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 66,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenew();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseMemberExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsearguments();
              if (s5 === peg$FAILED) {
                s5 = peg$c3;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsestart();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c145(s1, s4, s5, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseImportExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 67,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseimport();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseAssignmentExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c146(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseDoExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 68,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedo();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseExpression();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c147(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseFunctionExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      var key    = peg$currPos * 171 + 69,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetemplate();
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseIdentifier();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseformalParameterList();
                if (s6 === peg$FAILED) {
                  s6 = peg$c3;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c148) {
                      s9 = peg$c148;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c149); }
                    }
                    if (s9 !== peg$FAILED) {
                      peg$reportedPos = s8;
                      s9 = peg$c150();
                    }
                    s8 = s9;
                    if (s8 === peg$FAILED) {
                      s8 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c151) {
                        s9 = peg$c151;
                        peg$currPos += 2;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c152); }
                      }
                      if (s9 !== peg$FAILED) {
                        peg$reportedPos = s8;
                        s9 = peg$c153();
                      }
                      s8 = s9;
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse_();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseAssignmentExpression();
                        if (s10 === peg$FAILED) {
                          s10 = peg$parseThrowStatement();
                          if (s10 === peg$FAILED) {
                            s10 = peg$parseBlockStatement();
                          }
                        }
                        if (s10 === peg$FAILED) {
                          s10 = peg$c3;
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsestart();
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c154(s1, s2, s4, s6, s8, s10, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseformalParameterList() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 70,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c138;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseformalParameters();
          if (s3 === peg$FAILED) {
            s3 = peg$c3;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c140;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c141); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c155(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseformalParameters() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 71,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseformalParameter();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c46;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseformalParameter();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c4(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c46;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseformalParameter();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s3;
                  s4 = peg$c4(s7);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseformalParameter() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 72,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseSpreadPattern();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseformalParameterInitializer();
          if (s3 === peg$FAILED) {
            s3 = peg$c3;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c156(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseformalParameterInitializer() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 73,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c50;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignmentExpression();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c4(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsePrimaryExpression() {
      var s0, s1;

      var key    = peg$currPos * 171 + 74,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$parseThisExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseIdentifier();
        if (s0 === peg$FAILED) {
          s0 = peg$parseLiteral();
          if (s0 === peg$FAILED) {
            s0 = peg$parseArrayLiteral();
            if (s0 === peg$FAILED) {
              s0 = peg$parseArrayComprehension();
              if (s0 === peg$FAILED) {
                s0 = peg$parseObjectLiteral();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseGroupExpression();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseJavascriptExpression();
                  }
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c157); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseJavascriptExpression() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 75,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 96) {
          s2 = peg$c158;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c159); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$currPos;
          peg$silentFails++;
          if (input.charCodeAt(peg$currPos) === 96) {
            s6 = peg$c158;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c159); }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = peg$c44;
          } else {
            peg$currPos = s5;
            s5 = peg$c0;
          }
          if (s5 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c160); }
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 96) {
                s6 = peg$c158;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c159); }
              }
              peg$silentFails--;
              if (s6 === peg$FAILED) {
                s5 = peg$c44;
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c160); }
                }
                if (s6 !== peg$FAILED) {
                  s5 = [s5, s6];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 96) {
              s4 = peg$c158;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c159); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c161(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseArrayLiteral() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 76,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c27;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseelementList();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s6 = peg$c29;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c30); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsestart();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c162(s1, s4, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseelementList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 77,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseAssignmentExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c46;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseAssignmentExpression();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c163(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c46;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseAssignmentExpression();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s3;
                  s4 = peg$c163(s7);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseObjectLiteral() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 78,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 123) {
          s2 = peg$c164;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c165); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsepropertyAssignmentList();
            if (s4 === peg$FAILED) {
              s4 = peg$c3;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s6 = peg$c166;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c167); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsestart();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c168(s1, s4, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsepropertyAssignmentList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 79,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsepropertyAssignment();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c46;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsepropertyAssignment();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c163(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c46;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsepropertyAssignment();
                if (s7 !== peg$FAILED) {
                  peg$reportedPos = s3;
                  s4 = peg$c163(s7);
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsepropertyAssignment() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 80,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsePropertyDeclaration();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseIdentifierName();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsestart();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c169(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseTypedObjectExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 81,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c138;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c139); }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignmentExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseBlockStatement();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c170(s1, s3, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseImpliedObjectExpression() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 82,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBlockStatement();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c171(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseGroupExpression() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 83,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c138;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignmentExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c140;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c141); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c173(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c172); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseIdentifier() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 84,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parsereserved();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c44;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIdentifierName();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c174(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseIdentifierName() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 85,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseidentifierName();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestart();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c175(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseThisExpression() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 86,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c177) {
          s2 = peg$c177;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c178); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifierName();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestart();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c179(s1, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 64) {
            s2 = peg$c180;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c181); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseIdentifierName();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsestart();
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c182(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsestart();
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c177) {
              s2 = peg$c177;
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c178); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsestart();
              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c183(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsestart();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsethis();
              if (s2 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 64) {
                  s2 = peg$c180;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c181); }
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsestart();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c184(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c176); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseStringOrNumberLiteral() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 87,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parsesimpleString();
      if (s2 === peg$FAILED) {
        s2 = peg$parsenumber();
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = peg$c44;
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseLiteral();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c174(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseLiteral() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 88,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$parseStringTemplate();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestart();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsenumber();
          if (s2 === peg$FAILED) {
            s2 = peg$parsesimpleString();
            if (s2 === peg$FAILED) {
              s2 = peg$parseboolean();
              if (s2 === peg$FAILED) {
                s2 = peg$parseregex();
                if (s2 === peg$FAILED) {
                  s2 = peg$parsenull();
                }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsestart();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c186(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsestart();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseundefined();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsestart();
              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c187(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c185); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestart() {
      var s0, s1;

      var key    = peg$currPos * 171 + 89,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      peg$reportedPos = peg$currPos;
      s1 = peg$c134();
      if (s1) {
        s1 = peg$c44;
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c188();
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1;

      var key    = peg$currPos * 171 + 90,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      peg$reportedPos = peg$currPos;
      s1 = peg$c134();
      if (s1) {
        s1 = peg$c44;
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c189();
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseboolean() {
      var s0;

      var key    = peg$currPos * 171 + 91,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsetrue();
      if (s0 === peg$FAILED) {
        s0 = peg$parsefalse();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseregex() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 92,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c118;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseregexBody();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s3 = peg$c118;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c119); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseregexOptions();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c190(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseregexBody() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 93,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s3 = peg$c191;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c192); }
      }
      if (s3 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c160); }
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c0;
      }
      if (s2 === peg$FAILED) {
        if (peg$c193.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c194); }
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s3 = peg$c191;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c192); }
        }
        if (s3 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c160); }
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          if (peg$c193.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c194); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseregexOptions() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 94,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      if (peg$c195.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c196); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c195.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c196); }
        }
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsesimpleString() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      var key    = peg$currPos * 171 + 95,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c197;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c198); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s4 = peg$c191;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c192); }
        }
        if (s4 !== peg$FAILED) {
          if (peg$c199.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c200); }
          }
          if (s5 === peg$FAILED) {
            s5 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 117) {
              s6 = peg$c201;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c202); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parsehexDigit();
              if (s7 !== peg$FAILED) {
                s8 = peg$parsehexDigit();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsehexDigit();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$parsehexDigit();
                    if (s10 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9, s10];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c0;
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 === peg$FAILED) {
          if (peg$c203.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c204); }
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s4 = peg$c191;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c192); }
          }
          if (s4 !== peg$FAILED) {
            if (peg$c199.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c200); }
            }
            if (s5 === peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 117) {
                s6 = peg$c201;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c202); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsehexDigit();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsehexDigit();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsehexDigit();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsehexDigit();
                      if (s10 !== peg$FAILED) {
                        s6 = [s6, s7, s8, s9, s10];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$c0;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            if (peg$c203.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c204); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c197;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c198); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c205();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c206;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c207); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s4 = peg$c191;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c192); }
          }
          if (s4 !== peg$FAILED) {
            if (peg$c208.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c209); }
            }
            if (s5 === peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 117) {
                s6 = peg$c201;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c202); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsehexDigit();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsehexDigit();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsehexDigit();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsehexDigit();
                      if (s10 !== peg$FAILED) {
                        s6 = [s6, s7, s8, s9, s10];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$c0;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            if (peg$c210.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c211); }
            }
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s4 = peg$c191;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c192); }
            }
            if (s4 !== peg$FAILED) {
              if (peg$c208.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c209); }
              }
              if (s5 === peg$FAILED) {
                s5 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 117) {
                  s6 = peg$c201;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c202); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsehexDigit();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsehexDigit();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsehexDigit();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsehexDigit();
                        if (s10 !== peg$FAILED) {
                          s6 = [s6, s7, s8, s9, s10];
                          s5 = s6;
                        } else {
                          peg$currPos = s5;
                          s5 = peg$c0;
                        }
                      } else {
                        peg$currPos = s5;
                        s5 = peg$c0;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
            if (s3 === peg$FAILED) {
              if (peg$c210.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c211); }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s3 = peg$c206;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c207); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c205();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMultilineStringTemplate() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 96,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c212) {
          s2 = peg$c212;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c213); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseeol();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemultilineStringTemplateContent();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c214(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineStringTemplateContent() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 97,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseindent();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemultilineStringTemplateLine();
        if (s3 === peg$FAILED) {
          s3 = peg$parsemultilineStringTemplateContent();
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsemultilineStringTemplateLine();
          if (s3 === peg$FAILED) {
            s3 = peg$parsemultilineStringTemplateContent();
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseoutdent();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c215(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineStringTemplateLine() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 98,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseindent();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c44;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseoutdent();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestringInterpolation();
          if (s3 === peg$FAILED) {
            s3 = peg$parsemultilineStringTemplatePart();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c4(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineStringTemplatePart() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 99,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseeol();
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c216) {
          s5 = peg$c216;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c217); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c44;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$currPos;
          peg$silentFails++;
          s6 = peg$parseeol();
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = peg$c44;
          } else {
            peg$currPos = s5;
            s5 = peg$c0;
          }
          if (s5 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c160); }
            }
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c216) {
              s5 = peg$c216;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c217); }
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = peg$c44;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              peg$silentFails++;
              s6 = peg$parseeol();
              peg$silentFails--;
              if (s6 === peg$FAILED) {
                s5 = peg$c44;
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c160); }
                }
                if (s6 !== peg$FAILED) {
                  s4 = [s4, s5, s6];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c218();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseMultilineStringLiteral() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 100,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsestart();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c219) {
          s2 = peg$c219;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c220); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseeol();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemultilineStringLiteralContent();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsestart();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c214(s1, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineStringLiteralContent() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 101,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseindent();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsemultilineStringLiteralLine();
        if (s3 === peg$FAILED) {
          s3 = peg$parsemultilineStringLiteralContent();
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsemultilineStringLiteralLine();
          if (s3 === peg$FAILED) {
            s3 = peg$parsemultilineStringLiteralContent();
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseoutdent();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c215(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultilineStringLiteralLine() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 102,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseindent();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c44;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseoutdent();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseeol();
          if (s3 === peg$FAILED) {
            s3 = peg$c3;
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$currPos;
            peg$silentFails++;
            s7 = peg$parseeol();
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = peg$c44;
            } else {
              peg$currPos = s6;
              s6 = peg$c0;
            }
            if (s6 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c160); }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c0;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$currPos;
                peg$silentFails++;
                s7 = peg$parseeol();
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                  s6 = peg$c44;
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                if (s6 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c160); }
                  }
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c218();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestringInterpolation() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 103,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c216) {
        s1 = peg$c216;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c217); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignmentExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c221) {
                s5 = peg$c221;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c222); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c173(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseStringTemplate() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 104,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c206;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c207); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsestringTemplateChars();
        if (s3 === peg$FAILED) {
          s3 = peg$parsestringInterpolation();
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsestringTemplateChars();
          if (s3 === peg$FAILED) {
            s3 = peg$parsestringInterpolation();
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c206;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c207); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c223(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestringTemplateChars() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 105,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsestringTemplateChar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsestringTemplateChar();
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c224();
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestringTemplateChar() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 106,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c191;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c192); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c208.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c209); }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 117) {
          s1 = peg$c201;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c202); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsehexDigit();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsehexDigit();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsehexDigit();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsehexDigit();
                if (s5 !== peg$FAILED) {
                  s1 = [s1, s2, s3, s4, s5];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c216) {
          s2 = peg$c216;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c217); }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = peg$c44;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
        if (s1 !== peg$FAILED) {
          if (peg$c210.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c211); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsenumber() {
      var s0;

      var key    = peg$currPos * 171 + 107,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsedecimal();
      if (s0 === peg$FAILED) {
        s0 = peg$parsehexInteger();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedecimal() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 108,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (peg$c225.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c226); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsedecimalInteger();
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s5 = peg$c37;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c38); }
          }
          if (s5 !== peg$FAILED) {
            s6 = [];
            s7 = peg$parsedecimalDigit();
            if (s7 !== peg$FAILED) {
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$parsedecimalDigit();
              }
            } else {
              s6 = peg$c0;
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 === peg$FAILED) {
            s4 = peg$c3;
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s3 = peg$c37;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c38); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsedecimalDigit();
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsedecimalDigit();
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (peg$c227.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c228); }
          }
          if (s4 !== peg$FAILED) {
            if (peg$c225.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c226); }
            }
            if (s5 === peg$FAILED) {
              s5 = peg$c3;
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$parsedecimalDigit();
              if (s7 !== peg$FAILED) {
                while (s7 !== peg$FAILED) {
                  s6.push(s7);
                  s7 = peg$parsedecimalDigit();
                }
              } else {
                s6 = peg$c0;
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c3;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseidentifierPart();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = peg$c44;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c229();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinteger() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 109,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (peg$c225.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c226); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedecimalInteger();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          s4 = peg$parseidentifierPart();
          peg$silentFails--;
          if (s4 === peg$FAILED) {
            s3 = peg$c44;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c230();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedecimalDigit() {
      var s0;

      var key    = peg$currPos * 171 + 110,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c231.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c232); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsenonzeroDigit() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 111,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 48) {
        s2 = peg$c233;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c234); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c44;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedecimalDigit();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedecimalInteger() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 112,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (input.charCodeAt(peg$currPos) === 48) {
        s0 = peg$c233;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c234); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsenonzeroDigit();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parsedecimalDigit();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsedecimalDigit();
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsehexInteger() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 113,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c235) {
        s1 = peg$c235;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c236); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsehexDigit();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsehexDigit();
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c237();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      var key    = peg$currPos * 171 + 114,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c238.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c239); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseidentifier() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 115,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parsereserved();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = peg$c44;
      } else {
        peg$currPos = s2;
        s2 = peg$c0;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseidentifierName();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c240); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseidentifierName() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 171 + 116,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseidentifierStart();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseidentifierPart();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseidentifierPart();
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseidentifierStart() {
      var s0;

      var key    = peg$currPos * 171 + 117,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseunicodeLetter();
      if (s0 === peg$FAILED) {
        if (peg$c242.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c243); }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseunicodeEscapeSequence();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseidentifierPart() {
      var s0;

      var key    = peg$currPos * 171 + 118,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseidentifierStart();
      if (s0 === peg$FAILED) {
        s0 = peg$parseunicodeCombiningMark();
        if (s0 === peg$FAILED) {
          s0 = peg$parseunicodeDigit();
          if (s0 === peg$FAILED) {
            s0 = peg$parseunicodeConnectorPunctuation();
            if (s0 === peg$FAILED) {
              s0 = peg$parsezwnj();
              if (s0 === peg$FAILED) {
                s0 = peg$parsezwj();
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunicodeEscapeSequence() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 171 + 119,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c244) {
        s1 = peg$c244;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c245); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsehexDigit();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsehexDigit();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsehexDigit();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsehexDigit();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c246(s2, s3, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunicodeLetter() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 120,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c247.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c248); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 55340) {
          s1 = peg$c249;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c250); }
        }
        if (s1 !== peg$FAILED) {
          if (peg$c251.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c252); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 55304) {
            s1 = peg$c253;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c254); }
          }
          if (s1 !== peg$FAILED) {
            if (peg$c255.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c256); }
            }
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 55401) {
              s1 = peg$c257;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c258); }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c259.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c260); }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 55305) {
                s1 = peg$c261;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c262); }
              }
              if (s1 !== peg$FAILED) {
                if (peg$c263.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c264); }
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 55349) {
                  s1 = peg$c265;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c266); }
                }
                if (s1 !== peg$FAILED) {
                  if (peg$c267.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c268); }
                  }
                  if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 55300) {
                    s1 = peg$c269;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c270); }
                  }
                  if (s1 !== peg$FAILED) {
                    if (peg$c271.test(input.charAt(peg$currPos))) {
                      s2 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c272); }
                    }
                    if (s2 !== peg$FAILED) {
                      s1 = [s1, s2];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 55296) {
                      s1 = peg$c273;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c274); }
                    }
                    if (s1 !== peg$FAILED) {
                      if (peg$c275.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c276); }
                      }
                      if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 55308) {
                        s1 = peg$c277;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c278); }
                      }
                      if (s1 !== peg$FAILED) {
                        if (peg$c279.test(input.charAt(peg$currPos))) {
                          s2 = input.charAt(peg$currPos);
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c280); }
                        }
                        if (s2 !== peg$FAILED) {
                          s1 = [s1, s2];
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 55297) {
                          s1 = peg$c281;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c282); }
                        }
                        if (s1 !== peg$FAILED) {
                          if (peg$c283.test(input.charAt(peg$currPos))) {
                            s2 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c284); }
                          }
                          if (s2 !== peg$FAILED) {
                            s1 = [s1, s2];
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 55406) {
                            s1 = peg$c285;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c286); }
                          }
                          if (s1 !== peg$FAILED) {
                            if (peg$c287.test(input.charAt(peg$currPos))) {
                              s2 = input.charAt(peg$currPos);
                              peg$currPos++;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c288); }
                            }
                            if (s2 !== peg$FAILED) {
                              s1 = [s1, s2];
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 55299) {
                              s1 = peg$c289;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c290); }
                            }
                            if (s1 !== peg$FAILED) {
                              if (peg$c291.test(input.charAt(peg$currPos))) {
                                s2 = input.charAt(peg$currPos);
                                peg$currPos++;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c292); }
                              }
                              if (s2 !== peg$FAILED) {
                                s1 = [s1, s2];
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 55360) {
                                s1 = peg$c293;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c294); }
                              }
                              if (s1 !== peg$FAILED) {
                                if (peg$c295.test(input.charAt(peg$currPos))) {
                                  s2 = input.charAt(peg$currPos);
                                  peg$currPos++;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c296); }
                                }
                                if (s2 !== peg$FAILED) {
                                  s1 = [s1, s2];
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 55422) {
                                  s1 = peg$c297;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c298); }
                                }
                                if (s1 !== peg$FAILED) {
                                  if (peg$c299.test(input.charAt(peg$currPos))) {
                                    s2 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c300); }
                                  }
                                  if (s2 !== peg$FAILED) {
                                    s1 = [s1, s2];
                                    s0 = s1;
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 55405) {
                                    s1 = peg$c301;
                                    peg$currPos++;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c302); }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    if (peg$c303.test(input.charAt(peg$currPos))) {
                                      s2 = input.charAt(peg$currPos);
                                      peg$currPos++;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c304); }
                                    }
                                    if (s2 !== peg$FAILED) {
                                      s1 = [s1, s2];
                                      s0 = s1;
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 55322) {
                                      s1 = peg$c305;
                                      peg$currPos++;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c306); }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      if (peg$c307.test(input.charAt(peg$currPos))) {
                                        s2 = input.charAt(peg$currPos);
                                        peg$currPos++;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c308); }
                                      }
                                      if (s2 !== peg$FAILED) {
                                        s1 = [s1, s2];
                                        s0 = s1;
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 55298) {
                                        s1 = peg$c309;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c310); }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        if (peg$c311.test(input.charAt(peg$currPos))) {
                                          s2 = input.charAt(peg$currPos);
                                          peg$currPos++;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c312); }
                                        }
                                        if (s2 !== peg$FAILED) {
                                          s1 = [s1, s2];
                                          s0 = s1;
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 55309) {
                                          s1 = peg$c313;
                                          peg$currPos++;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c314); }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          if (peg$c315.test(input.charAt(peg$currPos))) {
                                            s2 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                          } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c316); }
                                          }
                                          if (s2 !== peg$FAILED) {
                                            s1 = [s1, s2];
                                            s0 = s1;
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c0;
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunicodeCombiningMark() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 121,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c317.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c318); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 56128) {
          s1 = peg$c319;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c320); }
        }
        if (s1 !== peg$FAILED) {
          if (peg$c321.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c322); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 55348) {
            s1 = peg$c323;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c324); }
          }
          if (s1 !== peg$FAILED) {
            if (peg$c325.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c326); }
            }
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 55300) {
              s1 = peg$c269;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c270); }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c327.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c328); }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 55296) {
                s1 = peg$c273;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c274); }
              }
              if (s1 !== peg$FAILED) {
                if (peg$c329.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c330); }
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 55298) {
                  s1 = peg$c309;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c310); }
                }
                if (s1 !== peg$FAILED) {
                  if (peg$c331.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c332); }
                  }
                  if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunicodeDigit() {
      var s0, s1, s2;

      var key    = peg$currPos * 171 + 122,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c333.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c334); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 55349) {
          s1 = peg$c265;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c266); }
        }
        if (s1 !== peg$FAILED) {
          if (peg$c335.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c336); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 55300) {
            s1 = peg$c269;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c270); }
          }
          if (s1 !== peg$FAILED) {
            if (peg$c337.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c338); }
            }
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 55297) {
              s1 = peg$c281;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c282); }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c339.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c340); }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseunicodeConnectorPunctuation() {
      var s0;

      var key    = peg$currPos * 171 + 123,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c341.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c342); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsezwnj() {
      var s0;

      var key    = peg$currPos * 171 + 124,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (input.charCodeAt(peg$currPos) === 8204) {
        s0 = peg$c343;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c344); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsezwj() {
      var s0;

      var key    = peg$currPos * 171 + 125,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (input.charCodeAt(peg$currPos) === 8205) {
        s0 = peg$c345;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c346); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsereserved() {
      var s0;

      var key    = peg$currPos * 171 + 126,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsenull();
      if (s0 === peg$FAILED) {
        s0 = peg$parseundefined();
        if (s0 === peg$FAILED) {
          s0 = peg$parsetypeof();
          if (s0 === peg$FAILED) {
            s0 = peg$parsevoid();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedelete();
              if (s0 === peg$FAILED) {
                s0 = peg$parsenew();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsetrue();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsefalse();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsevar();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseconst();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parselet();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parsewhile();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parsefor();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parsein();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parseof();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseif();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parseelse();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsereturn();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parsetry();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parsecatch();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parsefinally();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parsethrow();
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$parsebreak();
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$parsecontinue();
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parsedo();
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$parseimport();
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$parseexport();
                                                          if (s0 === peg$FAILED) {
                                                            s0 = peg$parseclass();
                                                            if (s0 === peg$FAILED) {
                                                              s0 = peg$parseextends();
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetrue() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 127,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c347) {
        s1 = peg$c347;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c348); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c153();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefalse() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 128,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c349) {
        s1 = peg$c349;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c350); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c150();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsenew() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 129,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c351) {
        s1 = peg$c351;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c352); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsethis() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 130,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c353) {
        s1 = peg$c353;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c354); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsenull() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 131,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c355) {
        s1 = peg$c355;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c356); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c357();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseundefined() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 132,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c358) {
        s1 = peg$c358;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c359); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c360();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseand() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 133,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c361) {
        s1 = peg$c361;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c362); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c363();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseor() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 134,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c364) {
        s1 = peg$c364;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c365); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c366();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseis() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 135,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c367) {
        s1 = peg$c367;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c368); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c369();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseisnt() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 136,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c370) {
        s1 = peg$c370;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c371); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c372();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsenot() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 137,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c373) {
        s1 = peg$c373;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c374); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c375();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetypeof() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 138,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c376) {
        s1 = peg$c376;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c377); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c378();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevoid() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 139,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c379) {
        s1 = peg$c379;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c380); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c381();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedelete() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 140,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c382) {
        s1 = peg$c382;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c383); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c384();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevar() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 141,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c385) {
        s1 = peg$c385;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c386); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseconst() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 142,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c387) {
        s1 = peg$c387;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c388); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c389();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parselet() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 143,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c390) {
        s1 = peg$c390;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c391); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c392();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsein() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 144,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c393) {
        s1 = peg$c393;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c394); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c395();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinstanceof() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 145,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c396) {
        s1 = peg$c396;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c397); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c398();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsewhile() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 146,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c399) {
        s1 = peg$c399;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c400); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefor() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 147,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c401) {
        s1 = peg$c401;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c402); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseof() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 148,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c403) {
        s1 = peg$c403;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c404); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseif() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 149,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c405) {
        s1 = peg$c405;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c406); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseelse() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 150,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c407) {
        s1 = peg$c407;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c408); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsereturn() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 151,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c409) {
        s1 = peg$c409;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c410); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetry() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 152,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c411) {
        s1 = peg$c411;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c412); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsecatch() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 153,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c413) {
        s1 = peg$c413;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c414); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefinally() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 154,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c415) {
        s1 = peg$c415;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c416); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsethrow() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 155,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c417) {
        s1 = peg$c417;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c418); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsebreak() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 156,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c419) {
        s1 = peg$c419;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c420); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsecontinue() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 157,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c421) {
        s1 = peg$c421;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c422); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedo() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 158,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c423) {
        s1 = peg$c423;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c424); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseimport() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 159,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c425) {
        s1 = peg$c425;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c426); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseexport() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 160,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c427) {
        s1 = peg$c427;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c428); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseclass() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 161,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c429) {
        s1 = peg$c429;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c430); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseextends() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 162,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c431) {
        s1 = peg$c431;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c432); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseassert() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 163,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c433) {
        s1 = peg$c433;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c434); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetemplate() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 164,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c435) {
        s1 = peg$c435;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c436); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseidentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c44;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseindent() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 165,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseeol();
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c438) {
            s3 = peg$c438;
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c439); }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c437); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseoutdent() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 171 + 166,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseeol();
      if (s1 === peg$FAILED) {
        s1 = peg$c3;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c441) {
            s3 = peg$c441;
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c442); }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c440); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      var key    = peg$currPos * 171 + 167,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c444;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c445); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c444;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c445); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c443); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 171 + 168,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c446;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c447); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$currPos;
          peg$silentFails++;
          if (input.charCodeAt(peg$currPos) === 10) {
            s6 = peg$c448;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c449); }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = peg$c44;
          } else {
            peg$currPos = s5;
            s5 = peg$c0;
          }
          if (s5 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c160); }
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 10) {
                s6 = peg$c448;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c449); }
              }
              peg$silentFails--;
              if (s6 === peg$FAILED) {
                s5 = peg$c44;
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c160); }
                }
                if (s6 !== peg$FAILED) {
                  s5 = [s5, s6];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseeol() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 171 + 169,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecomment();
        if (s2 === peg$FAILED) {
          s2 = peg$c3;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseeof();
          if (s3 === peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 13) {
              s5 = peg$c451;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c452); }
            }
            if (s5 === peg$FAILED) {
              s5 = peg$c3;
            }
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 10) {
                s6 = peg$c448;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c449); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecomment();
                if (s7 === peg$FAILED) {
                  s7 = peg$c3;
                }
                if (s7 !== peg$FAILED) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 13) {
                  s5 = peg$c451;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c452); }
                }
                if (s5 === peg$FAILED) {
                  s5 = peg$c3;
                }
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 10) {
                    s6 = peg$c448;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c449); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsecomment();
                    if (s7 === peg$FAILED) {
                      s7 = peg$c3;
                    }
                    if (s7 !== peg$FAILED) {
                      s5 = [s5, s6, s7];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              }
            } else {
              s3 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c450); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseeof() {
      var s0, s1;

      var key    = peg$currPos * 171 + 170,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      peg$silentFails++;
      s0 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c160); }
      }
      peg$silentFails--;
      if (s1 === peg$FAILED) {
        s0 = peg$c44;
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c453); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }


        var common = require("./common");
        var primitive = {string:true,number:true,boolean:true,function:true}
        function clone(object) {
            if (object === undefined || object === null || object.constructor === RegExp || primitive[typeof object])
                return object
            var copy = Array.isArray(object) ? [] : {}
            for (key in object) {
                var value = object[key]
                copy[key] = clone(value)
            }
            return copy
        }
        function node(type, properties, start, end) {
            var node = {type:type}
            if (properties != null) {
                for (var key in properties) {
                    node[key] = properties[key]
                }
            }
            setLoc(node, start, end)
            return node
        }
        function setLoc(node, start, end) {
            if (options.loc) {
                if (start != null) {
                    node.loc = {start:start}
                    if (end != null)
                        node.loc.end = end
                }
            }
        }
        function thisExpression(start, end, property) {
            var thisExpression = node("ThisExpression", null, start, end);
            for (var i = 2; i < arguments.length; i++) {
                var property = arguments[i]
                if (typeof property === 'string')
                    property = {type:'Identifier', name:property}
                thisExpression = node("MemberExpression", {object:thisExpression,property:property}, start, end);
            }
            return thisExpression;
        }
        function binaryExpression(op, left, right, start, end) {
            return node("BinaryExpression", {operator:op, left:left, right:right}, start, end)
        }
        function leftAssociateBinaryExpressions(start, head, tail) {
            var result = head
            for (var i = 0; i < tail.length; i++)
                result = binaryExpression(tail[i][1], result, tail[i][3], start, tail[i][4])
            return result
        }
        function leftAssociateCallsOrMembers(start, head, tail) {
            var result = head
            for (var i = 0; i < tail.length; i++) {
                var next = tail[i][1]
                setLoc(next, start, tail[i][2])
                next[tail[i][0]] = result
                result = next
            }
            return result
        }
        function unindent(content) {
            //  content consists of strings and/or Expressions
            //  strings that start lines should start with \n
            var minIndent = common.getMinIndent(content, /\n([ ]+)/)
            var replacement = "\n"
            var find = replacement
            var i, line;
            for (i = 0; i < minIndent; i++) {
                find += " "
            }
            for (i = 0; i < content.length; i++) {
                line = content[i]
                if (typeof line === 'string')
                    content[i] = line.replace(find, replacement)
            }

            //  trim the starting /n
            if (typeof content[0] === 'string' && content[0][0] === '\n')
                content[0] = content[0].substring(1)

            // console.log('===============================================')
            // console.log(content)
            // console.log('===============================================')

            joinAdjacentStrings(content)

            // console.log(content)
            // console.log('===============================================')
            return content
        }
        function joinAdjacentStrings(content) {
            for (var i = 1; i < content.length;) {
                var left = content[i - 1]
                var right = content[i]
                if (typeof left === 'string' && typeof right === 'string')
                    content.splice(i - 1, 2, left + right)
                else
                    i++
            }
        }
        function toNode(value) {
            return value.type != null ? value : node("Literal", {value:value})
        }
        function concatenate(content) {
            if (typeof content[0] !== 'string')
                content.unshift("")
            var result = toNode(content.shift())
            while (content.length > 0) {
                var right = toNode(content.shift())
                result = node("BinaryExpression", {operator:"+", left:result, right:right})
            }
            return result
        }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})()
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/parser',_compiler_parser_);
    else
      _compiler_parser_.call(this, module, exports, require);
  }
  else {
    _compiler_parser_.call(this);
  }
}).call(this)
void (function(){var _compiler_postprocessor_ = function(module,exports,require){var addStatement, addUseStrictAndRequireIon, arrayComprehensionsToES5, assertStatements, basicTraverse, block, callFunctionBindForFatArrows, checkVariableDeclarations, classExpressions, convertForInToForLength, createForInLoopValueVariable, createTemplateFunctionClone, createTemplateRuntime, defaultAssignmentsToDefaultOperators, defaultOperatorsToConditionals, destructuringAssignments, ensureIonVariable, existentialExpression, extractForLoopRightVariable, extractForLoopsInnerAndTest, extractReactiveForPatterns, falseExpression, forEachDestructuringAssignment, functionParameterDefaultValuesToES5, getExternalIdentifiers, getPathExpression, ion, ionExpression, isAncestorObjectExpression, isFunctionNode, isPattern, isSuperExpression, javascriptExpressions, namedFunctions, nodeToLiteral, nodejsModules, nodes, nullExpression, propertyStatements, removeLocationInfo, spreadExpressions, superExpressions, thisExpression, traverse, trueExpression, typedObjectExpressions, undefinedExpression, validateTemplateNodes, wrapTemplateInnerFunctions, _ref;

traverse = require('./traverseAst').traverse;

basicTraverse = require('./traverse').traverse;

_ref = require('./astFunctions'), addStatement = _ref.addStatement, forEachDestructuringAssignment = _ref.forEachDestructuringAssignment;

nodes = require('./nodes');

ion = require('../');

undefinedExpression = Object.freeze({
  type: 'UnaryExpression',
  argument: {
    type: 'Literal',
    value: 0
  },
  operator: 'void',
  prefix: true
});

nullExpression = Object.freeze({
  type: 'Literal',
  value: null
});

trueExpression = Object.freeze({
  type: 'Literal',
  value: true
});

falseExpression = Object.freeze({
  type: 'Literal',
  value: false
});

ionExpression = Object.freeze({
  type: 'Identifier',
  name: 'ion'
});

thisExpression = Object.freeze({
  type: 'ThisExpression'
});

isPattern = function(node) {
  return (node.properties != null) || (node.elements != null);
};

getPathExpression = function(path) {
  var i, result, step, steps, _i, _len;
  steps = path.split('.');
  if (steps[0] === 'this') {
    result = {
      type: 'ThisExpression'
    };
  } else {
    result = {
      type: 'Identifier',
      name: steps[0]
    };
  }
  for (i = _i = 0, _len = steps.length; _i < _len; i = ++_i) {
    step = steps[i];
    if (i > 0) {
      result = {
        type: 'MemberExpression',
        object: result,
        property: {
          type: 'Identifier',
          name: step
        }
      };
    }
  }
  return result;
};

isFunctionNode = function(node) {
  var _ref1, _ref2;
  return (_ref1 = (_ref2 = nodes[node != null ? node.type : void 0]) != null ? _ref2.isFunction : void 0) != null ? _ref1 : false;
};

nodeToLiteral = function(object) {
  var item, key, node, value;
  node = null;
  if ((object != null ? object.toLiteral : void 0) != null) {
    node = object != null ? object.toLiteral() : void 0;
  } else if (Array.isArray(object)) {
    node = {
      type: 'ArrayExpression',
      elements: (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = object.length; _i < _len; _i++) {
          item = object[_i];
          _results.push(nodeToLiteral(item));
        }
        return _results;
      })()
    };
  } else if ((object != null ? object.constructor : void 0) === Object) {
    node = {
      type: 'ObjectExpression',
      properties: []
    };
    for (key in object) {
      value = object[key];
      if (value !== void 0) {
        node.properties.push({
          key: {
            type: 'Identifier',
            name: key
          },
          value: nodeToLiteral(value),
          kind: 'init'
        });
      }
    }
  } else {
    node = {
      type: 'Literal',
      value: object
    };
  }
  return node;
};

block = function(node) {
  if (node.type !== 'BlockStatement') {
    node = {
      type: 'BlockStatement',
      body: [node]
    };
  }
  return node;
};

extractReactiveForPatterns = function(node, context) {
  var declarator, index, ref, _i, _len, _ref1, _results;
  if (!context.reactive) {
    return;
  }
  if (node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
    _ref1 = node.left.declarations;
    _results = [];
    for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
      declarator = _ref1[index];
      if (!(isPattern(declarator.id))) {
        continue;
      }
      ref = context.getNewInternalIdentifier();
      context.addStatement({
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: declarator.id,
            init: ref
          }
        ]
      });
      _results.push(declarator.id = ref);
    }
    return _results;
  }
};

extractForLoopRightVariable = function(node, context) {
  var ref, right;
  if (context.reactive) {
    return;
  }
  if (node.type === 'ForOfStatement' || (node.type === 'ForInStatement' && node.left.declarations.length > 1)) {
    if (node.left.declarations.length > 2) {
      throw context.error("too many declarations", node.left.declarations[2]);
    }
    right = node.right;
    if (right.type !== "Identifier") {
      ref = context.getNewInternalIdentifier();
      node.right = ref;
      return context.replace({
        type: "BlockStatement",
        body: [
          {
            type: "VariableDeclaration",
            declarations: [
              {
                type: "VariableDeclarator",
                id: ref,
                init: right
              }
            ],
            kind: node.left.kind
          }, node
        ]
      });
    }
  }
};

createForInLoopValueVariable = function(node, context) {
  var valueDeclarator;
  if (context.reactive) {
    return;
  }
  if (node.type === 'ForInStatement' && node.left.declarations.length > 1) {
    valueDeclarator = node.left.declarations[1];
    return context.addVariable({
      id: valueDeclarator.id,
      init: {
        type: 'MemberExpression',
        computed: true,
        object: node.right,
        property: node.left.declarations[0].id
      }
    });
  }
};

convertForInToForLength = function(node, context) {
  var loopIndex, userIndex, _ref1;
  if (context.reactive) {
    return;
  }
  if (node.type === 'ForOfStatement') {
    userIndex = (_ref1 = node.left.declarations[1]) != null ? _ref1.id : void 0;
    loopIndex = context.getNewInternalIdentifier("_i");
    addStatement(node, {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: node.left.declarations[0].id,
          init: {
            type: "MemberExpression",
            object: node.right,
            property: loopIndex,
            computed: true
          }
        }
      ],
      kind: node.left.kind
    });
    if (userIndex != null) {
      addStatement(node, {
        type: "VariableDeclaration",
        declarations: [
          {
            type: "VariableDeclarator",
            id: userIndex,
            init: loopIndex
          }
        ],
        kind: node.left.kind
      });
    }
    return context.replace({
      type: 'ForStatement',
      init: {
        type: "VariableDeclaration",
        declarations: [
          {
            type: "VariableDeclarator",
            id: loopIndex,
            init: {
              type: "Literal",
              value: 0
            }
          }
        ],
        kind: 'let'
      },
      test: {
        type: "BinaryExpression",
        operator: "<",
        left: loopIndex,
        right: {
          type: "MemberExpression",
          object: node.right,
          property: {
            type: "Identifier",
            name: "length"
          },
          computed: false
        }
      },
      update: {
        type: "UpdateExpression",
        operator: "++",
        argument: loopIndex,
        prefix: false
      },
      body: node.body
    });
  }
};

callFunctionBindForFatArrows = function(node, context) {
  if (node.type === 'FunctionExpression' && node.bound) {
    delete node.bound;
    return context.replace({
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: node,
        property: {
          type: "Identifier",
          name: "bind"
        }
      },
      "arguments": [
        {
          type: "ThisExpression"
        }
      ]
    });
  }
};

nodejsModules = function(node, context) {
  var declarator, _i, _ref1, _results;
  if (node.type === 'ImportExpression') {
    node.type = 'CallExpression';
    node.callee = {
      type: 'Identifier',
      name: 'require'
    };
    node["arguments"] = [node.name];
    return delete node.name;
  } else if (node.type === 'ExportStatement') {
    if (node.value.type === 'VariableDeclaration') {
      context.exports = true;
      context.replace(node.value);
      _ref1 = node.value.declarations;
      _results = [];
      for (_i = _ref1.length - 1; _i >= 0; _i += -1) {
        declarator = _ref1[_i];
        if (declarator.init == null) {
          throw context.error("Export variables must have an init value", declarator);
        }
        _results.push(declarator.init = {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'exports'
            },
            property: declarator.id
          },
          right: declarator.init
        });
      }
      return _results;
    } else {
      if (context.exports) {
        throw context.error("default export must be first");
      }
      return context.replace({
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'module'
            },
            property: {
              type: 'Identifier',
              name: 'exports'
            }
          },
          right: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'Identifier',
              name: 'exports'
            },
            right: node.value
          }
        }
      });
    }
  }
};

destructuringAssignments = function(node, context) {
  var count, declarator, expression, index, pattern, statement, statements, tempId, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2;
  if (isFunctionNode(node)) {
    _ref1 = node.params;
    for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
      pattern = _ref1[index];
      if (!(isPattern(pattern))) {
        continue;
      }
      tempId = context.getNewInternalIdentifier();
      node.params[index] = tempId;
      statements = [];
      forEachDestructuringAssignment(pattern, tempId, function(id, expression) {
        return statements.unshift({
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: id,
              init: expression
            }
          ],
          kind: 'let'
        });
      });
      for (_j = 0, _len1 = statements.length; _j < _len1; _j++) {
        statement = statements[_j];
        context.addStatement(statement);
      }
    }
  }
  if (node.type === 'VariableDeclaration' && context.isParentBlock()) {
    _ref2 = node.declarations;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      declarator = _ref2[_k];
      if (!(isPattern(declarator.id))) {
        continue;
      }
      pattern = declarator.id;
      tempId = context.getNewInternalIdentifier();
      declarator.id = tempId;
      count = 0;
      forEachDestructuringAssignment(pattern, tempId, function(id, expression) {
        return context.addStatement({
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: id,
              init: expression
            }
          ],
          kind: 'let'
        }, ++count);
      });
    }
  }
  if (node.type === 'ExpressionStatement' && node.expression.operator === '=') {
    expression = node.expression;
    pattern = expression.left;
    if (isPattern(pattern)) {
      tempId = context.getNewInternalIdentifier();
      context.replace({
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: tempId,
            init: expression.right
          }
        ],
        kind: 'const'
      });
      count = 0;
      return forEachDestructuringAssignment(pattern, tempId, function(id, expression) {
        return context.addStatement({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: id,
            right: expression
          }
        }, ++count);
      });
    }
  }
};

defaultOperatorsToConditionals = function(node, context) {
  if (node.type === 'BinaryExpression' && (node.operator === '??' || node.operator === '?')) {
    return context.replace({
      type: 'ConditionalExpression',
      test: {
        type: 'BinaryExpression',
        operator: '!=',
        left: node.left,
        right: node.operator === '??' ? undefinedExpression : nullExpression
      },
      consequent: node.left,
      alternate: node.right
    });
  }
};

defaultAssignmentsToDefaultOperators = function(node, context) {
  if (node.type === 'AssignmentExpression' && (node.operator === '?=' || node.operator === '??=')) {
    node.right = {
      type: 'BinaryExpression',
      operator: node.operator === '?=' ? '?' : '??',
      left: node.left,
      right: node.right
    };
    return node.operator = '=';
  }
};

existentialExpression = function(node, context) {
  var existentialChild, existentialChildObject, getExistentialDescendantObject, _ref1;
  if (node.type === 'UnaryExpression' && node.operator === '?') {
    context.replace({
      type: 'BinaryExpression',
      operator: '!=',
      left: node.argument,
      right: nullExpression
    });
  }
  if (node.type === 'MemberExpression' || node.type === 'CallExpression') {
    getExistentialDescendantObject = function(check) {
      var result, _ref1;
      result = null;
      if (check.type === 'MemberExpression' || check.type === 'CallExpression') {
        result = getExistentialDescendantObject((_ref1 = check.object) != null ? _ref1 : check.callee);
        if (check.existential) {
          if (result == null) {
            result = check;
          }
        }
      }
      return result;
    };
    existentialChild = getExistentialDescendantObject(node);
    if (existentialChild != null) {
      existentialChildObject = (_ref1 = existentialChild.object) != null ? _ref1 : existentialChild.callee;
      delete existentialChild.existential;
      return context.replace({
        type: 'ConditionalExpression',
        test: {
          type: 'BinaryExpression',
          operator: '!=',
          left: existentialChildObject,
          right: nullExpression
        },
        consequent: node,
        alternate: undefinedExpression
      });
    }
  }
};

ensureIonVariable = function(context, required) {
  if (required == null) {
    required = true;
  }
  return context.ancestorNodes[0].requiresIon = required;
};

addUseStrictAndRequireIon = {
  enter: function(node, context) {
    var d, _i, _len, _ref1, _ref2, _results;
    if (node.type === 'VariableDeclaration' && ((_ref1 = context.parentNode()) != null ? _ref1.type : void 0) === 'Program') {
      _ref2 = node.declarations;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        d = _ref2[_i];
        if (!(d.id.name === 'ion')) {
          continue;
        }
        ensureIonVariable(context, false);
        break;
      }
      return _results;
    }
  },
  exit: function(node, context) {
    if (node.type === 'Program') {
      if (node.requiresIon) {
        delete node.requiresIon;
        context.addVariable({
          offset: Number.MIN_VALUE,
          kind: 'const',
          id: ionExpression,
          init: {
            type: 'ImportExpression',
            name: {
              type: 'Literal',
              value: 'ion'
            }
          }
        });
      }
      return node.body.unshift({
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: 'use strict'
        }
      });
    }
  }
};

extractForLoopsInnerAndTest = function(node, context) {
  if (node.type === 'ForInStatement' || node.type === 'ForOfStatement') {
    if (node.inner != null) {
      node.inner.body = node.body;
      node.body = node.inner;
      delete node.inner;
    }
    if (node.test != null) {
      node.body = block({
        type: 'IfStatement',
        test: node.test,
        consequent: block(node.body)
      });
      return delete node.test;
    }
  }
};

arrayComprehensionsToES5 = function(node, context) {
  var forStatement, tempId;
  if (node.type === 'ArrayExpression' && (node.value != null) && (node.comprehension != null)) {
    if (context.reactive) {
      forStatement = node.comprehension;
      forStatement.body = {
        type: 'ExpressionStatement',
        expression: node.value
      };
      return context.replace({
        type: 'ObjectExpression',
        objectType: {
          type: 'ArrayExpression',
          elements: []
        },
        properties: [forStatement]
      });
    } else {
      tempId = context.addVariable({
        offset: 0,
        init: {
          type: 'ArrayExpression',
          elements: []
        }
      });
      forStatement = node.comprehension;
      forStatement.body = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: tempId,
            property: {
              type: 'Identifier',
              name: 'push'
            }
          },
          "arguments": [node.value]
        }
      };
      context.addStatement(0, forStatement);
      return context.replace(tempId);
    }
  }
};

functionParameterDefaultValuesToES5 = function(node, context) {
  var defaultValue, index, param, _i, _ref1, _ref2, _results;
  if (context.reactive) {
    return;
  }
  if (isFunctionNode(node) && (node.params != null) && (node.defaults != null)) {
    _ref1 = node.params;
    _results = [];
    for (index = _i = _ref1.length - 1; _i >= 0; index = _i += -1) {
      param = _ref1[index];
      defaultValue = (_ref2 = node.defaults) != null ? _ref2[index] : void 0;
      if (defaultValue != null) {
        context.addStatement({
          type: 'IfStatement',
          test: {
            type: 'BinaryExpression',
            operator: '==',
            left: param,
            right: nullExpression
          },
          consequent: {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '=',
              left: param,
              right: defaultValue
            }
          }
        });
        _results.push(node.defaults[index] = void 0);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

typedObjectExpressions = function(node, context) {
  var addPosition, element, elements, expressionStatement, getExistingObjectIdIfTempVarNotNeeded, grandNode, initialValue, isArray, isSimple, objectId, parentNode, property, statements, subnodeEnter, subnodeExit, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _ref4;
  if (context.reactive) {
    return;
  }
  if (node.type === 'ObjectExpression' && node.simple !== true) {
    isArray = ((_ref1 = node.objectType) != null ? _ref1.type : void 0) === "ArrayExpression";
    isSimple = true;
    if (node.properties != null) {
      _ref2 = node.properties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        property = _ref2[_i];
        if (isArray) {
          if (property.type !== 'ExpressionStatement') {
            isSimple = false;
            break;
          }
        } else {
          if (property.type !== 'Property' || property.computed) {
            isSimple = false;
            break;
          }
        }
      }
    }
    if (isSimple) {
      if (isArray) {
        elements = [];
        if (node.objectType != null) {
          _ref3 = node.objectType.elements;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            element = _ref3[_j];
            elements.push(element);
          }
        }
        _ref4 = node.properties;
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          expressionStatement = _ref4[_k];
          elements.push(expressionStatement.expression);
        }
        context.replace({
          type: "ArrayExpression",
          elements: elements
        });
        return;
      }
      if ((node.objectType == null) || (node.objectType.type === 'ObjectExpression' && node.objectType.properties.length === 0)) {
        delete node.objectType;
        Object.defineProperty(node, 'simple', {
          value: true
        });
        return;
      }
    }
    if (node.objectType == null) {
      initialValue = {
        type: 'ObjectExpression',
        properties: []
      };
    } else if (node.objectType.type === 'ArrayExpression' || node.objectType.type === 'NewExpression' || node.objectType.type === 'ObjectExpression') {
      initialValue = node.objectType;
    } else {
      initialValue = {
        type: 'NewExpression',
        callee: node.objectType,
        "arguments": []
      };
    }
    parentNode = context.parentNode();
    grandNode = context.ancestorNodes[context.ancestorNodes.length - 2];
    addPosition = 0;
    getExistingObjectIdIfTempVarNotNeeded = function(node, parentNode, grandNode) {
      if (parentNode.type === 'VariableDeclarator') {
        return parentNode.id;
      }
      if (parentNode.type === 'AssignmentExpression' && parentNode.left.type === 'Identifier' && (grandNode != null ? grandNode.type : void 0) === 'ExpressionStatement') {
        return parentNode.left;
      }
      return null;
    };
    objectId = getExistingObjectIdIfTempVarNotNeeded(node, parentNode, grandNode);
    if (objectId != null) {
      context.replace(initialValue);
      addPosition = 1;
    } else {
      objectId = context.addVariable({
        offset: 0,
        init: initialValue
      });
      context.replace(objectId);
    }
    statements = [];
    subnodeEnter = function(subnode, subcontext) {
      if (subcontext.outputStack == null) {
        subcontext.outputStack = [objectId];
      }
      if (subnode.type === 'ObjectExpression' || subnode.type === 'ArrayExpression') {
        return subcontext.skip();
      }
      if (subnode.type === 'Property') {
        subnode.output = subcontext.outputStack[subcontext.outputStack.length - 1];
        subcontext.outputStack.push({
          type: 'MemberExpression',
          object: subnode.output,
          property: subnode.key,
          computed: subnode.computed || subnode.key.type !== 'Identifier'
        });
      } else if (isFunctionNode(subnode)) {
        subcontext.skip();
      } else if (subnode.type === 'ExpressionStatement') {
        if (!isArray) {
          ensureIonVariable(context);
        }
        subnode = subcontext.replace({
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: isArray ? objectId : ionExpression,
              property: {
                type: 'Identifier',
                name: isArray ? 'push' : 'add'
              }
            },
            "arguments": isArray ? [subnode.expression] : [objectId, subnode.expression]
          }
        });
        subcontext.skip();
      }
      if (subcontext.parentNode() == null) {
        return statements.push(subnode);
      }
    };
    if (statements.length === 1) {
      context.addStatement(statements[0], addPosition);
    } else {
      context.addStatement({
        type: 'BlockStatement',
        body: statements
      }, addPosition);
    }
    subnodeExit = function(subnode, subcontext) {
      if (subnode.type === 'Property') {
        return subcontext.outputStack.pop();
      }
    };
  }
  return traverse(node.properties, subnodeEnter, subnodeExit);
};

propertyStatements = function(node, context) {
  var left, parent;
  if (context.reactive) {
    return;
  }
  parent = context.parentNode();
  if (node.type === 'Property' && !(parent.type === 'ObjectExpression' || parent.type === 'ObjectPattern')) {
    if (node.output != null) {
      if (node.value.type === 'ObjectExpression') {
        return context.replace({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: left = {
              type: 'MemberExpression',
              object: node.output,
              property: node.key,
              computed: node.computed
            },
            right: {
              type: 'CallExpression',
              callee: getPathExpression('ion.patch'),
              "arguments": [ion.clone(left, true), node.value]
            }
          }
        });
      } else {
        return context.replace({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              object: node.output,
              property: node.key,
              computed: node.computed
            },
            right: node.value
          }
        });
      }
    } else {
      if (node.computed) {
        throw context.error("dynamic property expression invalid here", node.key);
      }
      if (node.value.objectType != null) {
        throw context.error("type not allowed on set expression", node.value);
      }
      ensureIonVariable(context);
      return context.replace({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: getPathExpression('ion.patch'),
          "arguments": [node.key, node.value]
        }
      });
    }
  }
};

classExpressions = function(node, context) {
  var classExpression, hasIdentifierName, name, properties, property, _base, _i, _len;
  if (node.type === 'ClassExpression') {
    ensureIonVariable(context);
    properties = node.properties;
    hasIdentifierName = (node.name != null) && !node.computed;
    if (node.name != null) {
      name = hasIdentifierName ? {
        type: 'Literal',
        value: node.name.name
      } : node.name;
      properties = [
        {
          type: 'Property',
          key: {
            type: 'Identifier',
            name: 'id'
          },
          value: name
        }
      ].concat(properties);
    }
    if (hasIdentifierName) {
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        if (property.key.name === 'constructor') {
          if ((_base = property.value).id == null) {
            _base.id = node.name;
          }
        }
      }
    }
    classExpression = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: ionExpression,
        property: {
          type: 'Identifier',
          name: 'defineClass'
        }
      },
      "arguments": [
        {
          type: 'ObjectExpression',
          properties: properties
        }
      ].concat(node["extends"])
    };
    if (hasIdentifierName) {
      context.addVariable({
        id: node.name,
        kind: 'const',
        init: classExpression,
        offset: 0
      });
      return context.replace(node.name);
    } else {
      return context.replace(classExpression);
    }
  }
};

checkVariableDeclarations = {
  enter: function(node, context) {
    var key, parent, variable, _base;
    if (node.type === 'AssignmentExpression') {
      if (node.left.type === 'Identifier') {
        variable = context.getVariableInfo(node.left.name);
        if (variable == null) {
          throw context.error("cannot assign to undeclared variable " + node.left.name);
        }
        if (variable.kind === 'const') {
          throw context.error("cannot assign to a const", node.left);
        }
      }
      if (context.reactive) {
        throw context.error("cannot assign within templates", node);
      }
    }
    if (node.type === 'Identifier') {
      key = context.key();
      parent = context.parentNode();
      if (!(parent.type === 'MemberExpression' && key === 'property' || parent.type === 'Property' && key === 'key')) {
        return ((_base = context.scope()).usage != null ? (_base = context.scope()).usage : _base.usage = {})[node.name] = node;
      }
    }
  },
  variable: function(variable, context) {
    var checkScope, existing, scope, shadow, used, _i, _j, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
    scope = context.scope();
    existing = context.getVariableInfo(variable.name);
    if (existing != null) {
      shadow = false;
      _ref1 = context.scopeStack;
      for (_i = _ref1.length - 1; _i >= 0; _i += -1) {
        checkScope = _ref1[_i];
        if (checkScope === (existing != null ? existing.scope : void 0)) {
          break;
        }
        if ((_ref2 = nodes[checkScope.node.type]) != null ? _ref2.shadow : void 0) {
          shadow = true;
          break;
        }
      }
      if (!shadow) {
        throw context.error("Cannot redeclare variable " + variable.name, variable.node);
      }
    }
    _ref3 = context.scopeStack;
    _results = [];
    for (_j = _ref3.length - 1; _j >= 0; _j += -1) {
      checkScope = _ref3[_j];
      used = (_ref4 = checkScope.usage) != null ? _ref4[variable.name] : void 0;
      if (used != null) {
        throw context.error("Cannot use variable '" + variable.name + "' before declaration", used);
      }
      if ((_ref5 = nodes[checkScope.node.type]) != null ? _ref5.shadow : void 0) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

isAncestorObjectExpression = function(context) {
  var ancestor, _i, _ref1;
  _ref1 = context.ancestorNodes;
  for (_i = _ref1.length - 1; _i >= 0; _i += -1) {
    ancestor = _ref1[_i];
    if (ancestor.type === 'ObjectExpression') {
      return true;
    }
    if (isFunctionNode(ancestor)) {
      return false;
    }
  }
  return false;
};

namedFunctions = function(node, context) {
  var func, _base, _base1, _ref1;
  if (context.reactive) {
    return;
  }
  if (node.type === 'ExpressionStatement' && node.expression.type === 'FunctionExpression' && (node.expression.id != null)) {
    func = node.expression;
    func.type = 'FunctionDeclaration';
    context.replace(func);
  }
  if (node.type === 'VariableDeclarator' && ((_ref1 = node.init) != null ? _ref1.type : void 0) === 'FunctionExpression') {
    if ((_base = node.init).name == null) {
      _base.name = node.id;
    }
  }
  if (node.type === 'Property' && node.value.type === 'FunctionExpression' && node.key.type === 'Identifier') {
    if (node.key.name !== 'constructor') {
      return (_base1 = node.value).name != null ? (_base1 = node.value).name : _base1.name = node.key;
    }
  }
};

assertStatements = function(node, context) {
  if (node.type === 'AssertStatement') {
    return context.replace({
      type: 'IfStatement',
      test: {
        type: 'UnaryExpression',
        prefix: true,
        operator: '!',
        argument: node.expression
      },
      consequent: {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: {
            type: 'Identifier',
            name: 'Error'
          },
          "arguments": [
            {
              type: 'Literal',
              value: "Assertion Failed: (" + node.text + ")"
            }
          ]
        }
      }
    });
  }
};

isSuperExpression = function(node, context) {
  var parentNode;
  parentNode = context.parentNode();
  if (node.type === 'Identifier' && node.name === 'super' && parentNode.type !== 'CallExpression' && parentNode.type !== 'MemberExpression') {
    return true;
  }
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'super') {
    return true;
  }
  return false;
};

superExpressions = function(node, context) {
  var applyOrCall, args, classNode, functionNode, functionProperty, isConstructor, superFunction, _ref1, _ref2;
  if (isSuperExpression(node, context)) {
    classNode = context.getAncestor(function(node) {
      return node.type === 'ClassExpression';
    });
    functionNode = context.getAncestor(isFunctionNode);
    functionProperty = context.ancestorNodes[context.ancestorNodes.indexOf(functionNode) - 1];
    isConstructor = (functionProperty != null ? (_ref1 = functionProperty.key) != null ? _ref1.name : void 0 : void 0) === 'constructor';
    if ((classNode == null) || !(((functionNode != null ? functionNode.name : void 0) != null) || isConstructor)) {
      throw context.error("super can only be used within named class functions", node);
    }
    args = [
      {
        type: 'ThisExpression'
      }
    ];
    if (node.type === 'Identifier') {
      args.push({
        type: 'Identifier',
        name: 'arguments'
      });
      applyOrCall = 'apply';
    } else {
      args = args.concat(node["arguments"]);
      applyOrCall = 'call';
    }
    superFunction = getPathExpression("" + classNode.name.name + ".super");
    if (!isConstructor) {
      superFunction = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: superFunction,
          property: {
            type: 'Identifier',
            name: 'prototype'
          }
        },
        property: (_ref2 = functionNode.name) != null ? _ref2 : 'constructor'
      };
    }
    return context.replace({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: superFunction,
        property: {
          type: 'Identifier',
          name: applyOrCall
        }
      },
      "arguments": args
    });
  }
};

spreadExpressions = function(node, context) {
  var args, finalParameters, getOffsetFromArgumentsLength, index, param, spread, spreadIndex, _i, _len, _ref1;
  if (isFunctionNode(node)) {
    spread = null;
    spreadIndex = null;
    _ref1 = node.params;
    for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
      param = _ref1[index];
      if (param.type === 'SpreadExpression') {
        spread = param;
        spreadIndex = index;
        break;
      }
    }
    if (spread != null) {
      node.params[spreadIndex] = {
        type: 'Identifier',
        name: "___" + spread.expression.name
      };
      args = [
        {
          type: 'Identifier',
          name: 'arguments'
        }, {
          type: 'Literal',
          value: spreadIndex
        }
      ];
      finalParameters = node.params.length - 1 - spreadIndex;
      if (finalParameters > 0) {
        getOffsetFromArgumentsLength = function(offset) {
          return {
            type: 'BinaryExpression',
            operator: '-',
            left: getPathExpression('arguments.length'),
            right: {
              type: 'Literal',
              value: offset
            }
          };
        };
        args.push(getOffsetFromArgumentsLength(finalParameters));
        index = node.params.length - 1;
        while (index > spreadIndex) {
          param = node.params[index--];
          context.addStatement({
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '=',
              left: param,
              right: {
                type: 'MemberExpression',
                computed: true,
                object: getPathExpression('arguments'),
                property: getOffsetFromArgumentsLength(node.params.length - 1 - index)
              }
            }
          });
        }
      }
      return context.addVariable({
        id: spread.expression,
        init: {
          type: 'CallExpression',
          callee: getPathExpression('Array.prototype.slice.call'),
          "arguments": args
        }
      });
    }
  }
};

createTemplateFunctionClone = function(node, context) {
  var template;
  if (isFunctionNode(node) && node.template === true) {
    if (node.bound) {
      throw context.error("Templates cannot use the fat arrow (=>) binding syntax", node);
    }
    delete node.template;
    template = ion.clone(node, true);
    template.type = 'Template';
    delete template.id;
    delete template.defaults;
    delete template.bound;
    Object.defineProperties(template, {
      type: {
        value: 'Template'
      }
    });
    return node.template = template;
  }
};

validateTemplateNodes = function(node, context) {
  var _ref1;
  if (context.reactive) {
    if (((_ref1 = nodes[node.type]) != null ? _ref1.allowedInReactive : void 0) === false) {
      throw context.error(node.type + " not allowed in templates", node);
    }
  }
  if (context.parentReactive()) {
    if (node.type === 'FunctionDeclaration') {
      node.type = 'FunctionExpression';
      return context.replace({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: node.id,
            init: node
          }
        ]
      });
    }
  }
};

removeLocationInfo = function(node) {
  return traverse(node, function(node) {
    if (node.loc != null) {
      delete node.loc;
    }
    return node;
  });
};

getExternalIdentifiers = function(node, callback) {
  traverse(node, function(node, context) {
    var _ref1, _ref2;
    if (node.type === 'Identifier') {
      if (((_ref1 = context.parentNode()) != null ? _ref1.type : void 0) === 'MemberExpression' && context.key() === 'property') {
        return;
      }
      if (((_ref2 = context.parentNode()) != null ? _ref2.type : void 0) === 'Property' && context.key() === 'key') {
        return;
      }
      if (context.getVariableInfo(node.name) != null) {
        return;
      }
      return callback(node);
    }
  });
};

wrapTemplateInnerFunctions = function(node, context) {
  var contextId, id, name, requiresWrapper, variables;
  if (context.parentReactive()) {
    if (node.type === 'FunctionExpression' && (node.toLiteral == null)) {
      variables = {};
      getExternalIdentifiers(node, function(id) {
        var _ref1, _ref2;
        if (id.name !== ((_ref1 = node.id) != null ? _ref1.name : void 0) && (((_ref2 = context.scope()) != null ? _ref2.variables[id.name] : void 0) != null)) {
          return variables[id.name] = id;
        }
      });
      requiresWrapper = Object.keys(variables).length > 0;
      if (requiresWrapper) {
        contextId = context.getNewInternalIdentifier('_context');
        node.body.body.unshift({
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: (function() {
            var _results;
            _results = [];
            for (name in variables) {
              id = variables[name];
              _results.push({
                type: 'VariableDeclarator',
                id: id,
                init: {
                  type: 'CallExpression',
                  callee: getPathExpression("" + contextId.name + ".get"),
                  "arguments": [
                    {
                      type: 'Literal',
                      value: id.name
                    }
                  ]
                }
              });
            }
            return _results;
          })()
        });
        node = {
          type: 'FunctionExpression',
          params: [contextId],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: node
              }
            ]
          }
        };
      }
      node.toLiteral = function() {
        return this;
      };
      return context.replace({
        type: 'Function',
        context: requiresWrapper,
        value: node
      });
    }
  }
};

createTemplateRuntime = function(node, context) {
  var args, id, key, name, template, templateId, value, variables, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
  if (isFunctionNode(node) && (node.template != null)) {
    templateId = node.id != null ? node.id : node.id = context.getNewInternalIdentifier('_template');
    template = removeLocationInfo(node.template);
    ensureIonVariable(context);
    args = {
      type: 'ObjectExpression',
      properties: []
    };
    variables = {};
    _ref1 = ['require', 'module', 'exports'];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      name = _ref1[_i];
      variables[name] = {
        type: 'Identifier',
        name: name
      };
    }
    _ref2 = template.params;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      id = _ref2[_j];
      variables[id.name] = id;
    }
    _ref3 = context.scope().variables;
    for (key in _ref3) {
      value = _ref3[key];
      id = value.id;
      variables[id.name] = id;
    }
    for (key in variables) {
      id = variables[key];
      args.properties.push({
        key: id,
        value: id,
        kind: 'init'
      });
    }
    delete template.params;
    template.body = template.body.body;
    context.addStatement({
      type: 'IfStatement',
      test: {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'BinaryExpression',
          operator: '!=',
          left: thisExpression,
          right: nullExpression
        },
        right: {
          type: 'BinaryExpression',
          operator: '===',
          left: getPathExpression('this.constructor'),
          right: templateId
        }
      },
      consequent: block({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: getPathExpression('ion.createRuntime'),
          "arguments": [nodeToLiteral(template), args]
        }
      })
    });
    return delete node.template;
  }
};

javascriptExpressions = function(node, context) {
  var e, errorNode, esprima, expression, message, program, _ref1, _ref2;
  if (node.type === 'JavascriptExpression') {
    esprima = require('esprima');
    try {
      program = esprima.parse(node.text);
      expression = program.body[0].expression;
      return context.replace(expression);
    } catch (_error) {
      e = _error;
      errorNode = ion.clone(node, true);
      if ((_ref1 = errorNode.loc) != null) {
        _ref1.start.line += e.lineNumber - 1;
      }
      if ((_ref2 = errorNode.loc) != null) {
        _ref2.start.column += e.column - 1 + "`".length;
      }
      message = e.message.substring(e.message.indexOf(':') + 1).trim();
      throw context.error(message, errorNode);
    }
  }
};

exports.postprocess = function(program, options) {
  var enter, exit, previousContext, steps, traversal, variable, _i, _len;
  steps = [[namedFunctions, superExpressions], [destructuringAssignments], [createTemplateFunctionClone], [javascriptExpressions, arrayComprehensionsToES5], [checkVariableDeclarations], [extractForLoopsInnerAndTest, extractForLoopRightVariable, extractReactiveForPatterns, callFunctionBindForFatArrows], [validateTemplateNodes, classExpressions], [createForInLoopValueVariable, convertForInToForLength, typedObjectExpressions, propertyStatements, defaultAssignmentsToDefaultOperators, defaultOperatorsToConditionals, wrapTemplateInnerFunctions, nodejsModules, destructuringAssignments], [existentialExpression, createTemplateRuntime, functionParameterDefaultValuesToES5], [addUseStrictAndRequireIon], [nodejsModules, spreadExpressions, assertStatements]];
  previousContext = null;
  for (_i = 0, _len = steps.length; _i < _len; _i++) {
    traversal = steps[_i];
    enter = function(node, context) {
      var handler, step, _j, _len1, _ref1, _results;
      previousContext = context;
      if (context.options == null) {
        context.options = options;
      }
      _results = [];
      for (_j = 0, _len1 = traversal.length; _j < _len1; _j++) {
        step = traversal[_j];
        if (!(node != null)) {
          continue;
        }
        handler = (_ref1 = step.enter) != null ? _ref1 : (typeof step === 'function' ? step : null);
        if (handler != null) {
          handler(node, context);
          _results.push(node = context.current());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    exit = function(node, context) {
      var handler, step, _j, _ref1, _results;
      _results = [];
      for (_j = traversal.length - 1; _j >= 0; _j += -1) {
        step = traversal[_j];
        if (!(node != null)) {
          continue;
        }
        handler = (_ref1 = step.exit) != null ? _ref1 : null;
        if (handler != null) {
          handler(node, context);
          _results.push(node = context.current());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    variable = function(node, context, kind, name) {
      var handler, step, _j, _len1, _ref1, _results;
      _results = [];
      for (_j = 0, _len1 = traversal.length; _j < _len1; _j++) {
        step = traversal[_j];
        if (!(node != null)) {
          continue;
        }
        handler = (_ref1 = step.variable) != null ? _ref1 : null;
        if (handler != null) {
          handler(node, context, kind, name);
          _results.push(node = context.current());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    traverse(program, enter, exit, variable, previousContext);
  }
  return program;
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/postprocessor',_compiler_postprocessor_);
    else
      _compiler_postprocessor_.call(this, module, exports, require);
  }
  else {
    _compiler_postprocessor_.call(this);
  }
}).call(this)
void (function(){var _compiler_preprocessor_ = function(module,exports,require){var common, fixSourceLocation, fixSourceLocations, getSpace, preprocess;

common = require('./common');

getSpace = function(size) {
  var i, result, _i;
  result = [];
  for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
    result.push(" ");
  }
  return result.join("");
};

exports.isMarkdownCommented = function(source) {
  return /(\n|^)[^\s\n][^\n]*\n(\s*\n)+\s+[^\s\n]/.test(source);
};

exports.fixSourceLocation = fixSourceLocation = function(location, sourceMapping) {
  var _ref;
  if (!location.fixed) {
    location.fixed = true;
    location.line = sourceMapping[location.line - 1] + 1;
    return location.column += (_ref = sourceMapping.columnOffset) != null ? _ref : 0;
  }
};

exports.fixSourceLocations = fixSourceLocations = function(program, sourceMapping) {
  require('./traverseAst').traverse(program, function(node) {
    var _ref, _ref1;
    if (((_ref = node.loc) != null ? _ref.start : void 0) != null) {
      fixSourceLocation(node.loc.start, sourceMapping);
    }
    if (((_ref1 = node.loc) != null ? _ref1.end : void 0) != null) {
      return fixSourceLocation(node.loc.end, sourceMapping);
    }
  });
  return program;
};

exports.preprocess = preprocess = function(source, sourceMapping) {
  var baseIndent, comment, indent, indentStack, index, isEmpty, isMarkdownCommented, line, lines, nonCommentCount, outdent, output, totalIndent, writeLine, _i, _len;
  isMarkdownCommented = false;
  baseIndent = isMarkdownCommented ? 1 : 0;
  totalIndent = 0;
  indentStack = [];
  lines = common.splitLines(source);
  nonCommentCount = 0;
  writeLine = function(line, inputIndex) {
    var trimmed;
    if (inputIndex != null) {
      if (sourceMapping != null) {
        sourceMapping[output.length] = inputIndex;
      }
    }
    trimmed = line.trim();
    if (trimmed.length > 0 && line.trim()[0] !== '#') {
      nonCommentCount++;
    }
    return output.push(line);
  };
  outdent = function(inputIndex) {
    var _ref;
    indentStack.pop();
    totalIndent = (_ref = indentStack[indentStack.length - 1]) != null ? _ref : 0;
    if (totalIndent >= baseIndent) {
      return writeLine(getSpace(totalIndent) + common.outdentToken, inputIndex);
    }
  };
  output = [];
  for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
    line = lines[index];
    indent = common.getIndent(line);
    isEmpty = line.trim().length === 0;
    if (!isEmpty) {
      if (indent > totalIndent) {
        if (totalIndent >= baseIndent) {
          writeLine(getSpace(totalIndent) + common.indentToken, index);
        }
        totalIndent = indent;
        indentStack.push(indent);
      } else {
        while (indent < totalIndent) {
          outdent(index);
        }
      }
    }
    comment = isMarkdownCommented && indent === 0 && !isEmpty;
    if (!comment) {
      writeLine(line, index);
    }
  }
  while (indentStack.length > 0) {
    outdent(lines.length);
  }
  if (nonCommentCount === 0) {
    return "";
  } else {
    return common.unindentString(common.joinLines(output), sourceMapping);
  }
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/preprocessor',_compiler_preprocessor_);
    else
      _compiler_preprocessor_.call(this, module, exports, require);
  }
  else {
    _compiler_preprocessor_.call(this);
  }
}).call(this)
void (function(){var _compiler_traverse_ = function(module,exports,require){exports.traverse = function(graph, enterCallback, exitCallback) {
  var context, removed, result, skip, traverseNode;
  result = graph;
  skip = false;
  removed = 0;
  context = {
    path: [],
    ancestors: [],
    skip: function() {
      return skip = true;
    },
    key: function() {
      return this.path[this.path.length - 1];
    },
    parent: function() {
      return this.ancestors[this.ancestors.length - 1];
    },
    remove: function(node) {
      var index, parent;
      if (node == null) {
        throw new Error("You must specify the node to remove");
      }
      parent = this.parent();
      if (Array.isArray(parent)) {
        index = parent.indexOf(node);
        parent.splice(index, 1);
        return removed++;
      } else {
        return delete parent[this.key()];
      }
    },
    replace: function(value) {
      var parent;
      if (value === void 0) {
        throw new Error("You must specify a replacement value");
      }
      parent = this.parent();
      if (parent != null) {
        return parent[this.key()] = value;
      } else {
        return result = value;
      }
    },
    previous: function() {
      var _ref;
      return (_ref = this.parent()) != null ? _ref[this.key() - 1] : void 0;
    },
    next: function() {
      var _ref;
      return (_ref = this.parent()) != null ? _ref[this.key() + 1] : void 0;
    },
    current: function() {
      var parent;
      parent = this.parent();
      if (parent != null) {
        return parent[this.key()];
      } else {
        return result;
      }
    }
  };
  traverseNode = function(node) {
    var index, key, newNode, value;
    if ((node != null) && typeof node === 'object') {
      if (typeof enterCallback === "function") {
        enterCallback(node, context);
      }
      if (skip) {
        skip = false;
      } else {
        newNode = context.current();
        if (newNode !== node) {
          if (typeof exitCallback === "function") {
            exitCallback(node, context);
          }
          node = newNode;
          if (node != null) {
            if (typeof enterCallback === "function") {
              enterCallback(node, context);
            }
          }
        }
        if ((node != null) && typeof node === 'object') {
          context.ancestors.push(node);
          if (Array.isArray(node)) {
            index = 0;
            while (index < node.length) {
              value = node[index];
              context.path.push(index);
              traverseNode(value);
              context.path.pop();
              index++;
              if (removed > 0) {
                index -= removed;
                removed = 0;
              }
            }
          } else {
            for (key in node) {
              value = node[key];
              context.path.push(key);
              traverseNode(value);
              context.path.pop();
            }
          }
          context.ancestors.pop();
        }
      }
      if (node != null) {
        return typeof exitCallback === "function" ? exitCallback(node, context) : void 0;
      }
    }
  };
  traverseNode(graph);
  return result;
};

exports.test = function() {
  var graph;
  graph = {
    id: 'root',
    alpha: 1,
    beta: {
      id: 'beta',
      charlie: 2,
      delta: 3
    },
    echo: {
      id: 'echo',
      foxtrot: 1
    }
  };
  if (graph !== exports.traverse(graph, function() {})) {
    throw new Error("traverse should have returned graph");
  }
  if (2 !== exports.traverse(graph, function(node, context) {
    return context.replace(2);
  })) {
    throw new Error("traverse should have returned 2");
  }
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/traverse',_compiler_traverse_);
    else
      _compiler_traverse_.call(this, module, exports, require);
  }
  else {
    _compiler_traverse_.call(this);
  }
}).call(this)
void (function(){var _compiler_traverseAst_ = function(module,exports,require){var addStatement, basicTraverse, nodes, trackVariableDeclaration, trackVariableDeclarations;

basicTraverse = require('./traverse');

nodes = require('./nodes');

addStatement = require("./astFunctions").addStatement;

trackVariableDeclaration = function(context, node, kind, name) {
  var scope, variable;
  if (name == null) {
    name = node.name;
  }
  scope = context.scope();
  if (scope == null) {
    return;
  }
  variable = {
    kind: kind,
    id: {
      type: 'Identifier',
      name: name
    },
    name: name,
    node: node,
    scope: scope
  };
  if (typeof context.variableCallback === "function") {
    context.variableCallback(variable, context);
  }
  return scope.variables[name] = variable;
};

trackVariableDeclarations = function(context, node, kind) {
  var declarator, item, _i, _j, _len, _len1, _ref, _results, _results1;
  if (kind == null) {
    kind = 'let';
  }
  if (Array.isArray(node)) {
    _results = [];
    for (_i = 0, _len = node.length; _i < _len; _i++) {
      item = node[_i];
      _results.push(trackVariableDeclarations(context, item, kind));
    }
    return _results;
  } else {
    if (node.type === 'FunctionDeclaration') {
      kind = 'const';
      if (node.id != null) {
        return trackVariableDeclarations(context, node.id, kind);
      }
    } else if (node.type === 'VariableDeclaration') {
      kind = node.kind;
      _ref = node.declarations;
      _results1 = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        declarator = _ref[_j];
        _results1.push(trackVariableDeclarations(context, declarator.id, kind));
      }
      return _results1;
    } else if (node.type === "Identifier") {
      return trackVariableDeclaration(context, node, kind);
    } else if (node.type === "ObjectPattern") {
      return basicTraverse.traverse(node, function(child, newContext) {
        var name, _ref1;
        if ((child.key != null) && (child.value != null)) {
          name = (_ref1 = child.key.value) != null ? _ref1 : child.key.name;
          trackVariableDeclaration(context, child, kind, name);
          return newContext.skip();
        }
      });
    } else if (node.type === "ArrayPattern") {
      return basicTraverse.traverse(node, function(child, newContext) {
        if (child.type === 'Identifier') {
          trackVariableDeclaration(context, child, kind);
          return newContext.skip();
        }
      });
    }
  }
};

exports.traverse = function(program, enterCallback, exitCallback, variableCallback, previousContext) {
  var ourEnter, ourExit;
  ourEnter = function(node, context) {
    var nodeInfo, _ref, _ref1, _ref2;
    if (context.variableCallback == null) {
      context.variableCallback = variableCallback;
    }
    if (context.scopeStack == null) {
      context.scopeStack = [];
    }
    if (context.scope == null) {
      context.scope = function() {
        return this.scopeStack[this.scopeStack.length - 1];
      };
    }
    if (context.ancestorNodes == null) {
      context.ancestorNodes = [];
    }
    if (context.getAncestor == null) {
      context.getAncestor = function(predicate) {
        var ancestor, _i, _ref;
        _ref = this.ancestorNodes;
        for (_i = _ref.length - 1; _i >= 0; _i += -1) {
          ancestor = _ref[_i];
          if (predicate(ancestor)) {
            return ancestor;
          }
        }
        return null;
      };
    }
    if (context.rootNode == null) {
      context.rootNode = function() {
        return this.ancestorNodes[0];
      };
    }
    if (context.parentNode == null) {
      context.parentNode = function() {
        return this.ancestorNodes[this.ancestorNodes.length - 1];
      };
    }
    if (context.parentScope == null) {
      context.parentScope = function() {
        return this.scopeStack[this.scopeStack.length - 2];
      };
    }
    if (context.parentReactive == null) {
      context.parentReactive = function() {
        return this._reactiveStack[this._reactiveStack.length - 1];
      };
    }
    if (context.isParentBlock == null) {
      context.isParentBlock = function() {
        var _ref, _ref1, _ref2;
        return (_ref = (_ref1 = nodes[(_ref2 = this.parentNode()) != null ? _ref2.type : void 0]) != null ? _ref1.isBlock : void 0) != null ? _ref : false;
      };
    }
    if (context.getVariableInfo == null) {
      context.getVariableInfo = function(id) {
        return this.scope().variables[id];
      };
    }
    if (context._variableCounts == null) {
      context._variableCounts = (_ref = previousContext != null ? previousContext._variableCounts : void 0) != null ? _ref : {};
    }
    if (context.getNewInternalIdentifier == null) {
      context.getNewInternalIdentifier = function(prefix) {
        var count, counts, name;
        if (prefix == null) {
          prefix = '_ref';
        }
        counts = this._variableCounts;
        count = counts[prefix] != null ? counts[prefix] : counts[prefix] = 1;
        counts[prefix]++;
        name = count === 1 ? prefix : prefix + count;
        return {
          type: 'Identifier',
          name: name
        };
      };
    }
    if (context.getAncestorChildOf == null) {
      context.getAncestorChildOf = function(ancestor) {
        var index, _ref1;
        index = this.ancestorNodes.indexOf(ancestor);
        if (index >= 0) {
          return (_ref1 = this.ancestorNodes[index + 1]) != null ? _ref1 : this.current();
        } else {
          return void 0;
        }
      };
    }
    if (context.getSharedVariableId == null) {
      context.getSharedVariableId = function(name) {
        var _ref1, _ref2;
        return (_ref1 = (_ref2 = this.getVariableInfo(name)) != null ? _ref2.id : void 0) != null ? _ref1 : this.addVariable({
          id: name,
          offset: Number.MIN_VALUE
        });
      };
    }
    if (context.addStatement == null) {
      context.addStatement = function(statement, offset, addToNode) {
        var _ref1;
        if (typeof statement === 'number') {
          _ref1 = [offset, statement], statement = _ref1[0], offset = _ref1[1];
        }
        if (addToNode == null) {
          addToNode = this.scope().node;
        }
        trackVariableDeclarations(context, statement);
        return addStatement(addToNode, statement, this.getAncestorChildOf(addToNode), offset);
      };
    }
    if (context.addVariable == null) {
      context.addVariable = function(options) {
        var variable;
        variable = this.getVariable(options);
        this.addStatement(variable, options.offset);
        return variable.declarations[0].id;
      };
    }
    if (context.getVariable == null) {
      context.getVariable = function(options) {
        var variable;
        if (options == null) {
          options = {};
        }
        if (typeof options.id === 'string') {
          options.id = {
            type: 'Identifier',
            name: options.id
          };
        }
        if (options.id == null) {
          options.id = this.getNewInternalIdentifier();
        }
        if (options.kind == null) {
          options.kind = 'let';
        }
        variable = {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: options.id,
              init: options.init
            }
          ],
          kind: options.kind
        };
        return variable;
      };
    }
    context.error = function(message, node) {
      var e, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      if (node == null) {
        node = this.current();
      }
      e = new Error(message);
      e.line = (_ref1 = node.loc) != null ? (_ref2 = _ref1.start) != null ? _ref2.line : void 0 : void 0;
      e.column = ((_ref3 = node.loc) != null ? (_ref4 = _ref3.start) != null ? _ref4.column : void 0 : void 0) + 1;
      e.lineEnd = (_ref5 = node.loc) != null ? (_ref6 = _ref5.end) != null ? _ref6.line : void 0 : void 0;
      e.columnEnd = ((_ref7 = node.loc) != null ? (_ref8 = _ref7.end) != null ? _ref8.column : void 0 : void 0) + 1;
      return e;
    };
    if (node.type != null) {
      nodeInfo = nodes[node.type];
      if ((nodeInfo != null ? nodeInfo.reactive : void 0) != null) {
        (context._reactiveStack != null ? context._reactiveStack : context._reactiveStack = []).push(context.reactive);
        context.reactive = nodeInfo.reactive;
      }
      if (nodeInfo != null ? nodeInfo.newScope : void 0) {
        context.scopeStack.push({
          variables: Object.create((_ref1 = (_ref2 = context.scope()) != null ? _ref2.variables : void 0) != null ? _ref1 : {}),
          node: node
        });
      }
      if (Array.isArray(node.body)) {
        trackVariableDeclarations(context, node.body);
      }
      if (nodeInfo != null ? nodeInfo.isFunction : void 0) {
        trackVariableDeclarations(context, node.params, nodeInfo.paramKind);
      } else if (node.type === 'ForInStatement' || node.type === 'ForOfStatement') {
        trackVariableDeclarations(context, node.left);
      }
      if (typeof enterCallback === "function") {
        enterCallback(node, context);
      }
      return context.ancestorNodes.push(node);
    }
  };
  ourExit = function(node, context) {
    var nodeInfo;
    if (node.type != null) {
      nodeInfo = nodes[node.type];
      if ((nodeInfo != null ? nodeInfo.reactive : void 0) != null) {
        context.reactive = context._reactiveStack.pop();
      }
      context.ancestorNodes.pop();
      if (typeof exitCallback === "function") {
        exitCallback(node, context);
      }
      if (nodeInfo != null ? nodeInfo.newScope : void 0) {
        return context.scopeStack.pop();
      }
    }
  };
  return basicTraverse.traverse(program, ourEnter, ourExit);
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('compiler/traverseAst',_compiler_traverseAst_);
    else
      _compiler_traverseAst_.call(this, module, exports, require);
  }
  else {
    _compiler_traverseAst_.call(this);
  }
}).call(this)
void (function(){var _es6_ = function(module,exports,require){
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || this.length;
            position = position - searchString.length;
            var lastIndex = this.lastIndexOf(searchString);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    }
  });
}

if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}


  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('es6',_es6_);
    else
      _es6_.call(this, module, exports, require);
  }
  else {
    _es6_.call(this);
  }
}).call(this)
void (function(){var _index_ = function(module,exports,require){'use strict';
require('./es6');
const mergePatch = require('./mergePatch'), primitive = {
        string: true,
        number: true,
        boolean: true,
        function: true
    }, isPrimitive = function (object) {
        return !(object != null) || primitive[typeof object] || false;
    }, normalizeProperty = function (property) {
        if (typeof property === 'function') {
            property = {
                writable: false,
                value: property
            };
        } else if (isPrimitive(property) || Array.isArray(property)) {
            property = { value: property };
        }
        if (!(property.get != null) && !(property.set != null) && !property.hasOwnProperty('value')) {
            property.value = void 0;
        }
        if (property.hasOwnProperty('value')) {
            property.writable = property.writable != null ? property.writable : true;
        }
        return property;
    }, normalizeProperties = function (properties) {
        if (properties == null)
            properties = {};
        for (let name in properties) {
            let property = properties[name];
            properties[name] = normalizeProperty(property);
        }
        return properties;
    }, variableArgConstructs = [
        function (type, a) {
            return new type();
        },
        function (type, a) {
            return new type(a[0]);
        },
        function (type, a) {
            return new type(a[0], a[1]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4], a[5]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
        },
        function (type, a) {
            return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
        }
    ];
const patch = exports.patch = function (target, values, deleteNull) {
        return mergePatch.apply(target, values, deleteNull);
    }, create = exports.create = function (type, args) {
        return variableArgConstructs[args.length](type, args);
    }, createRuntime = exports.createRuntime = function (ast, args) {
        const Context = require('./runtime/Context');
        const context = new Context();
        if (args != null) {
            for (let name in args) {
                let value = args[name];
                context.setVariable(name, value);
            }
        }
        return context.createRuntime(ast);
    }, nextTick = exports.nextTick = (this.process != null ? this.process.nextTick : void 0) != null ? this.process.nextTick : function (fn) {
        return setTimeout(fn, 0);
    }, clone = exports.clone = function (object, deep) {
        if (deep == null)
            deep = false;
        if ((object != null ? object.constructor : void 0) === Object) {
            let _ref2 = {};
            {
                for (let key in object) {
                    let value = object[key];
                    _ref2[key] = deep ? clone(value, deep) : value;
                }
            }
            return _ref2;
        } else if (Array.isArray(object)) {
            let _ref = [];
            for (let _i = 0; _i < object.length; _i++) {
                let item = object[_i];
                _ref.push(deep ? clone(item, deep) : item);
            }
            return _ref;
        } else {
            return object;
        }
    }, observe = exports.observe = function (object, observer, property) {
        if (object != null && observer != null && Object.observe != null && typeof object === 'object') {
            Object.observe(object, observer);
            object.addEventListener != null ? object.addEventListener('change', observer) : void 0;
        }
        object != null ? object.onObserved != null ? object.onObserved(observer, property) : void 0 : void 0;
    }, unobserve = exports.unobserve = function (object, observer, property) {
        if (object != null && observer != null && Object.unobserve != null && typeof object === 'object') {
            Object.unobserve(object, observer);
            object.removeEventListener != null ? object.removeEventListener('change', observer) : void 0;
        }
        object != null ? object.unObserved != null ? object.unObserved(observer, property) : void 0 : void 0;
    }, add = exports.add = function (container, item) {
        if (container.nodeType === 1) {
            if (typeof item === 'string') {
                item = document.createTextNode(item);
            }
            container.appendChild(item);
        } else if (container.push != null) {
            container.push(item);
        } else {
            container.add(item);
        }
        item.onAdded != null ? item.onAdded(container) : void 0;
        return function () {
            if (container.nodeType === 1) {
                container.removeChild(item);
            } else if (container.lastIndexOf != null && container.removeAt != null) {
                let index = container.lastIndexOf(item);
                if (index >= 0) {
                    container.removeAt(index);
                }
            } else if (typeof container.remove === 'function') {
                container.remove(item);
            } else {
                remove(container, item);
            }
            item.onRemoved != null ? item.onRemoved(container) : void 0;
        };
    }, remove = exports.remove = function (array, item) {
        if (array != null) {
            let index = array.lastIndexOf(item);
            if (index >= 0) {
                array.splice(index, 1);
                return index;
            }
        }
        return;
    }, defineProperties = exports.defineProperties = function (object, properties) {
        return Object.defineProperties(object, normalizeProperties(properties));
    }, defineClass = exports.defineClass = function (___definitions) {
        let definitions = Array.prototype.slice.call(arguments, 0);
        const classDefinition = definitions[0];
        if (definitions[1] === void 0) {
            definitions[1] = require('./Object');
        }
        classDefinition.super = definitions[1];
        const name = classDefinition.name != null ? classDefinition.name : classDefinition.id != null ? classDefinition.id.match(/([a-z_0-9\$]+)(\.js)?$/i) != null ? classDefinition.id.match(/([a-z_0-9\$]+)(\.js)?$/i)[1] : void 0 : void 0;
        if (!(name != null)) {
            throw new Error('missing name property');
        }
        let classFunction;
        if (classDefinition.hasOwnProperty('constructor')) {
            classFunction = classDefinition.constructor;
        } else if (classDefinition.super != null) {
            classFunction = eval('(function ' + name + '() { ' + name + '.super.apply(this, arguments); })');
        } else {
            classFunction = eval('(function ' + name + '() {})');
        }
        for (let i = definitions.length - 1; i >= 0; i--) {
            const definition = definitions[i];
            for (let key in definition) {
                let value = definition[key];
                if (key !== 'test' || i === 0) {
                    classFunction[key] = mergePatch.apply(classFunction[key], value);
                }
            }
        }
        if (classFunction.properties != null) {
            defineProperties(classFunction.prototype, classFunction.properties);
        }
        return classFunction;
    }, get = exports.get = function (object, property) {
        if (!(object != null && property != null)) {
            return void 0;
        }
        if (typeof object.get === 'function') {
            return object.get(property);
        } else {
            return object[property];
        }
    }, set = exports.set = function (object, property, value) {
        if (object != null && property != null) {
            if (arguments.length === 2) {
                for (let k in property) {
                    let v = property[k];
                    set(object, k, v);
                }
                return;
            }
            if (typeof object.set === 'function') {
                object.set(property, value);
            } else if (value === void 0) {
                delete object[property];
            } else {
                object[property] = value;
            }
            value != null ? value.onSet != null ? value.onSet(object, property) : void 0 : void 0;
        }
        return value;
    }, is = exports.is = function (instance, type) {
        if (!(instance != null)) {
            return false;
        }
        if (!(type != null)) {
            return true;
        }
        if (typeof type === 'function') {
            if (typeof instance.is === 'function') {
                return instance.is(type);
            }
            return instance instanceof type;
        } else {
            return instance === type;
        }
    }, makeReactive = exports.makeReactive = function (object, activate) {
        let observeCount = 0;
        let deactivate = null;
        return Object.defineProperties(object, {
            onObserved: {
                value: function () {
                    observeCount++;
                    if (observeCount === 1) {
                        deactivate = activate.call(object);
                    }
                }
            },
            unObserved: {
                value: function () {
                    observeCount--;
                    if (observeCount === 0) {
                        deactivate != null ? deactivate() : void 0;
                    }
                }
            }
        });
    }, test = exports.test = {
        defineClass: function () {
            const Foo = defineClass({
                    id: 'Foo',
                    constructor: function (number) {
                        this.number = number;
                    },
                    properties: {
                        getValue: function () {
                            return this.number;
                        }
                    }
                });
            if (!(new Foo(2).getValue() === 2))
                throw new Error('Assertion Failed: (new Foo(2).getValue() is 2)');
        },
        defineProperties: {
            'should allow primitive values': function () {
                const object = {};
                const result = defineProperties(object, {
                        f: function () {
                            return 'function';
                        },
                        i: 2,
                        b: true,
                        a: [],
                        s: 'hello'
                    });
                if (!(object === result))
                    throw new Error('Assertion Failed: (object is result)');
                if (!(typeof object.f === 'function'))
                    throw new Error('Assertion Failed: (typeof object.f is \'function\')');
                if (!(object.f() === 'function'))
                    throw new Error('Assertion Failed: (object.f() is \'function\')');
                if (!(object.i === 2))
                    throw new Error('Assertion Failed: (object.i is 2)');
                if (!(object.b === true))
                    throw new Error('Assertion Failed: (object.b is true)');
                if (!Array.isArray(object.a))
                    throw new Error('Assertion Failed: (Array.isArray(object.a))');
                if (!(object.s === 'hello'))
                    throw new Error('Assertion Failed: (object.s is \'hello\')');
            }
        }
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('index',_index_);
    else
      _index_.call(this, module, exports, require);
  }
  else {
    _index_.call(this);
  }
}).call(this)
void (function(){var _mergePatch_ = function(module,exports,require){'use strict';
const ion = require('./'), isObject = function (a) {
        return a != null && typeof a === 'object';
    }, deleteValue = void 0;
const apply = exports.apply = function (target, values, deleteUndefined) {
        if (deleteUndefined == null)
            deleteUndefined = true;
        if ((values != null ? values.constructor : void 0) !== Object) {
            return values;
        }
        if (!isObject(target)) {
            target = {};
        }
        for (let key in values) {
            let value = values[key];
            let patchedValue = apply(target[key], value, deleteUndefined);
            if (deleteUndefined && value === deleteValue) {
                delete target[key];
            } else {
                target[key] = patchedValue;
            }
        }
        return target;
    }, combine = exports.combine = function (patch1, patch2) {
        return apply(patch1, patch2, false);
    }, watch = exports.watch = function (object, handler, callInitial) {
        if (callInitial == null)
            callInitial = true;
        if (!isObject(object)) {
            throw new Error('Cannot watch: #{object}');
        }
        let subWatchers = {};
        let pendingPatch = null;
        let processPatch = function (patchValues) {
            for (let name in patchValues) {
                subWatchers[name] != null ? subWatchers[name]() : void 0;
                let value = object[name];
                if (isObject(value)) {
                    (function (name) {
                        let subHandler = function (patch) {
                            let basePatch = {};
                            basePatch[name] = patch;
                            if (pendingPatch != null) {
                                pendingPatch = combine(pendingPatch, basePatch);
                            } else {
                                handler(basePatch);
                            }
                        };
                        subWatchers[name] = watch(value, subHandler, false);
                    }(name));
                }
            }
        };
        let watcher = function (changes) {
            try {
                pendingPatch = {};
                for (let _i = 0; _i < changes.length; _i++) {
                    let change = changes[_i];
                    pendingPatch[change.name] = object[change.name] != null ? object[change.name] : deleteValue;
                }
                processPatch(pendingPatch);
                ion.nextTick(function () {
                    handler(pendingPatch);
                    pendingPatch = null;
                });
            } catch (e) {
                console.error(e);
            }
        };
        processPatch(object);
        ion.observe(object, watcher);
        return function () {
            ion.unobserve(object, watcher);
            for (let key in subWatchers) {
                let value = subWatchers[key];
                value();
            }
        };
    }, diff = exports.diff = function (oldValue, newValue) {
        if (oldValue === newValue) {
            return void 0;
        }
        if (!(oldValue != null && newValue != null && typeof newValue === 'object' && typeof oldValue === 'object')) {
            return newValue != null ? newValue : null;
        }
        let patch = void 0;
        for (let name in oldValue) {
            if (oldValue.hasOwnProperty(name)) {
                let propertyDiff = diff(oldValue[name], newValue[name]);
                if (propertyDiff !== void 0) {
                    patch = patch != null ? patch : {};
                    patch[name] = propertyDiff;
                }
            }
        }
        for (let name in newValue) {
            if (newValue.hasOwnProperty(name) && !oldValue.hasOwnProperty(name)) {
                patch = patch != null ? patch : {};
                patch[name] = newValue[name];
            }
        }
        return patch;
    }, isChange = exports.isChange = function (oldValue, newValue) {
        if (oldValue === newValue) {
            return false;
        }
        if (!(oldValue != null && newValue != null && typeof newValue === 'object' && typeof oldValue === 'object')) {
            return true;
        }
        for (let name in newValue) {
            if (isChange(oldValue[name], newValue[name])) {
                return true;
            }
        }
        return false;
    }, isEmpty = exports.isEmpty = function (patch) {
        return patch === void 0 || Object.isObject(patch) && Object.isEmpty(patch);
    }, test = exports.test = function () {
        const equal = function (a, b) {
            return !isChange(a, b) && !isChange(b, a);
        };
        return {
            apply: function () {
                if (!equal({
                        a: {
                            b: 2,
                            c: 3
                        },
                        d: 4
                    }, apply({ a: { b: 2 } }, {
                        a: { c: 3 },
                        d: 4
                    })))
                    throw new Error('Assertion Failed: (equal({a:{b:2,c:3},d:4}, apply({a:{b:2}}, {a:{c:3},d:4})))');
                if (!equal({ b: 2 }, apply(null, { b: 2 })))
                    throw new Error('Assertion Failed: (equal({b:2}, apply(null, {b:2})))');
            },
            isChange: function () {
                if (!isChange({ a: 1 }, null))
                    throw new Error('Assertion Failed: (isChange({a:1}, null))');
                if (!!isChange(null, null))
                    throw new Error('Assertion Failed: (not isChange(null, null))');
                if (!isChange(void 0, null))
                    throw new Error('Assertion Failed: (isChange(undefined, null))');
                if (!isChange(null, void 0))
                    throw new Error('Assertion Failed: (isChange(null, undefined))');
                if (!!isChange({ a: 1 }, { a: 1 }))
                    throw new Error('Assertion Failed: (not isChange({a:1}, {a:1}))');
                if (!!isChange({
                        a: {
                            b: 2,
                            c: 3
                        }
                    }, { a: { b: 2 } }))
                    throw new Error('Assertion Failed: (not isChange({a:{b:2,c:3}}, {a:{b:2}}))');
                if (!isChange({ a: { b: 2 } }, { a: { b: 3 } }))
                    throw new Error('Assertion Failed: (isChange({a:{b:2}}, {a:{b:3}}))');
            },
            diff: function () {
                if (!equal({ b: 2 }, diff({ a: 1 }, {
                        a: 1,
                        b: 2
                    })))
                    throw new Error('Assertion Failed: (equal({b:2}, diff({a:1}, {a:1,b:2})))');
                if (!equal({
                        a: {
                            b: 3,
                            c: null
                        }
                    }, diff({
                        a: {
                            b: 2,
                            c: 4
                        }
                    }, { a: { b: 3 } })))
                    throw new Error('Assertion Failed: (equal({a:{b:3,c:null}}, diff({a:{b:2,c:4}}, {a:{b:3}})))');
                if (!equal({ a: 1 }, diff(null, { a: 1 })))
                    throw new Error('Assertion Failed: (equal({a:1}, diff(null, {a:1})))');
                if (!equal({ c: { d: { f: 4 } } }, diff({
                        a: 1,
                        b: 2,
                        c: {
                            d: {
                                e: 1,
                                f: 2
                            }
                        }
                    }, {
                        a: 1,
                        b: 2,
                        c: {
                            d: {
                                e: 1,
                                f: 4
                            }
                        }
                    })))
                    throw new Error('Assertion Failed: (equal({c:{d:{f:4}}}, diff({a:1,b:2,c:{d:{e:1,f:2}}}, {a:1,b:2,c:{d:{e:1,f:4}}})))');
                if (!equal(null, diff({ a: 1 }, void 0)))
                    throw new Error('Assertion Failed: (equal(null, diff({a:1}, undefined)))');
                if (!equal(null, diff({ a: 1 }, null)))
                    throw new Error('Assertion Failed: (equal(null, diff({a:1}, null)))');
                if (!equal(void 0, diff({ a: { b: 2 } }, { a: { b: 2 } })))
                    throw new Error('Assertion Failed: (equal(undefined, diff({a:{b:2}}, {a:{b:2}})))');
            },
            observe: function (done) {
                if (!(Object.observe != null)) {
                    return done(null, 'Object.observe missing.');
                }
                let source = {
                        name: 'Kris',
                        age: 41,
                        children: {
                            Sadera: {
                                grandchildren: {
                                    One: 1,
                                    Two: 2
                                }
                            },
                            Orion: {},
                            Third: {}
                        }
                    };
                let target = ion.clone(source, true);
                let unwatch = watch(source, function (patch) {
                        target = apply(target, patch);
                        if (!equal(source, target))
                            throw new Error('Assertion Failed: (equal(source, target))');
                        done();
                        unwatch();
                    });
                ion.patch(source, {
                    name: 'Fred',
                    children: {
                        Orion: {
                            a: 1,
                            b: 2,
                            c: 12
                        },
                        Sadera: { grandchildren: { three: 3 } }
                    }
                });
                delete source.children.Third;
            }
        };
    }();
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('mergePatch',_mergePatch_);
    else
      _mergePatch_.call(this, module, exports, require);
  }
  else {
    _mergePatch_.call(this);
  }
}).call(this)
void (function(){var _Object_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Object = ion.defineClass({
        id: 'Object',
        constructor: function Object(properties) {
            if (properties != null) {
                for (let key in properties) {
                    let value = properties[key];
                    this[key] = value;
                }
            }
        },
        properties: {
            toJSON: function () {
                const properties = {};
                if (this.constructor.id != null) {
                    properties.$ = this.constructor.id;
                }
                {
                    let _ref = this;
                    for (let key in _ref) {
                        let value = _ref[key];
                        if (this.hasOwnProperty(key)) {
                            properties[key] = value;
                        }
                    }
                }
                return properties;
            }
        }
    }, null);
module.exports = exports = Object;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('Object',_Object_);
    else
      _Object_.call(this, module, exports, require);
  }
  else {
    _Object_.call(this);
  }
}).call(this)
void (function(){var _runtime_ArrayExpression_ = function(module,exports,require){'use strict';
const DynamicExpression = require('./DynamicExpression'), ion = require('../');
const ArrayExpression = ion.defineClass({
        id: 'ArrayExpression',
        constructor: function ArrayExpression() {
            ArrayExpression.super.apply(this, arguments);
            if (!(this.elements != null)) {
                throw new Error('elements is required');
            }
            if (!(this.context != null)) {
                throw new Error('context is required');
            }
        },
        properties: {
            observeElements: false,
            notifyIfActive: function () {
                if (this.isActive) {
                    this.notify();
                }
            },
            setArgumentValue: function (key, value) {
                if (this.argumentValues[key] !== value) {
                    if (this.observeElements) {
                        ion.unobserve(this.argumentValues[key], this.itemObserver);
                    }
                    this.argumentValues[key] = value;
                    if (this.observeElements) {
                        ion.observe(value, this.itemObserver = this.itemObserver != null ? this.itemObserver : function () {
                            this.notifyIfActive();
                        }.bind(this));
                    }
                    this.notifyIfActive();
                }
            },
            activate: function () {
                if (!(this.argumentValues != null)) {
                    let _ref = [];
                    {
                        let _ref2 = this.elements;
                        for (let _i = 0; _i < _ref2.length; _i++) {
                            let item = _ref2[_i];
                            _ref.push(this.context.createRuntime(item));
                        }
                    }
                    this.expressions = _ref;
                    this.argumentValues = [];
                    this.expressionWatchers = [];
                    for (let key = 0; key < this.expressions.length; key++) {
                        this.expressionWatchers[key] = this.setArgumentValue.bind(this, key);
                    }
                }
                {
                    let _ref3 = this.expressions;
                    for (let _i2 = 0; _i2 < _ref3.length; _i2++) {
                        let key = _i2;
                        let expression = _ref3[_i2];
                        expression.watch(this.expressionWatchers[key]);
                    }
                }
                ArrayExpression.super.prototype.activate.apply(this, arguments);
                this.setValue(this.argumentValues);
            },
            deactivate: function () {
                {
                    let _ref4 = this.expressions;
                    for (let _i3 = 0; _i3 < _ref4.length; _i3++) {
                        let key = _i3;
                        let expression = _ref4[_i3];
                        expression.unwatch(this.expressionWatchers[key]);
                    }
                }
                ArrayExpression.super.prototype.deactivate.apply(this, arguments);
            }
        },
        test: function () {
            const Context = require('./Context');
            let e = new ArrayExpression({
                    context: new Context(),
                    elements: [
                        {
                            type: 'Literal',
                            value: 1
                        },
                        {
                            type: 'Literal',
                            value: 2
                        }
                    ]
                });
            let result = void 0;
            function watcher(value) {
                result = value;
            }
            e.watch(watcher);
            if (!(JSON.stringify(result) === '[1,2]'))
                throw new Error('Assertion Failed: (JSON.stringify(result) is "[1,2]")');
        }
    }, DynamicExpression);
module.exports = exports = ArrayExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/ArrayExpression',_runtime_ArrayExpression_);
    else
      _runtime_ArrayExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_ArrayExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_BlockStatement_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Statement = require('./Statement');
const BlockStatement = ion.defineClass({
        id: 'BlockStatement',
        properties: {
            activate: function () {
                BlockStatement.super.prototype.activate.apply(this, arguments);
                if (!(this.statements != null)) {
                    let _ref = [];
                    {
                        let _ref2 = this.body;
                        for (let _i = 0; _i < _ref2.length; _i++) {
                            let s = _ref2[_i];
                            _ref.push(this.context.createRuntime(s));
                        }
                    }
                    this.statements = _ref;
                }
                {
                    let _ref3 = this.statements;
                    for (let _i2 = 0; _i2 < _ref3.length; _i2++) {
                        let statement = _ref3[_i2];
                        statement.activate();
                    }
                }
            },
            deactivate: function () {
                BlockStatement.super.prototype.deactivate.apply(this, arguments);
                for (let i = this.statements.length - 1; i >= 0; i--) {
                    let statement = this.statements[i];
                    statement.deactivate();
                }
            }
        }
    }, Statement);
module.exports = exports = BlockStatement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/BlockStatement',_runtime_BlockStatement_);
    else
      _runtime_BlockStatement_.call(this, module, exports, require);
  }
  else {
    _runtime_BlockStatement_.call(this);
  }
}).call(this)
void (function(){var _runtime_CallExpression_ = function(module,exports,require){'use strict';
const ion = require('../'), DynamicExpression = require('./DynamicExpression'), ArrayExpression = require('./ArrayExpression');
const CallExpression = ion.defineClass({
        id: 'CallExpression',
        properties: {
            args: null,
            activate: function () {
                CallExpression.super.prototype.activate.apply(this, arguments);
                this.calleeExpression = this.calleeExpression != null ? this.calleeExpression : this.context.createRuntime(this.callee);
                this.calleeExpression.watch(this.calleeWatcher = this.calleeWatcher != null ? this.calleeWatcher : function (value) {
                    this.calleeValue = value;
                    this.evaluate();
                }.bind(this));
                this.argumentExpressions = this.argumentExpressions != null ? this.argumentExpressions : this.context.createRuntime({
                    type: 'ArrayExpression',
                    elements: this.arguments,
                    observeElements: true
                });
                this.argumentExpressions.watch(this.argumentWatcher = this.argumentWatcher != null ? this.argumentWatcher : function (value) {
                    this.argumentsValue = value;
                    this.evaluate();
                }.bind(this));
            },
            deactivate: function () {
                CallExpression.super.prototype.deactivate.apply(this, arguments);
                this.calleeExpression.unwatch(this.calleeWatcher);
                this.argumentExpressions.unwatch(this.argumentWatcher);
            },
            evaluate: function () {
                let value = void 0;
                if (this.calleeValue != null && this.argumentsValue != null) {
                    if (this.type === 'NewExpression') {
                        value = ion.create(this.calleeValue, this.argumentsValue);
                    } else {
                        let thisArg = this.calleeExpression.objectExpression != null ? this.calleeExpression.objectExpression.value : void 0;
                        value = this.calleeValue.apply(thisArg, this.argumentsValue);
                    }
                }
                this.setValue(value);
            }
        }
    }, DynamicExpression);
module.exports = CallExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/CallExpression',_runtime_CallExpression_);
    else
      _runtime_CallExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_CallExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_Context_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Factory = require('./Factory'), Literal = require('./Literal');
const Context = ion.defineClass({
        id: 'Context',
        constructor: function Context(parent, output) {
            this.output = output;
            this.parent = parent;
            this.variables = {};
            this.root = (this.parent != null ? this.parent.root : void 0) != null ? this.parent.root : this;
        },
        properties: {
            newContext: function (output) {
                if (output == null)
                    output = this.output;
                return new Context(this, output);
            },
            createRuntime: function (node) {
                return Factory.createRuntime(this, node);
            },
            get: function (name) {
                let variable = this.getVariable(name);
                if (!(variable != null)) {
                    throw new Error('Variable not found: \'' + name + '\'');
                }
                let value = variable.value;
                if (value === void 0) {
                    let watcher = function (a) {
                        if (a !== void 0) {
                            value = a;
                        }
                    };
                    variable.watch(watcher);
                    variable.unwatch(watcher);
                }
                return value;
            },
            getVariable: function (name) {
                return this.variables[name] != null ? this.variables[name] : this.parent != null ? this.parent.getVariable(name) : void 0;
            },
            setVariable: function (name, node) {
                if (name != null) {
                    let variable = this.variables[name] = this.createRuntime(node);
                    return variable;
                }
            },
            getVariableExpression: function (name) {
                let context = this, value;
                while (context != null) {
                    let variable = context.variables[name];
                    if (variable != null) {
                        return variable;
                    }
                    context = context.parent;
                }
                value = global[name];
                if (value === void 0) {
                    throw new Error('Variable not found: \'' + name + '\'');
                }
                let cachedGlobals = this.root.globals = this.root.globals != null ? this.root.globals : {};
                return cachedGlobals[name] = cachedGlobals[name] != null ? cachedGlobals[name] : new Literal({ value: value });
            }
        }
    });
module.exports = exports = Context;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Context',_runtime_Context_);
    else
      _runtime_Context_.call(this, module, exports, require);
  }
  else {
    _runtime_Context_.call(this);
  }
}).call(this)
void (function(){var _runtime_DynamicExpression_ = function(module,exports,require){'use strict';
const ion = require('../');
const DynamicExpression = ion.defineClass({
        id: 'DynamicExpression',
        properties: {
            isActive: false,
            activate: function () {
                this.isActive = true;
            },
            deactivate: function () {
                this.isActive = false;
            },
            watch: function (watcher) {
                let watchers = this._watchers = this._watchers != null ? this._watchers : [];
                if (watchers.length === 0) {
                    this.activate();
                }
                watchers.push(watcher);
                let value = this.getValue();
                if (value !== void 0) {
                    this._notifyWatcher(watcher, value);
                }
            },
            unwatch: function (watcher) {
                ion.remove(this._watchers, watcher);
                let value = this.getValue();
                if (value !== void 0) {
                    this._notifyWatcher(watcher, void 0);
                }
                if (this._watchers.length === 0) {
                    this.deactivate();
                }
            },
            _notifyWatcher: function (watcher, value) {
                return watcher.call(this, value);
            },
            notify: function () {
                if (this._watchers != null) {
                    let value = this.getValue();
                    {
                        let _ref = this._watchers;
                        for (let _i = 0; _i < _ref.length; _i++) {
                            let watcher = _ref[_i];
                            this._notifyWatcher(watcher, value);
                        }
                    }
                }
                return;
            },
            getValue: function () {
                return this.value;
            },
            setValue: function (value) {
                if (value !== this.value) {
                    this.value = value;
                    this.notify();
                }
                return;
            }
        },
        test: function () {
            const d = new DynamicExpression();
            if (d.getValue() !== void 0) {
                throw 'd.getValue() != undefined';
            }
            let total = 10;
            const watcher = function (value) {
                if (value !== void 0) {
                    total += value;
                }
            };
            d.watch(watcher);
            if (!(total === 10))
                throw new Error('Assertion Failed: (total is 10)');
            d.setValue(10);
            if (!(d.getValue() === 10))
                throw new Error('Assertion Failed: (d.getValue() is 10)');
            if (!(total === 20))
                throw new Error('Assertion Failed: (total is 20)');
            d.setValue(20);
            if (!(total === 40))
                throw new Error('Assertion Failed: (total is 40)');
            d.unwatch(watcher);
            if (!(total === 40))
                throw new Error('Assertion Failed: (total is 40)');
            d.setValue(50);
            if (!(total === 40))
                throw new Error('Assertion Failed: (total is 40)');
        }
    }, require('./Expression'));
module.exports = exports = DynamicExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/DynamicExpression',_runtime_DynamicExpression_);
    else
      _runtime_DynamicExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_DynamicExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_Expression_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Expression = ion.defineClass({
        id: 'Expression',
        properties: {
            watch: function (watcher) {
                throw new Error('not implemented');
            },
            unwatch: function (watcher) {
                throw new Error('not implemented');
            }
        }
    }, require('./Node'));
module.exports = exports = Expression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Expression',_runtime_Expression_);
    else
      _runtime_Expression_.call(this, module, exports, require);
  }
  else {
    _runtime_Expression_.call(this);
  }
}).call(this)
void (function(){var _runtime_ExpressionStatement_ = function(module,exports,require){'use strict';
const ion = require('../'), Statement = require('./Statement');
const ExpressionStatement = ion.defineClass({
        id: 'ExpressionStatement',
        properties: {
            activate: function () {
                ExpressionStatement.super.prototype.activate.apply(this, arguments);
                this.runtimeExpression = this.runtimeExpression != null ? this.runtimeExpression : this.context.createRuntime(this.expression);
                this.runtimeExpression.watch(this.runtimeExpressionWatcher = this.runtimeExpressionWatcher != null ? this.runtimeExpressionWatcher : function (value) {
                    if (this.expressionValue !== value) {
                        this.expressionValue = value;
                        this._remove != null ? this._remove() : void 0;
                        this._remove = null;
                        if (this.context.output != null && value !== void 0) {
                            this._remove = ion.add(this.context.output, value);
                        }
                    }
                }.bind(this));
            },
            deactivate: function () {
                ExpressionStatement.super.prototype.deactivate.apply(this, arguments);
                this.runtimeExpression.unwatch(this.runtimeExpressionWatcher);
            }
        }
    }, Statement);
module.exports = exports = ExpressionStatement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/ExpressionStatement',_runtime_ExpressionStatement_);
    else
      _runtime_ExpressionStatement_.call(this, module, exports, require);
  }
  else {
    _runtime_ExpressionStatement_.call(this);
  }
}).call(this)
void (function(){var _runtime_Factory_ = function(module,exports,require){'use strict';
const ion = require('../');
const Literal = require('./Literal');
const Factory = ion.defineClass({
        id: 'Factory',
        properties: {
            runtime: './OperationExpression',
            createRuntime: {
                writable: true,
                value: function (context, ast) {
                    let properties = ion.clone(ast);
                    properties.context = context;
                    properties.factory = this;
                    let type = require(this.runtime);
                    return new type(properties);
                }
            }
        }
    });
Factory;
let _ref = new Factory();
{
    _ref.runtime = './VariableDeclaration';
}
let _ref2 = new Factory();
{
    _ref2.createRuntime = function (context, ast) {
        return context.getVariableExpression(ast.name);
    };
}
let _ref3 = new Factory();
{
    _ref3.createRuntime = function (context, ast) {
        let value = ast.value;
        if (ast.context) {
            value = value(context);
        }
        return new Literal({ value: value });
    };
}
let _ref4 = new Factory();
{
    _ref4.runtime = './Template';
}
let _ref5 = new Factory();
{
    _ref5.runtime = './Literal';
}
let _ref6 = new Factory();
{
    _ref6.runtime = './Property';
}
let _ref7 = new Factory();
{
    _ref7.runtime = './IfStatement';
}
let _ref8 = new Factory();
{
    _ref8.runtime = './BlockStatement';
}
let _ref9 = new Factory();
{
    _ref9.runtime = './ReturnStatement';
}
let _ref10 = new Factory();
{
    _ref10.runtime = './ObjectExpression';
}
let _ref11 = new Factory();
{
    _ref11.runtime = './ArrayExpression';
}
let _ref12 = new Factory();
{
    _ref12.runtime = './ExpressionStatement';
}
let _ref13 = new Factory();
{
    _ref13.runtime = './ForInOfStatement';
}
let _ref14 = new Factory();
{
    _ref14.runtime = './ForInOfStatement';
}
let _ref15 = new Factory();
{
    _ref15.runtime = './MemberExpression';
}
let _ref16 = new Factory();
{
    _ref16.runtime = './CallExpression';
}
let _ref17 = new Factory();
{
    _ref17.runtime = './CallExpression';
}
let _ref18 = new Factory();
{
    _ref18.evaluate = function (a) {
        return !a;
    };
}
let _ref19 = new Factory();
{
    _ref19.evaluate = function (a) {
        return typeof a;
    };
}
let _ref20 = new Factory();
{
    _ref20.evaluate = function (a) {
        return void a;
    };
}
let _ref21 = new Factory();
{
    _ref21.evaluate = function (a) {
        return -a;
    };
}
let _ref22 = new Factory();
{
    _ref22.evaluate = function (a) {
        return +a;
    };
}
let _ref23 = new Factory();
{
    _ref23.evaluate = function (a) {
        return ~a;
    };
}
let _ref24 = new Factory();
{
    _ref24.evaluate = function (a) {
        return a != null;
    };
}
let _ref25 = new Factory();
{
    _ref25.evaluate = function (test, consequent, alternate) {
        return test ? consequent : alternate;
    };
}
let _ref26 = new Factory();
{
    _ref26.evaluate = function (left, right) {
        return left * right;
    };
}
let _ref27 = new Factory();
{
    _ref27.evaluate = function (left, right) {
        return left / right;
    };
}
let _ref28 = new Factory();
{
    _ref28.evaluate = function (left, right) {
        return left % right;
    };
}
let _ref29 = new Factory();
{
    _ref29.evaluate = function (left, right) {
        return left + right;
    };
}
let _ref30 = new Factory();
{
    _ref30.evaluate = function (left, right) {
        return left - right;
    };
}
let _ref31 = new Factory();
{
    _ref31.evaluate = function (left, right) {
        return left && right;
    };
}
let _ref32 = new Factory();
{
    _ref32.evaluate = function (left, right) {
        return left || right;
    };
}
let _ref33 = new Factory();
{
    _ref33.evaluate = function (left, right) {
        return left & right;
    };
}
let _ref34 = new Factory();
{
    _ref34.evaluate = function (left, right) {
        return left | right;
    };
}
let _ref35 = new Factory();
{
    _ref35.evaluate = function (left, right) {
        return left == right;
    };
}
let _ref36 = new Factory();
{
    _ref36.evaluate = function (left, right) {
        return left != right;
    };
}
let _ref37 = new Factory();
{
    _ref37.evaluate = function (left, right) {
        return left === right;
    };
}
let _ref38 = new Factory();
{
    _ref38.evaluate = function (left, right) {
        return left !== right;
    };
}
let _ref39 = new Factory();
{
    _ref39.evaluate = function (left, right) {
        return left < right;
    };
}
let _ref40 = new Factory();
{
    _ref40.evaluate = function (left, right) {
        return left > right;
    };
}
let _ref41 = new Factory();
{
    _ref41.evaluate = function (left, right) {
        return left <= right;
    };
}
let _ref42 = new Factory();
{
    _ref42.evaluate = function (left, right) {
        return left >= right;
    };
}
const lookup = {
        type: {
            VariableDeclaration: _ref,
            Identifier: _ref2,
            Function: _ref3,
            Template: _ref4,
            Literal: _ref5,
            Property: _ref6,
            IfStatement: _ref7,
            BlockStatement: _ref8,
            ReturnStatement: _ref9,
            ObjectExpression: _ref10,
            ArrayExpression: _ref11,
            ExpressionStatement: _ref12,
            ForOfStatement: _ref13,
            ForInStatement: _ref14,
            MemberExpression: _ref15,
            CallExpression: _ref16,
            NewExpression: _ref17,
            UnaryExpression: {
                operator: {
                    '!': _ref18,
                    'typeof': _ref19,
                    'void': _ref20,
                    '-': _ref21,
                    '+': _ref22,
                    '~': _ref23,
                    '?': _ref24
                }
            },
            ConditionalExpression: _ref25,
            BinaryExpression: {
                operator: {
                    '*': _ref26,
                    '/': _ref27,
                    '%': _ref28,
                    '+': _ref29,
                    '-': _ref30,
                    '&&': _ref31,
                    '||': _ref32,
                    '&': _ref33,
                    '|': _ref34,
                    '==': _ref35,
                    '!=': _ref36,
                    '===': _ref37,
                    '!==': _ref38,
                    '<': _ref39,
                    '>': _ref40,
                    '<=': _ref41,
                    '>=': _ref42
                }
            }
        }
    };
function getFactory(ast, step) {
    if (step == null)
        step = lookup;
    for (let key in step) {
        let values = step[key];
        let nodeValue = ast[key];
        let next = values[nodeValue];
        if (next != null) {
            if (next.constructor === Factory) {
                return next;
            }
            return getFactory(ast, next);
        }
    }
    return null;
}
const createRuntime = exports.createRuntime = function (context, ast) {
        if (typeof (ast != null ? ast.type : void 0) !== 'string') {
            ast = {
                type: 'Literal',
                value: ast
            };
        }
        let factory = getFactory(ast);
        if (!(factory != null)) {
            throw new Error('Factory not found for ast:\n' + JSON.stringify(ast, null, '  '));
        }
        return factory.createRuntime(context, ast);
    }, test = exports.test = function () {
        let factory = getFactory({
                type: 'BinaryExpression',
                operator: '>',
                left: {
                    type: 'Literal',
                    value: 1
                },
                right: {
                    type: 'Literal',
                    value: 2
                }
            });
        if (!(factory === lookup.type.BinaryExpression.operator['>']))
            throw new Error('Assertion Failed: (factory is lookup.type.BinaryExpression.operator[">"])');
        if (!(lookup.type.BinaryExpression.operator['>'] != null))
            throw new Error('Assertion Failed: (lookup.type.BinaryExpression.operator[">"]?)');
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Factory',_runtime_Factory_);
    else
      _runtime_Factory_.call(this, module, exports, require);
  }
  else {
    _runtime_Factory_.call(this);
  }
}).call(this)
void (function(){var _runtime_ForInOfStatement_ = function(module,exports,require){'use strict';
const ion = require('../'), Statement = require('./Statement');
const ForInOfStatement = ion.defineClass({
        id: 'ForInOfStatement',
        properties: {
            toKey: function (name) {
                if (this.type === 'ForOfStatement') {
                    return parseInt(name);
                } else {
                    return name;
                }
            },
            forEach: function (collection, callback) {
                if (this.type === 'ForOfStatement') {
                    for (let key = 0; key < collection.length; key++) {
                        let value = collection[key];
                        callback(key, value);
                    }
                } else {
                    for (let key in collection) {
                        let value = collection[key];
                        callback(key, value);
                    }
                }
            },
            activate: function () {
                ForInOfStatement.super.prototype.activate.apply(this, arguments);
                this.statements = this.statements != null ? this.statements : {};
                this.collectionExpression = this.collectionExpression != null ? this.collectionExpression : this.context.createRuntime(this.right);
                this.collectionExpression.watch(this.collectionWatcher = this.collectionWatcher != null ? this.collectionWatcher : function (collection) {
                    if (this.collection !== collection) {
                        if (this.collection != null) {
                            this.forEach(this.collection, this.removeItem.bind(this));
                            ion.unobserve(this.collection, this.collectionObserver);
                        }
                        this.collection = collection;
                        if (this.collection != null) {
                            this.forEach(this.collection, this.addItem.bind(this));
                            ion.observe(this.collection, this.collectionObserver = this.collectionObserver != null ? this.collectionObserver : this.applyChanges.bind(this));
                        }
                    }
                }.bind(this));
            },
            deactivate: function () {
                ForInOfStatement.super.prototype.deactivate.apply(this, arguments);
                this.collectionExpression.unwatch(this.collectionWatcher);
            },
            addItem: function (key, value) {
                if (value !== void 0) {
                    let newContext = this.context.newContext();
                    newContext.setVariable(this.left.declarations[this.type === 'ForOfStatement' ? 0 : 1] != null ? this.left.declarations[this.type === 'ForOfStatement' ? 0 : 1].id.name : void 0, value);
                    newContext.setVariable(this.left.declarations[this.type === 'ForOfStatement' ? 1 : 0] != null ? this.left.declarations[this.type === 'ForOfStatement' ? 1 : 0].id.name : void 0, key);
                    let statement = this.statements[key] = newContext.createRuntime(this.body);
                    statement.activate();
                }
            },
            removeItem: function (key, value) {
                let statement = this.statements[key];
                statement != null ? statement.deactivate() : void 0;
                delete this.statements[key];
            },
            applyChanges: function (changes) {
                function ignoreProperty(name) {
                    if (!(name != null)) {
                        return true;
                    }
                    if (name[0] === '_') {
                        return true;
                    }
                    if (name === 'length' && this.type === 'ForOfStatement') {
                        return true;
                    }
                    return false;
                }
                for (let _i = 0; _i < changes.length; _i++) {
                    let _ref = changes[_i];
                    let name = _ref.name;
                    let oldValue = _ref.oldValue;
                    let ignore = ignoreProperty(name);
                    if (!ignore) {
                        let newValue = this.collection[name];
                        let key = this.toKey(name);
                        if (oldValue !== void 0) {
                            this.removeItem(key, oldValue);
                        }
                        if (newValue !== void 0) {
                            this.addItem(key, newValue);
                        }
                    }
                }
            }
        }
    }, Statement);
module.exports = exports = ForInOfStatement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/ForInOfStatement',_runtime_ForInOfStatement_);
    else
      _runtime_ForInOfStatement_.call(this, module, exports, require);
  }
  else {
    _runtime_ForInOfStatement_.call(this);
  }
}).call(this)
void (function(){var _runtime_IfStatement_ = function(module,exports,require){'use strict';
const ion = require('../'), Statement = require('./Statement');
const IfStatement = ion.defineClass({
        id: 'IfStatement',
        properties: {
            activate: function () {
                IfStatement.super.prototype.activate.apply(this, arguments);
                this.testExpression = this.testExpression != null ? this.testExpression : this.context.createRuntime(this.test);
                this.testExpression.watch(this.testExpressionWatcher = this.testExpressionWatcher != null ? this.testExpressionWatcher : function (value) {
                    if (value) {
                        if (this.alternateStatement != null ? this.alternateStatement.isActive : void 0) {
                            this.alternateStatement != null ? this.alternateStatement.deactivate() : void 0;
                        }
                        this.consequentStatement = this.consequentStatement != null ? this.consequentStatement : this.context.createRuntime(this.consequent);
                        this.consequentStatement.activate();
                    } else {
                        if (this.consequentStatement != null ? this.consequentStatement.isActive : void 0) {
                            this.consequentStatement != null ? this.consequentStatement.deactivate() : void 0;
                        }
                        if (this.alternate != null) {
                            this.alternateStatement = this.alternateStatement != null ? this.alternateStatement : this.context.createRuntime(this.alternate);
                            this.alternateStatement.activate();
                        }
                    }
                }.bind(this));
            },
            deactivate: function () {
                IfStatement.super.prototype.deactivate.apply(this, arguments);
                this.testExpression.unwatch(this.testExpressionWatcher);
                if (this.alternateStatement != null ? this.alternateStatement.isActive : void 0) {
                    this.alternateStatement != null ? this.alternateStatement.deactivate() : void 0;
                }
                if (this.consequentStatement != null ? this.consequentStatement.isActive : void 0) {
                    this.consequentStatement != null ? this.consequentStatement.deactivate() : void 0;
                }
            }
        }
    }, Statement);
module.exports = exports = IfStatement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/IfStatement',_runtime_IfStatement_);
    else
      _runtime_IfStatement_.call(this, module, exports, require);
  }
  else {
    _runtime_IfStatement_.call(this);
  }
}).call(this)
void (function(){var _runtime_Literal_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Literal = ion.defineClass({
        id: 'Literal',
        properties: {
            watch: function (watcher) {
                watcher(this.value);
            },
            unwatch: function (watcher) {
                watcher(void 0);
            }
        }
    }, require('./Expression'));
module.exports = exports = Literal;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Literal',_runtime_Literal_);
    else
      _runtime_Literal_.call(this, module, exports, require);
  }
  else {
    _runtime_Literal_.call(this);
  }
}).call(this)
void (function(){var _runtime_MemberExpression_ = function(module,exports,require){'use strict';
const ion = require('../'), DynamicExpression = require('./DynamicExpression');
const MemberExpression = ion.defineClass({
        id: 'MemberExpression',
        properties: {
            activate: function () {
                MemberExpression.super.prototype.activate.apply(this, arguments);
                this.objectExpression = this.objectExpression != null ? this.objectExpression : this.context.createRuntime(this.object);
                this.objectExpression.watch(this.objectWatcher = this.objectWatcher != null ? this.objectWatcher : function (objectValue) {
                    this.objectValue = objectValue;
                    this.updateValue();
                    this.objectObserver != null ? this.objectObserver() : void 0;
                    if (objectValue != null) {
                        this.objectObserver = ion.observe(objectValue, function (changes) {
                            this.updateValue();
                        }.bind(this));
                    }
                }.bind(this));
                this.propertyExpression = this.propertyExpression != null ? this.propertyExpression : this.context.createRuntime(this.computed ? this.property : this.property.name);
                this.propertyExpression.watch(this.propertyWatcher = this.propertyWatcher != null ? this.propertyWatcher : function (propertyValue) {
                    this.propertyValue = propertyValue;
                    this.updateValue();
                }.bind(this));
            },
            deactivate: function () {
                MemberExpression.super.prototype.deactivate.apply(this, arguments);
                this.objectExpression.unwatch(this.objectWatcher);
                this.propertyExpression.unwatch(this.propertyWatcher);
            },
            updateValue: function () {
                let value = void 0;
                if (this.objectValue != null && this.propertyValue != null) {
                    value = ion.get(this.objectValue, this.propertyValue);
                }
                this.setValue(value);
            },
            setMemberValue: function (value) {
                if (this.objectValue != null && this.propertyValue != null) {
                    ion.set(this.objectValue, this.propertyValue, value);
                }
            }
        }
    }, DynamicExpression);
module.exports = exports = MemberExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/MemberExpression',_runtime_MemberExpression_);
    else
      _runtime_MemberExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_MemberExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_Node_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Node = ion.defineClass({ id: 'Node' });
module.exports = exports = Node;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Node',_runtime_Node_);
    else
      _runtime_Node_.call(this, module, exports, require);
  }
  else {
    _runtime_Node_.call(this);
  }
}).call(this)
void (function(){var _runtime_ObjectExpression_ = function(module,exports,require){'use strict';
const DynamicExpression = require('./DynamicExpression'), ion = require('../');
const ObjectExpression = ion.defineClass({
        id: 'ObjectExpression',
        properties: {
            setLeftValue: function (value) {
                this.value = value;
            },
            activate: function () {
                ObjectExpression.super.prototype.activate.apply(this, arguments);
                this.typeExpression = this.typeExpression != null ? this.typeExpression : this.context.createRuntime(this.objectType != null ? this.objectType : null);
                this.typeExpression.watch(this.typeWatcher = this.typeWatcher != null ? this.typeWatcher : function (type) {
                    let value;
                    if (type === void 0) {
                        value = void 0;
                    } else if (!ion.is(this.value, type)) {
                        this.statements != null ? this.statements.deactivate() : void 0;
                        this.statements = null;
                        if (type != null && typeof type === 'object') {
                            value = type;
                        } else {
                            value = new (type != null ? type : Object)();
                        }
                    } else {
                        value = this.value;
                    }
                    if (value != null && !(this.statements != null)) {
                        let newContext = this.context.newContext(value);
                        this.statements = newContext.createRuntime({
                            type: 'BlockStatement',
                            body: this.properties
                        });
                        this.statements.activate();
                    }
                    this.setValue(value);
                }.bind(this));
            },
            deactivate: function () {
                ObjectExpression.super.prototype.deactivate.apply(this, arguments);
                this.typeExpression.unwatch(this.typeWatcher);
            }
        }
    }, DynamicExpression);
module.exports = exports = ObjectExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/ObjectExpression',_runtime_ObjectExpression_);
    else
      _runtime_ObjectExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_ObjectExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_OperationExpression_ = function(module,exports,require){'use strict';
const ion = require('ion');
const DynamicExpression = require('./DynamicExpression');
const OperationExpression = ion.defineClass({
        id: 'OperationExpression',
        constructor: function OperationExpression(properties) {
            OperationExpression.super.apply(this, arguments);
            if (!(this.args != null)) {
                if (this.type === 'BinaryExpression') {
                    this.args = [
                        this.left,
                        this.right
                    ];
                } else if (this.type === 'UnaryExpression') {
                    this.args = [this.argument];
                } else if (this.type === 'ConditionalExpression') {
                    this.args = [
                        this.test,
                        this.consequent,
                        this.alternate
                    ];
                }
            }
        },
        properties: {
            args: null,
            activate: function () {
                OperationExpression.super.prototype.activate.apply(this, arguments);
                this.argumentExpressions = this.argumentExpressions != null ? this.argumentExpressions : this.context.createRuntime({
                    type: 'ArrayExpression',
                    elements: this.args,
                    observeElements: this.factory.observe
                });
                this.argumentExpressions.watch(this.watcher = this.watcher != null ? this.watcher : function (value) {
                    this.argumentValues = value;
                    this.evaluate();
                }.bind(this));
            },
            deactivate: function () {
                OperationExpression.super.prototype.deactivate.apply(this, arguments);
                this.argumentExpressions.unwatch(this.watcher);
            },
            evaluate: function () {
                if (!(this.factory.evaluate != null)) {
                    throw new Error('evaluate method not defined for operation: ' + this.factory);
                }
                let value = this.factory.evaluate.apply(this.context, this.argumentValues);
                this.setValue(value);
            }
        }
    }, DynamicExpression);
module.exports = OperationExpression;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/OperationExpression',_runtime_OperationExpression_);
    else
      _runtime_OperationExpression_.call(this, module, exports, require);
  }
  else {
    _runtime_OperationExpression_.call(this);
  }
}).call(this)
void (function(){var _runtime_Property_ = function(module,exports,require){'use strict';
const ion = require('../'), Statement = require('./Statement');
const Property = ion.defineClass({
        id: 'Property',
        properties: {
            activate: function () {
                Property.super.prototype.activate.apply(this, arguments);
                this.keyExpression = this.keyExpression != null ? this.keyExpression : this.context.createRuntime(this.computed ? this.key : this.key.name);
                this.valueExpression = this.valueExpression != null ? this.valueExpression : this.context.createRuntime(this.value);
                this.keyExpression.watch(this.keyWatcher = this.keyWatcher != null ? this.keyWatcher : function (key) {
                    if (key != null && this.valueExpression.setLeftValue != null) {
                        let currentValue = this.context.output ? ion.get(this.context.output, key) : this.context.get(key);
                        if (currentValue != null) {
                            this.valueExpression.setLeftValue(currentValue);
                        }
                    }
                    this.restoreProperty();
                    this.keyValue = key;
                    this.setProperty();
                }.bind(this));
                this.valueExpression.watch(this.valueWatcher = this.valueWatcher != null ? this.valueWatcher : function (value) {
                    this.valueValue = value;
                    this.setProperty();
                }.bind(this));
            },
            deactivate: function () {
                Property.super.prototype.deactivate.apply(this, arguments);
                this.restoreProperty();
                this.keyExpression.unwatch(this.keyWatcher);
                this.valueExpression.unwatch(this.valueWatcher);
            },
            restoreProperty: function () {
                if (this.originalKey != null) {
                    ion.set(this.context.output, this.originalKey, this.originalValue);
                    this.originalKey = void 0;
                    this.originalValue = void 0;
                }
            },
            setProperty: function (key, value) {
                if (key == null)
                    key = this.keyValue;
                if (value == null)
                    value = this.valueValue;
                if (key != null && value !== void 0) {
                    let currentValue = ion.get(this.context.output, key);
                    if (currentValue !== value) {
                        this.originalKey = this.originalKey != null ? this.originalKey : key;
                        this.originalValue = this.originalValue != null ? this.originalValue : currentValue;
                        ion.set(this.context.output, key, value);
                    }
                }
            }
        }
    }, Statement);
module.exports = exports = Property;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Property',_runtime_Property_);
    else
      _runtime_Property_.call(this, module, exports, require);
  }
  else {
    _runtime_Property_.call(this);
  }
}).call(this)
void (function(){var _runtime_ReturnStatement_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Statement = require('./Statement');
const ReturnStatement = ion.defineClass({
        id: 'ReturnStatement',
        properties: {
            activate: function () {
                ReturnStatement.super.prototype.activate.apply(this, arguments);
                this.argumentExpression = this.argumentExpression != null ? this.argumentExpression : this.context.createRuntime(this.argument);
                this.argumentExpression.watch(this.argumentWatcher = this.argumentWatcher != null ? this.argumentWatcher : function (value) {
                    return this.context.returnExpression.setValue(value);
                }.bind(this));
            },
            deactivate: function () {
                ReturnStatement.super.prototype.deactivate.apply(this, arguments);
                this.argumentExpression.unwatch(this.argumentWatcher);
            }
        }
    }, Statement);
module.exports = exports = ReturnStatement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/ReturnStatement',_runtime_ReturnStatement_);
    else
      _runtime_ReturnStatement_.call(this, module, exports, require);
  }
  else {
    _runtime_ReturnStatement_.call(this);
  }
}).call(this)
void (function(){var _runtime_Statement_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Statement = ion.defineClass({
        id: 'Statement',
        properties: {
            isActive: false,
            activate: function () {
                this.isActive = true;
            },
            deactivate: function () {
                this.isActive = false;
            }
        }
    }, require('./Node'));
module.exports = exports = Statement;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Statement',_runtime_Statement_);
    else
      _runtime_Statement_.call(this, module, exports, require);
  }
  else {
    _runtime_Statement_.call(this);
  }
}).call(this)
void (function(){var _runtime_Template_ = function(module,exports,require){'use strict';
const ion = require('ion');
const BlockStatement = require('./BlockStatement'), DynamicExpression = require('./DynamicExpression');
const Template = ion.defineClass({
        id: 'Template',
        constructor: function Template() {
            Template.super.apply(this, arguments);
            this.context.returnExpression = new DynamicExpression();
        },
        properties: {
            watch: function (watcher) {
                if (!this.isActive) {
                    throw new Error('You must activate a Template before you watch it.');
                }
                this.context.returnExpression.watch(watcher);
            },
            unwatch: function (watcher) {
                this.context.returnExpression.unwatch(watcher);
            }
        }
    }, BlockStatement);
module.exports = exports = Template;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/Template',_runtime_Template_);
    else
      _runtime_Template_.call(this, module, exports, require);
  }
  else {
    _runtime_Template_.call(this);
  }
}).call(this)
void (function(){var _runtime_VariableDeclaration_ = function(module,exports,require){'use strict';
const ion = require('ion');
const Statement = require('./Statement');
const VariableDeclaration = ion.defineClass({
        id: 'VariableDeclaration',
        constructor: function VariableDeclaration() {
            VariableDeclaration.super.apply(this, arguments);
            {
                let _ref = this.declarations;
                for (let _i = 0; _i < _ref.length; _i++) {
                    let _ref2 = _ref[_i];
                    let name = _ref2.id.name;
                    let init = _ref2.init;
                    this.context.setVariable(name, init);
                }
            }
        }
    }, Statement);
module.exports = exports = VariableDeclaration;
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('runtime/VariableDeclaration',_runtime_VariableDeclaration_);
    else
      _runtime_VariableDeclaration_.call(this, module, exports, require);
  }
  else {
    _runtime_VariableDeclaration_.call(this);
  }
}).call(this)
void (function(){var _test_immediateTemplates_ = function(module,exports,require){'use strict';
const ion = require('../');
const templates = [
        [
            function _template() {
                if (this != null && this.constructor === _template) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [
                                    {
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'a'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 1
                                        }
                                    },
                                    {
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'b'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 2
                                        }
                                    },
                                    {
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'c'
                                        },
                                        init: {
                                            type: 'BinaryExpression',
                                            operator: '+',
                                            left: {
                                                type: 'Identifier',
                                                name: 'a'
                                            },
                                            right: {
                                                type: 'Identifier',
                                                name: 'b'
                                            }
                                        }
                                    }
                                ],
                                kind: 'const'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Identifier',
                                    name: 'c'
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                const a = 1, b = 2, c = a + b;
                return c;
            },
            [],
            3
        ],
        [
            function _template2() {
                if (this != null && this.constructor === _template2) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    properties: [
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'a'
                                            },
                                            value: {
                                                type: 'Literal',
                                                value: 1
                                            },
                                            kind: 'init'
                                        },
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'b'
                                            },
                                            value: {
                                                type: 'Literal',
                                                value: 2
                                            },
                                            kind: 'init'
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return {
                    a: 1,
                    b: 2
                };
            },
            [],
            {
                a: 1,
                b: 2
            }
        ],
        [
            function _template3() {
                if (this != null && this.constructor === _template3) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ArrayExpression',
                                        elements: []
                                    },
                                    properties: [
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Literal',
                                                value: 1
                                            }
                                        },
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Literal',
                                                value: 2
                                            }
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return [
                    1,
                    2
                ];
            },
            [],
            [
                1,
                2
            ]
        ],
        [
            function _template4() {
                if (this != null && this.constructor === _template4) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'a'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 1
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'b'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 2
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ArrayExpression',
                                        elements: []
                                    },
                                    properties: [
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Identifier',
                                                name: 'a'
                                            }
                                        },
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Identifier',
                                                name: 'b'
                                            }
                                        },
                                        {
                                            type: 'IfStatement',
                                            test: {
                                                type: 'BinaryExpression',
                                                operator: '>',
                                                left: {
                                                    type: 'Identifier',
                                                    name: 'a'
                                                },
                                                right: {
                                                    type: 'Identifier',
                                                    name: 'b'
                                                }
                                            },
                                            consequent: {
                                                type: 'BlockStatement',
                                                body: [{
                                                        type: 'ExpressionStatement',
                                                        expression: {
                                                            type: 'Literal',
                                                            value: 10
                                                        }
                                                    }]
                                            },
                                            alternate: {
                                                type: 'IfStatement',
                                                test: {
                                                    type: 'BinaryExpression',
                                                    operator: '>',
                                                    left: {
                                                        type: 'Identifier',
                                                        name: 'b'
                                                    },
                                                    right: {
                                                        type: 'Identifier',
                                                        name: 'a'
                                                    }
                                                },
                                                consequent: {
                                                    type: 'BlockStatement',
                                                    body: [{
                                                            type: 'ExpressionStatement',
                                                            expression: {
                                                                type: 'Literal',
                                                                value: 20
                                                            }
                                                        }]
                                                },
                                                alternate: null
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let a = 1;
                let b = 2;
                let _ref4 = [];
                {
                    _ref4.push(a);
                    _ref4.push(b);
                    if (a > b) {
                        _ref4.push(10);
                    } else if (b > a) {
                        _ref4.push(20);
                    }
                }
                return _ref4;
            },
            [],
            [
                1,
                2,
                20
            ]
        ],
        [
            function _template5() {
                if (this != null && this.constructor === _template5) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'items'
                                        },
                                        init: {
                                            type: 'ArrayExpression',
                                            elements: [
                                                {
                                                    type: 'Literal',
                                                    value: 1
                                                },
                                                {
                                                    type: 'Literal',
                                                    value: 2
                                                },
                                                {
                                                    type: 'Literal',
                                                    value: 3
                                                }
                                            ]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'x'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            objectType: {
                                                type: 'ArrayExpression',
                                                elements: []
                                            },
                                            properties: [{
                                                    type: 'ForOfStatement',
                                                    left: {
                                                        type: 'VariableDeclaration',
                                                        declarations: [
                                                            {
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'item'
                                                                },
                                                                init: null
                                                            },
                                                            {
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'index'
                                                                },
                                                                init: null
                                                            }
                                                        ],
                                                        kind: 'let'
                                                    },
                                                    right: {
                                                        type: 'Identifier',
                                                        name: 'items'
                                                    },
                                                    body: {
                                                        type: 'ExpressionStatement',
                                                        expression: {
                                                            type: 'BinaryExpression',
                                                            operator: '+',
                                                            left: {
                                                                type: 'Identifier',
                                                                name: 'item'
                                                            },
                                                            right: {
                                                                type: 'Identifier',
                                                                name: 'index'
                                                            }
                                                        }
                                                    }
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Identifier',
                                    name: 'x'
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let items = [
                        1,
                        2,
                        3
                    ];
                let _ref2 = [];
                for (let _i = 0; _i < items.length; _i++) {
                    let index = _i;
                    let item = items[_i];
                    _ref2.push(item + index);
                }
                let x = _ref2;
                return x;
            },
            [],
            [
                1,
                3,
                5
            ]
        ],
        [
            function _template6() {
                if (this != null && this.constructor === _template6) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'items'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            properties: [
                                                {
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'a'
                                                    },
                                                    value: {
                                                        type: 'Literal',
                                                        value: 1
                                                    },
                                                    kind: 'init'
                                                },
                                                {
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'b'
                                                    },
                                                    value: {
                                                        type: 'Literal',
                                                        value: 2
                                                    },
                                                    kind: 'init'
                                                },
                                                {
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'c'
                                                    },
                                                    value: {
                                                        type: 'Literal',
                                                        value: 3
                                                    },
                                                    kind: 'init'
                                                }
                                            ]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'x'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            objectType: {
                                                type: 'ArrayExpression',
                                                elements: []
                                            },
                                            properties: [{
                                                    type: 'ForInStatement',
                                                    left: {
                                                        type: 'VariableDeclaration',
                                                        declarations: [
                                                            {
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'key'
                                                                },
                                                                init: null
                                                            },
                                                            {
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'value'
                                                                },
                                                                init: null
                                                            }
                                                        ],
                                                        kind: 'let'
                                                    },
                                                    right: {
                                                        type: 'Identifier',
                                                        name: 'items'
                                                    },
                                                    body: {
                                                        type: 'ExpressionStatement',
                                                        expression: {
                                                            type: 'BinaryExpression',
                                                            operator: '+',
                                                            left: {
                                                                type: 'Identifier',
                                                                name: 'key'
                                                            },
                                                            right: {
                                                                type: 'Identifier',
                                                                name: 'value'
                                                            }
                                                        }
                                                    }
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Identifier',
                                    name: 'x'
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let items = {
                        a: 1,
                        b: 2,
                        c: 3
                    };
                let _ref3 = [];
                for (let key in items) {
                    let value = items[key];
                    _ref3.push(key + value);
                }
                let x = _ref3;
                return x;
            },
            [],
            [
                'a1',
                'b2',
                'c3'
            ]
        ],
        [
            function _template7() {
                if (this != null && this.constructor === _template7) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'object'
                                        },
                                        init: {
                                            type: 'ObjectExpression',
                                            properties: [{
                                                    type: 'Property',
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'a'
                                                    },
                                                    value: {
                                                        type: 'ObjectExpression',
                                                        properties: [{
                                                                type: 'Property',
                                                                key: {
                                                                    type: 'Identifier',
                                                                    name: 'b'
                                                                },
                                                                value: {
                                                                    type: 'Literal',
                                                                    value: 1
                                                                },
                                                                kind: 'init'
                                                            }]
                                                    },
                                                    kind: 'init'
                                                }]
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'object'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'a'
                                        }
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'b'
                                    }
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let object = { a: { b: 1 } };
                return object.a.b;
            },
            [],
            1
        ],
        [
            function _template8() {
                if (this != null && this.constructor === _template8) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ConditionalExpression',
                                    test: {
                                        type: 'Literal',
                                        value: false
                                    },
                                    consequent: {
                                        type: 'Literal',
                                        value: 1
                                    },
                                    alternate: {
                                        type: 'Literal',
                                        value: 2
                                    }
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return false ? 1 : 2;
            },
            [],
            2
        ],
        [
            function _template9() {
                if (this != null && this.constructor === _template9) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ConditionalExpression',
                                    test: {
                                        type: 'BinaryExpression',
                                        operator: '!=',
                                        left: {
                                            type: 'Literal',
                                            value: null
                                        },
                                        right: {
                                            type: 'Literal',
                                            value: null
                                        }
                                    },
                                    consequent: {
                                        type: 'Literal',
                                        value: null
                                    },
                                    alternate: {
                                        type: 'Literal',
                                        value: 2
                                    }
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return null != null ? null : 2;
            },
            [],
            2
        ],
        [
            function _template10() {
                if (this != null && this.constructor === _template10) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'a'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: null
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'b'
                                        },
                                        init: {
                                            type: 'Literal',
                                            value: 2
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ArrayExpression',
                                    elements: [
                                        {
                                            type: 'UnaryExpression',
                                            operator: '?',
                                            argument: {
                                                type: 'Identifier',
                                                name: 'a'
                                            }
                                        },
                                        {
                                            type: 'UnaryExpression',
                                            operator: '?',
                                            argument: {
                                                type: 'Identifier',
                                                name: 'b'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let a = null;
                let b = 2;
                return [
                    a != null,
                    b != null
                ];
            },
            [],
            [
                false,
                true
            ]
        ],
        [
            function _template11() {
                if (this != null && this.constructor === _template11) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'Math'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'min'
                                        }
                                    },
                                    arguments: [
                                        {
                                            type: 'Literal',
                                            value: 1
                                        },
                                        {
                                            type: 'Literal',
                                            value: 2
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return Math.min(1, 2);
            },
            [],
            1
        ],
        [
            function _template12() {
                if (this != null && this.constructor === _template12) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: {
                                                type: 'Identifier',
                                                name: 'Math'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'min'
                                            }
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'call'
                                        }
                                    },
                                    arguments: [
                                        {
                                            type: 'Literal',
                                            value: null
                                        },
                                        {
                                            type: 'Literal',
                                            value: 1
                                        },
                                        {
                                            type: 'Literal',
                                            value: 2
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return Math.min.call(null, 1, 2);
            },
            [],
            1
        ],
        [
            function _template13() {
                if (this != null && this.constructor === _template13) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'NewExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'Date'
                                    },
                                    arguments: [
                                        {
                                            type: 'Literal',
                                            value: 2011
                                        },
                                        {
                                            type: 'Literal',
                                            value: 10
                                        },
                                        {
                                            type: 'Literal',
                                            value: 5
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return new Date(2011, 10, 5);
            },
            [],
            new Date(2011, 10, 5)
        ],
        [
            function _template14() {
                if (this != null && this.constructor === _template14) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Literal',
                                    value: /foo/
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return /foo/;
            },
            [],
            /foo/
        ],
        [
            function _template15() {
                if (this != null && this.constructor === _template15) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: null,
                                    properties: [
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'x'
                                            },
                                            value: {
                                                type: 'Literal',
                                                value: 1
                                            },
                                            kind: 'init'
                                        },
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'y'
                                            },
                                            value: {
                                                type: 'Literal',
                                                value: 2
                                            },
                                            kind: 'init'
                                        },
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'z'
                                            },
                                            value: {
                                                type: 'ObjectExpression',
                                                objectType: {
                                                    type: 'ArrayExpression',
                                                    elements: []
                                                },
                                                properties: [
                                                    {
                                                        type: 'VariableDeclaration',
                                                        declarations: [{
                                                                type: 'VariableDeclarator',
                                                                id: {
                                                                    type: 'Identifier',
                                                                    name: 'items'
                                                                },
                                                                init: {
                                                                    type: 'ArrayExpression',
                                                                    elements: [
                                                                        {
                                                                            type: 'Literal',
                                                                            value: 3
                                                                        },
                                                                        {
                                                                            type: 'Literal',
                                                                            value: 2
                                                                        },
                                                                        {
                                                                            type: 'Literal',
                                                                            value: 1
                                                                        }
                                                                    ]
                                                                }
                                                            }],
                                                        kind: 'let'
                                                    },
                                                    {
                                                        type: 'ForOfStatement',
                                                        left: {
                                                            type: 'VariableDeclaration',
                                                            declarations: [{
                                                                    type: 'VariableDeclarator',
                                                                    id: {
                                                                        type: 'Identifier',
                                                                        name: 'item'
                                                                    },
                                                                    init: null
                                                                }],
                                                            kind: 'let'
                                                        },
                                                        right: {
                                                            type: 'Identifier',
                                                            name: 'items'
                                                        },
                                                        body: {
                                                            type: 'BlockStatement',
                                                            body: [{
                                                                    type: 'ExpressionStatement',
                                                                    expression: {
                                                                        type: 'BinaryExpression',
                                                                        operator: '*',
                                                                        left: {
                                                                            type: 'Identifier',
                                                                            name: 'item'
                                                                        },
                                                                        right: {
                                                                            type: 'Literal',
                                                                            value: 2
                                                                        }
                                                                    }
                                                                }]
                                                        }
                                                    }
                                                ]
                                            },
                                            kind: 'init'
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let _ref5 = [];
                {
                    let items = [
                            3,
                            2,
                            1
                        ];
                    for (let _i2 = 0; _i2 < items.length; _i2++) {
                        let item = items[_i2];
                        _ref5.push(item * 2);
                    }
                }
                return {
                    x: 1,
                    y: 2,
                    z: _ref5
                };
            },
            [],
            {
                x: 1,
                y: 2,
                z: [
                    6,
                    4,
                    2
                ]
            }
        ],
        [
            function _template16() {
                if (this != null && this.constructor === _template16) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ArrayExpression',
                                    elements: [
                                        {
                                            type: 'ConditionalExpression',
                                            test: {
                                                type: 'BinaryExpression',
                                                operator: '!=',
                                                left: {
                                                    type: 'Literal',
                                                    value: null
                                                },
                                                right: {
                                                    type: 'Literal',
                                                    value: null
                                                }
                                            },
                                            consequent: {
                                                type: 'Literal',
                                                value: null
                                            },
                                            alternate: {
                                                type: 'Literal',
                                                value: 1
                                            }
                                        },
                                        {
                                            type: 'ConditionalExpression',
                                            test: {
                                                type: 'BinaryExpression',
                                                operator: '!=',
                                                left: {
                                                    type: 'UnaryExpression',
                                                    operator: 'void',
                                                    prefix: true,
                                                    argument: {
                                                        type: 'Literal',
                                                        value: 0
                                                    }
                                                },
                                                right: {
                                                    type: 'Literal',
                                                    value: null
                                                }
                                            },
                                            consequent: {
                                                type: 'UnaryExpression',
                                                operator: 'void',
                                                prefix: true,
                                                argument: {
                                                    type: 'Literal',
                                                    value: 0
                                                }
                                            },
                                            alternate: {
                                                type: 'Literal',
                                                value: 2
                                            }
                                        }
                                    ]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                return [
                    null != null ? null : 1,
                    void 0 != null ? void 0 : 2
                ];
            },
            [],
            [
                1,
                2
            ]
        ],
        [
            function _template17(_ref) {
                if (this != null && this.constructor === _template17) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'a'
                                        },
                                        init: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: '_ref'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'a'
                                            },
                                            computed: false
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'b'
                                        },
                                        init: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: '_ref'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'b'
                                            },
                                            computed: false
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'BinaryExpression',
                                    operator: '+',
                                    left: {
                                        type: 'Identifier',
                                        name: 'a'
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: 'b'
                                    }
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        _ref: _ref,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let a = _ref.a;
                let b = _ref.b;
                return a + b;
            },
            [{
                    a: 1,
                    b: 2
                }],
            3
        ],
        [
            function _template18(type) {
                if (this != null && this.constructor === _template18) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'Identifier',
                                        name: 'type'
                                    },
                                    properties: [{
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'position'
                                            },
                                            value: {
                                                type: 'ObjectExpression',
                                                objectType: null,
                                                properties: [{
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'x'
                                                        },
                                                        value: {
                                                            type: 'Literal',
                                                            value: 10
                                                        },
                                                        kind: 'init'
                                                    }]
                                            },
                                            kind: 'init'
                                        }]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        type: type,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                let _ref6 = new type();
                {
                    _ref6.position = ion.patch(_ref6.position, { x: 10 });
                }
                return _ref6;
            },
            [function () {
                    this.position = {
                        x: 1,
                        y: 2
                    };
                }],
            {
                position: {
                    x: 10,
                    y: 2
                }
            }
        ],
        [
            function _template19(input, output) {
                if (this != null && this.constructor === _template19) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'output'
                                },
                                value: {
                                    type: 'ObjectExpression',
                                    objectType: null,
                                    properties: [{
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'e'
                                            },
                                            value: {
                                                type: 'BinaryExpression',
                                                operator: '+',
                                                left: {
                                                    type: 'MemberExpression',
                                                    computed: false,
                                                    object: {
                                                        type: 'Identifier',
                                                        name: 'input'
                                                    },
                                                    property: {
                                                        type: 'Identifier',
                                                        name: 'a'
                                                    }
                                                },
                                                right: {
                                                    type: 'MemberExpression',
                                                    computed: false,
                                                    object: {
                                                        type: 'Identifier',
                                                        name: 'input'
                                                    },
                                                    property: {
                                                        type: 'Identifier',
                                                        name: 'b'
                                                    }
                                                }
                                            },
                                            kind: 'init'
                                        }]
                                },
                                kind: 'init'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Identifier',
                                    name: 'output'
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        input: input,
                        output: output,
                        ion: ion,
                        templates: templates,
                        test: test
                    });
                }
                ion.patch(output, { e: input.a + input.b });
                return output;
            },
            [
                {
                    a: 1,
                    b: 2
                },
                {
                    c: 3,
                    d: 4
                }
            ],
            {
                c: 3,
                d: 4,
                e: 3
            }
        ]
    ];
const test = exports.test = function () {
        for (let _i3 = 0; _i3 < templates.length; _i3++) {
            let _ref7 = templates[_i3];
            let templateType = _ref7[0];
            let args = _ref7[1];
            let expected = _ref7[2];
            if (expected != null) {
                let template = ion.create(templateType, args);
                template.activate();
                let reactiveResult = null;
                template.watch(function (value) {
                    return reactiveResult = value;
                });
                try {
                    if (!(JSON.stringify(reactiveResult) === JSON.stringify(expected)))
                        throw new Error('Assertion Failed: (JSON.stringify(reactiveResult) is JSON.stringify(expected))');
                } catch (e) {
                    console.log(JSON.stringify(reactiveResult), JSON.stringify(expected));
                    throw e;
                }
                template.deactivate();
                if (!(reactiveResult === void 0))
                    throw new Error('Assertion Failed: (reactiveResult is undefined)');
                let imperativeResult = templateType.apply(null, args);
                if (!(JSON.stringify(imperativeResult) === JSON.stringify(expected)))
                    throw new Error('Assertion Failed: (JSON.stringify(imperativeResult) is JSON.stringify(expected))');
            }
        }
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/immediateTemplates',_test_immediateTemplates_);
    else
      _test_immediateTemplates_.call(this, module, exports, require);
  }
  else {
    _test_immediateTemplates_.call(this);
  }
}).call(this)
void (function(){var _test_ionCompiler_ = function(module,exports,require){var index, tests;

index = require('../compiler');

tests = {
  "let x = 10": "'use strict';\nlet x = 10;",
  "for name, value of foo\n    console.log(name + value)": "'use strict';\nfor (let name in foo) {\n    let value = foo[name];\n    console.log(name + value);\n}",
  "for let name, value of {a:1,b:2,c:3}\n    console.log(name + value)": "'use strict';\n{\n    let _ref = {\n            a: 1,\n            b: 2,\n            c: 3\n        };\n    for (let name in _ref) {\n        let value = _ref[name];\n        console.log(name + value);\n    }\n}    ",
  "for let name in [\"a\",\"b\",\"c\"]\n    console.log(name)": "'use strict';\n{\n    let _ref = [\n            'a',\n            'b',\n            'c'\n        ];\n    for (let _i = 0; _i < _ref.length; _i++) {\n        let name = _ref[_i];\n        console.log(name);\n    }\n}",
  "for name, index in [\"a\",\"b\",\"c\"]\n    console.log(name)": "'use strict';\n{\n    let _ref = [\n            'a',\n            'b',\n            'c'\n        ];\n    for (let _i = 0; _i < _ref.length; _i++) {\n        let index = _i;\n        let name = _ref[_i];\n        console.log(name);\n    }\n}",
  "let object =\n    x: 1\n    y: 2\n    foo:\n        z: 3": "'use strict';\nlet object = {\n        x: 1,\n        y: 2,\n        foo: { z: 3 }\n    };",
  "let array = []\n    1\n    2\n    3": "'use strict';\nlet array = [\n        1,\n        2,\n        3\n    ];",
  "let kids = []\n    {}\n        name: \"Alpha\"\n        age: 10\n    {}\n        name: \"Beta\"\n        age: 8": "'use strict';\nlet kids = [\n        {\n            name: 'Alpha',\n            age: 10\n        },\n        {\n            name: 'Beta',\n            age: 8\n        }\n    ];",
  "try\n    doSomething(1)\ncatch e\n    log(e)": "'use strict';\ntry {\n    doSomething(1);\n} catch (e) {\n    log(e);\n}",
  "try\n    doSomething(1)\nfinally\n    log(e)": "'use strict';\ntry {\n    doSomething(1);\n} finally {\n    log(e);\n}",
  "try\n    doSomething(1)\ncatch e\n    console.error(e)\nfinally\n    log(e)": "'use strict';\ntry {\n    doSomething(1);\n} catch (e) {\n    console.error(e);\n} finally {\n    log(e);\n}",
  "for key, name of foo\n    if name is 'a'\n        break\n    else if name is 'b'\n        continue\n    else if name is 'c'\n        return\n    else if name is 'd'\n        throw new Error(\"D\")\n    else\n        return\n            x: 1\n            y: 2": "'use strict';\nfor (let key in foo) {\n    let name = foo[key];\n    if (name === 'a') {\n        break;\n    } else if (name === 'b') {\n        continue;\n    } else if (name === 'c') {\n        return;\n    } else if (name === 'd') {\n        throw new Error('D');\n    } else {\n        return {\n            x: 1,\n            y: 2\n        };\n    }\n}",
  "console.log(\"Hello {{name}}\")": "'use strict';\nconsole.log('Hello ' + name);",
  "console.log(\"{{name}}\")": "'use strict';\nconsole.log('' + name);",
  "console.log(\"{{ 1 }}{{ 2 }}\")": "'use strict';\nconsole.log('' + 1 + 2);",
  "return \"\"\n    <html>\n        <head><title>{{ title }}</title></head>\n        <body>\n        {{ body }}\n        </body>\n    </html>": "'use strict';\nreturn '<html>\\n    <head><title>' + title + '</title></head>\\n    <body>\\n    ' + body + '\\n    </body>\\n</html>';",
  "return ''\n    <html>\n        <head><title>{{ title }}</title></head>\n        <body>\n        {{ body }}\n        </body>\n    </html>": "'use strict';\nreturn '<html>\\n    <head><title>{{ title }}</title></head>\\n    <body>\\n    {{ body }}\\n    </body>\\n</html>';",
  "do -> x": "'use strict';\n(function () {\n    return x;\n}());",
  "do (x, y) => x + y": "'use strict';\n(function (x, y) {\n    return x + y;\n}.bind(this)(x, y));",
  "const ion = import \"ion\"": "'use strict';\nconst ion = require('ion');",
  "export\n    secret: 97542": "'use strict';\nmodule.exports = exports = { secret: 97542 };",
  "export let x = 1, y = 2": "'use strict';\nlet x = exports.x = 1, y = exports.y = 2;",
  "export const\n    x = 1\n    y = 2\n    z = 3": "'use strict';\nconst x = exports.x = 1, y = exports.y = 2, z = exports.z = 3;",
  "let {x,y} = {x:1,y:2}": "'use strict';\nlet _ref = {\n        x: 1,\n        y: 2\n    };\nlet x = _ref.x;\nlet y = _ref.y;",
  "for key, {x:[a,b],y:{c:d}} of points\n    console.log(x, y)": "'use strict';\nfor (let key in points) {\n    let _ref = points[key];\n    let a = _ref.x[0];\n    let b = _ref.x[1];\n    let d = _ref.y.c;\n    console.log(x, y);\n}",
  "for {x:[a,b],y:{c:d}}, index in points\n    console.log(x, y)": "'use strict';\nfor (let _i = 0; _i < points.length; _i++) {\n    let index = _i;\n    let _ref = points[_i];\n    let a = _ref.x[0];\n    let b = _ref.x[1];\n    let d = _ref.y.c;\n    console.log(x, y);\n}",
  "foo ? bar": "'use strict';\nfoo != null ? foo : bar;",
  "foo ?? bar": "'use strict';\nfoo != void 0 ? foo : bar;",
  "let x\nx ?= y": "'use strict';\nlet x;\nx = x != null ? x : y;",
  "let x\nx ??= y": "'use strict';\nlet x;\nx = x != void 0 ? x : y;",
  "for const x, index in foo\n    log(x)": "'use strict';\nfor (let _i = 0; _i < foo.length; _i++) {\n    const index = _i;\n    const x = foo[_i];\n    log(x);\n}",
  "let x = 1, y = 2\n[x,y] = [y,x]": "'use strict';\nlet x = 1, y = 2;\nconst _ref = [\n        y,\n        x\n    ];\nx = _ref[0];\ny = _ref[1];",
  "a?.b": "'use strict';\na != null ? a.b : void 0;",
  "a?.b.c?.d": "'use strict';\na != null ? a.b.c != null ? a.b.c.d : void 0 : void 0;",
  "a?()": "'use strict';\na != null ? a() : void 0;",
  "a?.b?.c?()": "'use strict';\na != null ? a.b != null ? a.b.c != null ? a.b.c() : void 0 : void 0 : void 0;",
  "a?.b().c?()": "'use strict';\na != null ? a.b().c != null ? a.b().c() : void 0 : void 0;",
  "let y = (x) -> 2": "'use strict';\nlet y = function (x) {\n    return 2;\n};",
  "s?": "'use strict';\ns != null;",
  "# also test comments\nlet regex = /foo/": "'use strict';\nlet regex = /foo/;",
  "for let i = 0; i < 10; i++\n    console.log(i)": "'use strict';\nfor (let i = 0; i < 10; i++) {\n    console.log(i);\n}",
  "for key of object if key[0] isnt '_' for c in key\n    console.log(c)": "'use strict';\nfor (let key in object) {\n    if (key[0] !== '_') {\n        for (let _i = 0; _i < key.length; _i++) {\n            let c = key[_i];\n            console.log(c);\n        }\n    }\n}",
  "console.log([key for key of object if key is cool])": "'use strict';\nlet _ref = [];\nfor (let key in object) {\n    if (key === cool) {\n        _ref.push(key);\n    }\n}\nconsole.log(_ref);",
  "(console.log)\n    1\n    2\n    {}\n        x: 1\n        y: 2": "'use strict';\nconsole.log(1, 2, {\n    x: 1,\n    y: 2\n});",
  "let x = ->\n    try\n        foo()\n        bar()\n    catch e\n        baz()": "'use strict';\nlet x = function () {\n    try {\n        foo();\n        bar();\n    } catch (e) {\n        baz();\n    }\n};",
  "if foo\n    # bar": "'use strict';\nif (foo) {\n}",
  "let trim = (a = \"\") -> a.trim()": "'use strict';\nlet trim = function (a) {\n    if (a == null)\n        a = '';\n    return a.trim();\n};",
  "(foo)\n    1\n    2": "'use strict';\nfoo(1, 2);",
  "(compile)\n    foo: 1\n    bar: 2\n    baz:\n        a: 1\n        b: 2": "'use strict';\ncompile({\n    foo: 1,\n    bar: 2,\n    baz: {\n        a: 1,\n        b: 2\n    }\n});",
  "let array = [1,2,3]\n    4\n    5\n    6": "'use strict';\nlet array = [\n        1,\n        2,\n        3,\n        4,\n        5,\n        6\n    ];",
  "let point = new Point(10, 20)\n    z: 30": "'use strict';\nlet point = new Point(10, 20);\n{\n    point.z = 30;\n}",
  "let object = {x:1, y:2}\n    z: 3": "'use strict';\nlet object = {\n        x: 1,\n        y: 2\n    };\n{\n    object.z = 3;\n}",
  "let origin = Point\n    x: 1\n    y: 2": "'use strict';\nlet origin = new Point();\n{\n    origin.x = 1;\n    origin.y = 2;\n}",
  "let origin = Line\n    a: Point\n        x: 0\n        y: 0\n    b: Point\n        x: 10\n        y: 20": "'use strict';\nlet origin = new Line();\n{\n    let _ref = new Point();\n    {\n        _ref.x = 0;\n        _ref.y = 0;\n    }\n    origin.a = ion.patch(origin.a, _ref);\n    let _ref2 = new Point();\n    {\n        _ref2.x = 10;\n        _ref2.y = 20;\n    }\n    origin.b = ion.patch(origin.b, _ref2);\n}",
  "input:\n    # ignore this comment\n    x: 10\n    y: 20\n    z:\n        # also ignore this one\n        a: 1\n        b: 2\n    w: Point\n        x: 0\n        y: 0": "'use strict';\nconst ion = require('ion');\nlet _ref = new Point();\n{\n    _ref.x = 0;\n    _ref.y = 0;\n}\nion.patch(input, {\n    x: 10,\n    y: 20,\n    z: {\n        a: 1,\n        b: 2\n    },\n    w: _ref\n});",
  "let point = Point\n    [x]: 1\n    [y]: 2": "'use strict';\nlet point = new Point();\n{\n    point[x] = 1;\n    point[y] = 2;\n}",
  "let self = @\nlet x = @x\nlet y = @.y\nlet z = this.z": "'use strict';\nlet self = this;\nlet x = this.x;\nlet y = this.y;\nlet z = this.z;",
  "let x = {}\n    [key]: value": "'use strict';\nlet x = {};\n{\n    x[key] = value;\n}",
  "if foo\n    return {}\n        for key, value of object\n            [key]: value": "'use strict';\nif (foo) {\n    let _ref = {};\n    {\n        for (let key in object) {\n            let value = object[key];\n            _ref[key] = value;\n        }\n    }\n    return _ref;\n}",
  "for x, y, z of foo\n    log(foo)": {
    line: 1,
    column: 11
  },
  "export let x": {
    line: 1,
    column: 12
  },
  "export const x": {
    line: 1,
    column: 14
  },
  "export const x = 1\nexport {y:2}": {
    line: 2,
    column: 1
  },
  "const x = 1\nx = 2": {
    line: 2,
    column: 1
  },
  "const double = (x) ->\n    x *= 2\n    return x": "'use strict';\nconst double = function (x) {\n    x *= 2;\n    return x;\n};",
  "x = 1": {
    line: 1,
    column: 1
  },
  "let x = 1\nlet x = 2": {
    line: 2,
    column: 5
  },
  "let x = 1\nconst double = (x) ->\n    return x": "'use strict';\nlet x = 1;\nconst double = function (x) {\n    return x;\n};",
  "console.log(x)\nif a\n    let x = 1": {
    line: 1,
    column: 13
  },
  "if typeof a is 'string' and void a and delete a.b\n    log(a)": "'use strict';\nif (typeof a === 'string' && void a && delete a.b) {\n    log(a);\n}",
  "if 1\n    # 1\n    # 2\n    x = 12": {
    line: 4,
    column: 5
  },
  "export const\n    BlockStatement =\n        isBlock: true\n        newScope: tr ue": {
    line: 4,
    column: 22
  },
  "export class Foo extends import 'Bar'\n    constructor: (x,y) ->\n        @x = x\n        @y = y\n    properties:\n        x: 1\n        y: 2\n        getXY: -> [@x,@y]\n    isThisPropertyStatic: true": "'use strict';\nconst ion = require('ion');\nconst Foo = ion.defineClass({\n        id: 'Foo',\n        constructor: function Foo(x, y) {\n            this.x = x;\n            this.y = y;\n        },\n        properties: {\n            x: 1,\n            y: 2,\n            getXY: function () {\n                return [\n                    this.x,\n                    this.y\n                ];\n            }\n        },\n        isThisPropertyStatic: true\n    }, require('Bar'));\nmodule.exports = exports = Foo;",
  "double(a) -> a * 2": "'use strict';\nfunction double(a) {\n    return a * 2;\n}",
  "double(a) -> a * 2\ndouble = 12": {
    line: 2,
    column: 1
  },
  "let object =\n    double(a) -> a * 2\n    if a\n        [key]: value\n    else\n        foo: double(2)": "'use strict';\nlet object = {};\n{\n    function double(a) {\n        return a * 2;\n    }\n    if (a) {\n        object[key] = value;\n    } else {\n        object.foo = double(2);\n    }\n}",
  "let items = []\n    for key, value of window\n        value": "'use strict';\nlet items = [];\n{\n    for (let key in window) {\n        let value = window[key];\n        items.push(value);\n    }\n}",
  "let foo = div\n    span\n        'Hello'": "'use strict';\nconst ion = require('ion');\nlet foo = new div();\n{\n    let _ref = new span();\n    {\n        ion.add(_ref, 'Hello');\n    }\n    ion.add(foo, _ref);\n}",
  "const ion = import './'\nlet foo = div\n    span\n        'Hello'": "'use strict';\nconst ion = require('./');\nlet foo = new div();\n{\n    let _ref = new span();\n    {\n        ion.add(_ref, 'Hello');\n    }\n    ion.add(foo, _ref);\n}",
  "translate({x,y}) ->\n    x++\n    y++\n    return {x,y}": "'use strict';\nfunction translate(_ref) {\n    let x = _ref.x;\n    let y = _ref.y;\n    x++;\n    y++;\n    return {\n        x: x,\n        y: y\n    };\n}",
  "let x = (foo)\n    ''\n        multiline string literal\n    \"\"\n        multiline string template": "'use strict';\nlet x = foo('multiline string literal', 'multiline string template');",
  "assert x is 2": "'use strict';\nif (!(x === 2))\n    throw new Error('Assertion Failed: (x is 2)');",
  "export class Point\n    constructor: ->\n        # call super with arguments object\n        super\n        # call super again with explicit arguments\n        super(width, height)\n        # calling twice is silly, but legal\n    properties:\n        x: 0\n        y: 0\n        superIdentifier: (x, y) -> super\n        superExplicit: (a, b) -> super(a, b)": "'use strict';\nconst ion = require('ion');\nconst Point = ion.defineClass({\n        id: 'Point',\n        constructor: function Point() {\n            Point.super.apply(this, arguments);\n            Point.super.call(this, width, height);\n        },\n        properties: {\n            x: 0,\n            y: 0,\n            superIdentifier: function (x, y) {\n                return Point.super.prototype.superIdentifier.apply(this, arguments);\n            },\n            superExplicit: function (a, b) {\n                return Point.super.prototype.superExplicit.call(this, a, b);\n            }\n        }\n    });\nmodule.exports = exports = Point;",
  "spreadFunction1(a, b, ...c) ->\n    log(1)\nspreadFunction2(a, b, ...c, d, e) ->\n    log(2)\nspreadFunction3(a,b, ...c, {d,e}) ->\n    log(3)": "'use strict';\nfunction spreadFunction1(a, b, ___c) {\n    let c = Array.prototype.slice.call(arguments, 2);\n    log(1);\n}\nfunction spreadFunction2(a, b, ___c, d, e) {\n    let c = Array.prototype.slice.call(arguments, 2, arguments.length - 2);\n    d = arguments[arguments.length - 2];\n    e = arguments[arguments.length - 1];\n    log(2);\n}\nfunction spreadFunction3(a, b, ___c, _ref) {\n    let c = Array.prototype.slice.call(arguments, 2, arguments.length - 1);\n    _ref = arguments[arguments.length - 1];\n    let d = _ref.d;\n    let e = _ref.e;\n    log(3);\n}",
  "# default value for a should be set before b\nfoo(a = 0, b = a) -> a + b": "'use strict';\nfunction foo(a, b) {\n    if (a == null)\n        a = 0;\n    if (b == null)\n        b = a;\n    return a + b;\n}",
  "export template ->\n    # cannot define classes in templates\n    class Poo": {
    line: 3,
    column: 5
  },
  "export template ->\n    # cannot for loop in templates\n    for let i = 0; i < 10; i++\n        console.log(i)": {
    line: 3,
    column: 5
  },
  "export template ->\n    # cannot export in templates\n    export x": {
    line: 3,
    column: 5
  },
  "export template ->\n    # cannot try/catch in templates\n    try\n        return 0\n    catch e\n        return 1": {
    line: 3,
    column: 5
  },
  "export template ->\n    # cannot throw errors in templates\n    throw new Error": {
    line: 3,
    column: 5
  },
  "# cannot use => syntax in templates\nexport template => 0": {
    line: 2,
    column: 8
  },
  "export template ->\n    const x = 12\n    # cannot assign to const variables, make sure enforced within template\n    x = 10\n    return x": {
    line: 4,
    column: 5
  },
  "export template ->\n    let x = 12\n    # cannot assign to let variables either.\n    x = 12\n    return x": {
    line: 4,
    column: 5
  },
  "export template ->\n    let x = {y:10}\n    # cannot assign to anything really.\n    x.y = 12\n    return x.y": {
    line: 4,
    column: 5
  },
  "export template (a) ->\n    # cannot assign to parameters either\n    a = 10\n    return a": {
    line: 3,
    column: 5
  },
  "export class Foo\n    constructor: ->\n        # there was a problem with existential operators not processing within class definitions\n        if properties?\n            log(properties)": "'use strict';\nconst ion = require('ion');\nconst Foo = ion.defineClass({\n        id: 'Foo',\n        constructor: function Foo() {\n            if (properties != null) {\n                log(properties);\n            }\n        }\n    });\nmodule.exports = exports = Foo;",
  "const ctor = @@\nconst ctorName = @@name": "'use strict';\nconst ctor = this.constructor;\nconst ctorName = this.constructor.name;",
  "inlineThrow() -> throw new Error('inline throw')": "'use strict';\nfunction inlineThrow() {\n    throw new Error('inline throw');\n}",
  "class DynamicExpression\n    watch: ->\n        let x = @x ?= []": "'use strict';\nconst ion = require('ion');\nconst DynamicExpression = ion.defineClass({\n        id: 'DynamicExpression',\n        watch: function () {\n            let x = this.x = this.x != null ? this.x : [];\n        }\n    });\nDynamicExpression;",
  "let a = (new Point)\n    1\n    2": "'use strict';\nlet a = new Point(1, 2);",
  "let x = [y for y in z]": "'use strict';\nlet _ref = [];\nfor (let _i = 0; _i < z.length; _i++) {\n    let y = z[_i];\n    _ref.push(y);\n}\nlet x = _ref;",
  "return\n    z: []\n        let items = [3,2,1]\n        for item in items\n            item * 2": "'use strict';\nlet _ref = [];\n{\n    let items = [\n            3,\n            2,\n            1\n        ];\n    for (let _i = 0; _i < items.length; _i++) {\n        let item = items[_i];\n        _ref.push(item * 2);\n    }\n}\nreturn { z: _ref };",
  "let x = `y == null`": "'use strict';\nlet x = y == null;",
  "# should get accurate error locations even from inline javascript expressions\nlet x = `y := null`": {
    line: 2,
    column: 13
  },
  "let x = 0 in Array\nlet y = \"foo\" instanceof String": "'use strict';\nlet x = 0 in Array;\nlet y = 'foo' instanceof String;",
  "const output = {}\noutput:\n    x: 1\n    y: 2": "'use strict';\nconst ion = require('ion');\nconst output = {};\nion.patch(output, {\n    x: 1,\n    y: 2\n});",
  "output:\n    for a in b\n        [c]: d": "'use strict';\nconst ion = require('ion');\nlet _ref = {};\n{\n    for (let _i = 0; _i < b.length; _i++) {\n        let a = b[_i];\n        _ref[c] = d;\n    }\n}\nion.patch(output, _ref);",
  "output: {}\n    x: 1": {
    line: 1,
    column: 9
  },
  "[output]:\n    x: 1": {
    line: 1,
    column: 2
  },
  "#\n#\n\n#": "'use strict';",
  "[a for a in b]\n[a for a in c]": "'use strict';\nlet _ref = [];\nfor (let _i = 0; _i < b.length; _i++) {\n    let a = b[_i];\n    _ref.push(a);\n}\n_ref;\nlet _ref2 = [];\nfor (let _i2 = 0; _i2 < c.length; _i2++) {\n    let a = c[_i2];\n    _ref2.push(a);\n}\n_ref2;",
  "template ->\n    for {extension} in compilers\n        extension": "'use strict';\nconst ion = require('ion');\n(function _template() {\n    if (this != null && this.constructor === _template) {\n        return ion.createRuntime({\n            type: 'Template',\n            body: [{\n                    type: 'ForOfStatement',\n                    left: {\n                        type: 'VariableDeclaration',\n                        declarations: [{\n                                type: 'VariableDeclarator',\n                                id: {\n                                    type: 'Identifier',\n                                    name: '_ref'\n                                },\n                                init: null\n                            }],\n                        kind: 'let'\n                    },\n                    right: {\n                        type: 'Identifier',\n                        name: 'compilers'\n                    },\n                    body: {\n                        type: 'BlockStatement',\n                        body: [\n                            {\n                                type: 'VariableDeclaration',\n                                declarations: [{\n                                        type: 'VariableDeclarator',\n                                        id: {\n                                            type: 'Identifier',\n                                            name: '_ref3'\n                                        },\n                                        init: {\n                                            type: 'Identifier',\n                                            name: '_ref'\n                                        }\n                                    }]\n                            },\n                            {\n                                type: 'VariableDeclaration',\n                                declarations: [{\n                                        type: 'VariableDeclarator',\n                                        id: {\n                                            type: 'Identifier',\n                                            name: 'extension'\n                                        },\n                                        init: {\n                                            type: 'MemberExpression',\n                                            object: {\n                                                type: 'Identifier',\n                                                name: '_ref3'\n                                            },\n                                            property: {\n                                                type: 'Identifier',\n                                                name: 'extension'\n                                            },\n                                            computed: false\n                                        }\n                                    }],\n                                kind: 'let'\n                            },\n                            {\n                                type: 'ExpressionStatement',\n                                expression: {\n                                    type: 'Identifier',\n                                    name: 'extension'\n                                }\n                            }\n                        ]\n                    }\n                }]\n        }, {\n            require: require,\n            module: module,\n            exports: exports\n        });\n    }\n    for (let _i = 0; _i < compilers.length; _i++) {\n        let _ref2 = compilers[_i];\n        let extension = _ref2.extension;\n        extension;\n    }\n});"
};

if (global.window != null) {
  return;
}

exports.test = function() {
  var e, error, expected, input, key, output, value;
  for (input in tests) {
    expected = tests[input];
    if (expected === null) {
      console.log('---------------------------------------------------');
      console.log(JSON.stringify(index.compile(input, {
        postprocess: false
      }), null, '  '));
      console.log('-Postprocessed-------------------------------------');
      console.log(JSON.stringify(index.compile(input, {
        generate: false
      }), null, '  '));
      console.log('---------------------------------------------------');
      console.log(index.compile(input, {
        loc: false
      }));
    } else if (typeof expected === 'object') {
      error = null;
      try {
        index.compile(input);
      } catch (_error) {
        e = _error;
        error = e;
        for (key in expected) {
          value = expected[key];
          if (value !== e[key]) {
            throw new Error("\n" + (JSON.stringify(e)) + "\n!=\n" + (JSON.stringify(expected)));
          }
        }
      }
      if (error == null) {
        throw new Error("Expected an error: " + (JSON.stringify(expected)));
      }
    } else {
      output = index.compile(input);
      if (output.trim() !== expected.trim()) {
        console.log('-Output---------------------------------------------');
        console.log(output);
        throw new Error("\n" + output + "\n!=\n" + expected);
      }
    }
  }
};

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/ionCompiler',_test_ionCompiler_);
    else
      _test_ionCompiler_.call(this, module, exports, require);
  }
  else {
    _test_ionCompiler_.call(this);
  }
}).call(this)
void (function(){var _test_ionCustomParse_ = function(module,exports,require){

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/ionCustomParse',_test_ionCustomParse_);
    else
      _test_ionCustomParse_.call(this, module, exports, require);
  }
  else {
    _test_ionCustomParse_.call(this);
  }
}).call(this)
void (function(){var _test_ionVsEsprima_ = function(module,exports,require){

  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/ionVsEsprima',_test_ionVsEsprima_);
    else
      _test_ionVsEsprima_.call(this, module, exports, require);
  }
  else {
    _test_ionVsEsprima_.call(this);
  }
}).call(this)
void (function(){var _test_reactiveTemplates_ = function(module,exports,require){'use strict';
const ion = require('../');
const templates = [
        [
            'array comprehension',
            function _template(properties) {
                if (this != null && this.constructor === _template) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ArrayExpression',
                                        elements: []
                                    },
                                    properties: [{
                                            type: 'ForInStatement',
                                            left: {
                                                type: 'VariableDeclaration',
                                                declarations: [{
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'key'
                                                        },
                                                        init: null
                                                    }],
                                                kind: 'let'
                                            },
                                            right: {
                                                type: 'Identifier',
                                                name: 'properties'
                                            },
                                            body: {
                                                type: 'ExpressionStatement',
                                                expression: {
                                                    type: 'Identifier',
                                                    name: 'key'
                                                }
                                            }
                                        }]
                                }
                            }]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        properties: properties,
                        ion: ion,
                        templates: templates,
                        _ref7: _ref7
                    });
                }
                let _ref3 = [];
                for (let key in properties)
                    _ref3.push(key);
                return _ref3;
            },
            {
                a: 1,
                b: 2
            },
            {
                b: void 0,
                c: 3
            },
            [
                'a',
                'c'
            ]
        ],
        [
            'imperative functions',
            function _template2(properties) {
                if (this != null && this.constructor === _template2) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                kind: 'const',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'double'
                                        },
                                        init: {
                                            type: 'Function',
                                            context: false,
                                            value: function double(a) {
                                                return a * 2;
                                            }
                                        }
                                    }]
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ObjectExpression',
                                        properties: []
                                    },
                                    properties: [{
                                            type: 'ForInStatement',
                                            left: {
                                                type: 'VariableDeclaration',
                                                declarations: [
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'key'
                                                        },
                                                        init: null
                                                    },
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'value'
                                                        },
                                                        init: null
                                                    }
                                                ],
                                                kind: 'let'
                                            },
                                            right: {
                                                type: 'Identifier',
                                                name: 'properties'
                                            },
                                            body: {
                                                type: 'BlockStatement',
                                                body: [{
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'key'
                                                        },
                                                        value: {
                                                            type: 'CallExpression',
                                                            callee: {
                                                                type: 'Identifier',
                                                                name: 'double'
                                                            },
                                                            arguments: [{
                                                                    type: 'Identifier',
                                                                    name: 'value'
                                                                }]
                                                        },
                                                        kind: 'init',
                                                        computed: true
                                                    }]
                                            }
                                        }]
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        properties: properties,
                        ion: ion,
                        templates: templates,
                        _ref7: _ref7
                    });
                }
                function double(a) {
                    return a * 2;
                }
                let _ref5 = {};
                {
                    for (let key in properties) {
                        let value = properties[key];
                        _ref5[key] = double(value);
                    }
                }
                return _ref5;
            },
            {
                x: 1,
                y: 2
            },
            {
                x: 4,
                z: 3
            },
            {
                y: 4,
                x: 8,
                z: 6
            }
        ],
        [
            'shared variables functions',
            function _template3(properties) {
                if (this != null && this.constructor === _template3) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'factor'
                                        },
                                        init: {
                                            type: 'ConditionalExpression',
                                            test: {
                                                type: 'BinaryExpression',
                                                operator: '!=',
                                                left: {
                                                    type: 'MemberExpression',
                                                    computed: false,
                                                    object: {
                                                        type: 'Identifier',
                                                        name: 'properties'
                                                    },
                                                    property: {
                                                        type: 'Identifier',
                                                        name: 'factor'
                                                    }
                                                },
                                                right: {
                                                    type: 'Literal',
                                                    value: null
                                                }
                                            },
                                            consequent: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'properties'
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'factor'
                                                }
                                            },
                                            alternate: {
                                                type: 'Literal',
                                                value: 3
                                            }
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                kind: 'const',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'multiply'
                                        },
                                        init: {
                                            type: 'Function',
                                            context: true,
                                            value: function (_context) {
                                                return function multiply(a) {
                                                    const factor = _context.get('factor');
                                                    return a * factor;
                                                };
                                            }
                                        }
                                    }]
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ObjectExpression',
                                        properties: []
                                    },
                                    properties: [{
                                            type: 'ForInStatement',
                                            left: {
                                                type: 'VariableDeclaration',
                                                declarations: [
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'key'
                                                        },
                                                        init: null
                                                    },
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'value'
                                                        },
                                                        init: null
                                                    }
                                                ],
                                                kind: 'let'
                                            },
                                            right: {
                                                type: 'Identifier',
                                                name: 'properties'
                                            },
                                            body: {
                                                type: 'BlockStatement',
                                                body: [{
                                                        type: 'IfStatement',
                                                        test: {
                                                            type: 'BinaryExpression',
                                                            operator: '!==',
                                                            left: {
                                                                type: 'Identifier',
                                                                name: 'key'
                                                            },
                                                            right: {
                                                                type: 'Literal',
                                                                value: 'factor'
                                                            }
                                                        },
                                                        consequent: {
                                                            type: 'BlockStatement',
                                                            body: [{
                                                                    type: 'Property',
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'key'
                                                                    },
                                                                    value: {
                                                                        type: 'CallExpression',
                                                                        callee: {
                                                                            type: 'Identifier',
                                                                            name: 'multiply'
                                                                        },
                                                                        arguments: [{
                                                                                type: 'Identifier',
                                                                                name: 'value'
                                                                            }]
                                                                    },
                                                                    kind: 'init',
                                                                    computed: true
                                                                }]
                                                        }
                                                    }]
                                            }
                                        }]
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        properties: properties,
                        ion: ion,
                        templates: templates,
                        _ref7: _ref7
                    });
                }
                let factor = properties.factor != null ? properties.factor : 3;
                function multiply(a) {
                    return a * factor;
                }
                let _ref6 = {};
                {
                    for (let key in properties) {
                        let value = properties[key];
                        if (key !== 'factor') {
                            _ref6[key] = multiply(value);
                        }
                    }
                }
                return _ref6;
            },
            {
                x: 1,
                y: 2
            },
            {
                x: 4,
                y: void 0,
                z: 5,
                factor: 10
            },
            {
                x: 40,
                z: 50
            }
        ],
        [
            'reactive destructured parameters',
            function _template4(_ref) {
                if (this != null && this.constructor === _template4) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'a'
                                        },
                                        init: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: '_ref'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'a'
                                            },
                                            computed: false
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'b'
                                        },
                                        init: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: '_ref'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'b'
                                            },
                                            computed: false
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'BinaryExpression',
                                    operator: '+',
                                    left: {
                                        type: 'Identifier',
                                        name: 'a'
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: 'b'
                                    }
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        _ref: _ref,
                        ion: ion,
                        templates: templates,
                        _ref7: _ref7
                    });
                }
                let a = _ref.a;
                let b = _ref.b;
                return a + b;
            },
            {
                a: 1,
                b: 2
            },
            { a: 5 },
            7
        ],
        [
            'array comprehensions',
            function _template5(_ref2) {
                if (this != null && this.constructor === _template5) {
                    return ion.createRuntime({
                        type: 'Template',
                        body: [
                            {
                                type: 'VariableDeclaration',
                                declarations: [{
                                        type: 'VariableDeclarator',
                                        id: {
                                            type: 'Identifier',
                                            name: 'items'
                                        },
                                        init: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: '_ref2'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'items'
                                            },
                                            computed: false
                                        }
                                    }],
                                kind: 'let'
                            },
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'ArrayExpression',
                                        elements: []
                                    },
                                    properties: [{
                                            type: 'ForOfStatement',
                                            left: {
                                                type: 'VariableDeclaration',
                                                declarations: [
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'x'
                                                        },
                                                        init: null
                                                    },
                                                    {
                                                        type: 'VariableDeclarator',
                                                        id: {
                                                            type: 'Identifier',
                                                            name: 'i'
                                                        },
                                                        init: null
                                                    }
                                                ],
                                                kind: 'let'
                                            },
                                            right: {
                                                type: 'Identifier',
                                                name: 'items'
                                            },
                                            body: {
                                                type: 'ExpressionStatement',
                                                expression: {
                                                    type: 'BinaryExpression',
                                                    operator: '+',
                                                    left: {
                                                        type: 'Identifier',
                                                        name: 'x'
                                                    },
                                                    right: {
                                                        type: 'Identifier',
                                                        name: 'i'
                                                    }
                                                }
                                            }
                                        }]
                                }
                            }
                        ]
                    }, {
                        require: require,
                        module: module,
                        exports: exports,
                        _ref2: _ref2,
                        ion: ion,
                        templates: templates,
                        _ref7: _ref7
                    });
                }
                let items = _ref2.items;
                let _ref4 = [];
                for (let _i = 0; _i < items.length; _i++) {
                    let i = _i;
                    let x = items[_i];
                    _ref4.push(x + i);
                }
                return _ref4;
            },
            {
                items: [
                    1,
                    2,
                    3
                ]
            },
            { items: { 3: 4 } },
            [
                1,
                3,
                5,
                7
            ]
        ]
    ];
let _ref7 = {};
{
    for (let _i2 = 0; _i2 < templates.length; _i2++) {
        let _ref8 = templates[_i2];
        let name = _ref8[0];
        let templateType = _ref8[1];
        let argument = _ref8[2];
        let patch = _ref8[3];
        let expected = _ref8[4];
        if (expected != null) {
            _ref7[name] = function (templateType, argument, patch, expected) {
                return function (done) {
                    let template = new templateType(argument);
                    function checkIfDone(check) {
                        if (JSON.stringify(check) === JSON.stringify(expected)) {
                            template.deactivate();
                            done();
                        }
                    }
                    template.activate();
                    template.watch(function (value) {
                        checkIfDone(value);
                        ion.observe(value, function (changes) {
                            checkIfDone(value);
                        });
                    });
                    ion.patch(argument, patch);
                };
            }(templateType, argument, patch, expected);
        }
    }
}
module.exports = exports = { test: _ref7 };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/reactiveTemplates',_test_reactiveTemplates_);
    else
      _test_reactiveTemplates_.call(this, module, exports, require);
  }
  else {
    _test_reactiveTemplates_.call(this);
  }
}).call(this)
void (function(){var _test_templateParams_ = function(module,exports,require){'use strict';
const ion = require('ion');
const firstTemplate = function _template(a, b) {
    if (this != null && this.constructor === _template) {
        return ion.createRuntime({
            type: 'Template',
            body: [{
                    type: 'ReturnStatement',
                    argument: {
                        type: 'BinaryExpression',
                        operator: '+',
                        left: {
                            type: 'Identifier',
                            name: 'a'
                        },
                        right: {
                            type: 'Identifier',
                            name: 'b'
                        }
                    }
                }],
            name: {
                type: 'Identifier',
                name: 'firstTemplate'
            }
        }, {
            require: require,
            module: module,
            exports: exports,
            a: a,
            b: b,
            firstTemplate: firstTemplate,
            test: test
        });
    }
    return a + b;
};
const test = exports.test = function () {
        let template = new firstTemplate(1, 2);
        template.activate();
        let result = null;
        template.watch(function (value) {
            return result = value;
        });
        if (!(result === 3))
            throw new Error('Assertion Failed: (result is 3)');
        template.deactivate();
        if (!(result === void 0))
            throw new Error('Assertion Failed: (result is undefined)');
    };
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/templateParams',_test_templateParams_);
    else
      _test_templateParams_.call(this, module, exports, require);
  }
  else {
    _test_templateParams_.call(this);
  }
}).call(this)
void (function(){var _test_Todo_ = function(module,exports,require){'use strict';
const ion = require('ion');
const _ref = require('ion/browser/html');
let div = _ref.div;
let span = _ref.span;
let input = _ref.input;
let a = _ref.a;
let form = _ref.form;
let table = _ref.table;
let tbody = _ref.tbody;
let thead = _ref.thead;
let tr = _ref.tr;
let td = _ref.td;
let button = _ref.button;
let br = _ref.br;
global.data = {
    name: 'Kris',
    offset: 0,
    kids: {
        Sadera: 18,
        Orion: 15,
        Galileo: 4
    }
};
module.exports = exports = function _template() {
    if (this != null && this.constructor === _template) {
        return ion.createRuntime({
            type: 'Template',
            body: [{
                    type: 'ReturnStatement',
                    argument: {
                        type: 'ObjectExpression',
                        objectType: {
                            type: 'Identifier',
                            name: 'div'
                        },
                        properties: [
                            {
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'Identifier',
                                        name: 'div'
                                    },
                                    properties: [{
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'BinaryExpression',
                                                operator: '+',
                                                left: {
                                                    type: 'Literal',
                                                    value: 'Hello '
                                                },
                                                right: {
                                                    type: 'MemberExpression',
                                                    computed: false,
                                                    object: {
                                                        type: 'Identifier',
                                                        name: 'data'
                                                    },
                                                    property: {
                                                        type: 'Identifier',
                                                        name: 'name'
                                                    }
                                                }
                                            }
                                        }]
                                }
                            },
                            {
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'ObjectExpression',
                                    objectType: {
                                        type: 'Identifier',
                                        name: 'div'
                                    },
                                    properties: [
                                        {
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'style'
                                            },
                                            value: {
                                                type: 'ObjectExpression',
                                                objectType: null,
                                                properties: [{
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'color'
                                                        },
                                                        value: {
                                                            type: 'Literal',
                                                            value: 'red'
                                                        },
                                                        kind: 'init'
                                                    }]
                                            },
                                            kind: 'init'
                                        },
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Literal',
                                                value: 'red'
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                type: 'ForInStatement',
                                left: {
                                    type: 'VariableDeclaration',
                                    declarations: [
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'name'
                                            },
                                            init: null
                                        },
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'age'
                                            },
                                            init: null
                                        }
                                    ],
                                    kind: 'let'
                                },
                                right: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: {
                                        type: 'Identifier',
                                        name: 'data'
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'kids'
                                    }
                                },
                                body: {
                                    type: 'BlockStatement',
                                    body: [{
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'ObjectExpression',
                                                objectType: {
                                                    type: 'Identifier',
                                                    name: 'div'
                                                },
                                                properties: [
                                                    {
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'style'
                                                        },
                                                        value: {
                                                            type: 'ObjectExpression',
                                                            objectType: null,
                                                            properties: [
                                                                {
                                                                    type: 'Property',
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'textDecoration'
                                                                    },
                                                                    value: {
                                                                        type: 'Literal',
                                                                        value: 'underline'
                                                                    },
                                                                    kind: 'init'
                                                                },
                                                                {
                                                                    type: 'Property',
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'cursor'
                                                                    },
                                                                    value: {
                                                                        type: 'Literal',
                                                                        value: 'pointer'
                                                                    },
                                                                    kind: 'init'
                                                                }
                                                            ]
                                                        },
                                                        kind: 'init'
                                                    },
                                                    {
                                                        type: 'Property',
                                                        key: {
                                                            type: 'Identifier',
                                                            name: 'onclick'
                                                        },
                                                        value: {
                                                            type: 'Function',
                                                            context: true,
                                                            value: function (_context) {
                                                                return function () {
                                                                    const name = _context.get('name');
                                                                    alert('hello ' + name);
                                                                };
                                                            }
                                                        },
                                                        kind: 'init'
                                                    },
                                                    {
                                                        type: 'ExpressionStatement',
                                                        expression: {
                                                            type: 'BinaryExpression',
                                                            operator: '+',
                                                            left: {
                                                                type: 'BinaryExpression',
                                                                operator: '+',
                                                                left: {
                                                                    type: 'Identifier',
                                                                    name: 'name'
                                                                },
                                                                right: {
                                                                    type: 'Literal',
                                                                    value: ' '
                                                                }
                                                            },
                                                            right: {
                                                                type: 'BinaryExpression',
                                                                operator: '+',
                                                                left: {
                                                                    type: 'Identifier',
                                                                    name: 'age'
                                                                },
                                                                right: {
                                                                    type: 'MemberExpression',
                                                                    computed: false,
                                                                    object: {
                                                                        type: 'Identifier',
                                                                        name: 'data'
                                                                    },
                                                                    property: {
                                                                        type: 'Identifier',
                                                                        name: 'offset'
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }]
                                }
                            }
                        ]
                    }
                }]
        }, {
            require: require,
            module: module,
            exports: exports,
            _ref: _ref,
            div: div,
            span: span,
            input: input,
            a: a,
            form: form,
            table: table,
            tbody: tbody,
            thead: thead,
            tr: tr,
            td: td,
            button: button,
            br: br
        });
    }
    let _ref3 = new div();
    {
        let _ref4 = new div();
        {
            ion.add(_ref4, 'Hello ' + data.name);
        }
        ion.add(_ref3, _ref4);
        let _ref5 = new div();
        {
            _ref5.style = ion.patch(_ref5.style, { color: 'red' });
            ion.add(_ref5, 'red');
        }
        ion.add(_ref3, _ref5);
        {
            let _ref2 = data.kids;
            for (let name in _ref2) {
                let age = _ref2[name];
                let _ref6 = new div();
                {
                    _ref6.style = ion.patch(_ref6.style, {
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    });
                    _ref6.onclick = function () {
                        alert('hello ' + name);
                    };
                    ion.add(_ref6, name + ' ' + (age + data.offset));
                }
                ion.add(_ref3, _ref6);
            }
        }
    }
    return _ref3;
};
  }
  if (typeof require === 'function') {
    if (require.register)
      require.register('test/Todo',_test_Todo_);
    else
      _test_Todo_.call(this, module, exports, require);
  }
  else {
    _test_Todo_.call(this);
  }
}).call(this)
//# sourceMappingURL= _browser.js.map