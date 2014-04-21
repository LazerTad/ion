void (function(){var _ion_builder_Directory_ = function(module,exports,require){'use strict';
if (global.Window) {
    return;
}
const ion = require('../'), fs = require('fs'), np = require('path'), utility = require('./utility'), watcher = require('./watcher'), File = require('./File');
const Directory = ion.defineClass({
        name: 'Directory',
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
      require.register('ion/builder/Directory',_ion_builder_Directory_);
    else
      _ion_builder_Directory_.call(this, module, exports, require);
  }
  else {
    _ion_builder_Directory_.call(this);
  }
}).call(this)