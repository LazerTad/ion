// Generated by CoffeeScript 1.3.3
(function() {
  var Node, Token, getArray, ion, isText, nest, parseTokens, tokentypes, unquoted;

  Token = (function() {

    function Token(symbol, type, text, value) {
      this.symbol = symbol;
      this.type = type;
      this.text = text != null ? text : this.type;
      this.value = value;
    }

    Token.prototype.toJSON = function() {
      if (this.symbol) {
        return this.type;
      } else {
        return this.value;
      }
    };

    Token.prototype.toString = function() {
      return this.text;
    };

    return Token;

  })();

  unquoted = function(text) {
    if (text.match(/^\s*null\s*$/)) {
      return null;
    }
    if (text.match(/^\s*(true|false)\s*$/)) {
      return Boolean(text.trim());
    }
    if (text.match(/^\s*[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?\s*$/)) {
      return Number(text.trim());
    }
    if (text.match(/^\s*\d\d\d\d-\d\d-\d\d(T\d\d:\d\d(:\d\d(\.\d{1,3})?)?(Z|([+-]\d\d:\d\d))?)?\s*$/)) {
      return new Date(text.trim());
    }
    if (text.match(/^\s*{}\s*$/)) {
      return {};
    }
    return text.trim();
  };

  tokentypes = [
    [
      /^\s*#.*/, function(x) {
        return null;
      }
    ], [
      /^\s*\[/, function(x) {
        return new Token(true, '[', x);
      }
    ], [
      /^\s*\]/, function(x) {
        return new Token(true, ']', x);
      }
    ], [
      /^\s*:/, function(x) {
        return new Token(true, ':', x);
      }
    ], [
      /^\s*,/, function(x) {
        return new Token(true, ',', x);
      }
    ], [
      /^\s*"([^"\\]|(\\([\/'"\\bfnrt]|(u[a-fA-F0-9]{4}))))*"/, function(x) {
        return new Token(false, 'quoted', x, JSON.parse(x));
      }
    ], [
      /^[^,:\[\]#]+/, function(x) {
        return new Token(false, 'unquoted', x, unquoted(x));
      }
    ]
  ];

  parseTokens = function(line) {
    var match, matched, text, token, tokens, tokentype, _i, _len;
    if (line.trim().length === 0) {
      return null;
    }
    tokens = [];
    while (line.trim().length > 0) {
      matched = false;
      for (_i = 0, _len = tokentypes.length; _i < _len; _i++) {
        tokentype = tokentypes[_i];
        match = line.match(tokentype[0]);
        if (match != null) {
          matched = true;
          token = tokentype[1](text = match[0]);
          if (token != null) {
            tokens.push(token);
          }
          line = line.substring(text.length);
          break;
        }
      }
      if (!matched) {
        throw new Error(line);
      }
    }
    return tokens;
  };

  Node = (function() {

    function Node(lineNumber, line, indent) {
      var key, _ref, _ref1, _ref2;
      this.lineNumber = lineNumber;
      this.line = line;
      this.indent = indent;
      if (line != null) {
        this.tokens = parseTokens(line);
        this.isText = isText(this.tokens);
        if (((_ref = this.tokens) != null ? _ref.length : void 0) >= 2 && !(key = this.tokens[0]).symbol && this.tokens[1].type === ':') {
          this.key = key.value;
        }
        this.hasColon = (this.key != null) || ((_ref1 = this.tokens) != null ? (_ref2 = _ref1[0]) != null ? _ref2.type : void 0 : void 0) === ':';
      }
    }

    Node.prototype.error = function(message, lineNumber) {
      var error;
      error = new Error("" + message + ", line:" + this.lineNumber);
      error.lineNumber = this.lineNumber;
      error.line = this.line;
      return error;
    };

    Node.prototype.getAllDescendantLines = function(lines, indent) {
      var child, _i, _len, _ref;
      if (lines == null) {
        lines = [];
      }
      if (indent == null) {
        indent = this.indent + 1;
      }
      if (this.children != null) {
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          lines.push(child.line.substring(indent));
          child.getAllDescendantLines(lines, indent);
        }
      }
      return lines;
    };

    Node.prototype.getComplexType = function() {
      var child, duplicateKeys, explicitType, keyCount, keys, nonEmptyChildCount, _i, _len, _ref, _ref1, _ref2;
      explicitType = ((_ref = this.tokens) != null ? _ref.length : void 0) >= 3 ? (_ref1 = this.tokens) != null ? _ref1.slice(2).join('').trim() : void 0 : void 0;
      if (explicitType != null) {
        return explicitType;
      }
      nonEmptyChildCount = 0;
      keyCount = 0;
      keys = {};
      duplicateKeys = false;
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        child = _ref2[_i];
        if ((child.isText && !child.key) || ((child.children != null) && !child.hasColon)) {
          return '""';
        }
        if (child.tokens) {
          nonEmptyChildCount++;
          if (child.key) {
            keyCount++;
            if (keys[child.key]) {
              duplicateKeys = true;
            }
            keys[child.key] = true;
          }
        }
      }
      if (duplicateKeys || nonEmptyChildCount > 0 && keyCount === 0) {
        return '[]';
      }
      if (keyCount === nonEmptyChildCount) {
        return '{}';
      }
      throw this.error('Inconsistent child keyCount');
    };

    Node.prototype.getSimpleValue = function() {
      var tokens, value;
      tokens = this.tokens;
      if (tokens.length === 0) {
        return void 0;
      }
      if (this.key) {
        tokens = tokens.slice(2);
      } else if (this.hasColon) {
        tokens = tokens.slice(1);
      }
      if (tokens.length === 0) {
        return null;
      }
      if (tokens.length >= 2 && tokens[0].type === '[' && tokens[tokens.length - 1].type === ']' && (value = getArray(tokens.slice(1, -1)))) {
        return value;
      }
      if (!this.isText) {
        if (tokens.length === 1) {
          return tokens[0].value;
        }
        if (value = getArray(tokens)) {
          return value;
        }
      }
      return tokens.join('').trim();
    };

    Node.prototype.doChildrenHaveKeys = function() {
      var child, _i, _len, _ref;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.key != null) {
          return true;
        }
      }
      return false;
    };

    Node.prototype.getComplexValue = function() {
      var child, current, key, type, value, _i, _j, _len, _len1, _ref, _ref1;
      type = this.getComplexType();
      if (type === '""') {
        value = this.getAllDescendantLines().join('\n');
      } else if (type === '[]') {
        if (this.doChildrenHaveKeys()) {
          value = [];
          current = null;
          _ref = this.children;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            if (!child.tokens) {
              continue;
            }
            key = child.key;
            if (current === null || current.hasOwnProperty(key)) {
              value.push(current = {});
            }
            current[key] = child.getValue();
          }
        } else {
          value = (function() {
            var _j, _len1, _ref1, _results;
            _ref1 = this.children;
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              child = _ref1[_j];
              if (child.tokens) {
                _results.push(child.getValue());
              }
            }
            return _results;
          }).call(this);
        }
      } else {
        value = {};
        _ref1 = this.children;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          child = _ref1[_j];
          if (child.tokens) {
            value[child.key] = child.getValue();
          }
        }
      }
      return value;
    };

    Node.prototype.getValue = function() {
      var value;
      if (this.children != null) {
        if (this.isText) {
          throw this.children[0].error('Children not expected');
        }
        value = this.getComplexValue();
      } else {
        value = this.getSimpleValue();
      }
      return value;
    };

    return Node;

  })();

  isText = function(tokens) {
    var punctuation, token, value, _i, _len;
    if (tokens) {
      punctuation = /[^\s\w]/;
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        if (token.type === 'unquoted') {
          value = token.value;
          if (typeof value === 'string' && punctuation.test(value)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  getArray = function(tokens) {
    var index, item, token, _i, _len;
    for (index = _i = 0, _len = tokens.length; _i < _len; index = ++_i) {
      token = tokens[index];
      if (index % 2 === 0) {
        if (token.symbol) {
          return null;
        }
      } else {
        if (token.type !== ',') {
          return null;
        }
      }
    }
    return (function() {
      var _j, _len1, _results, _step;
      _results = [];
      for (_j = 0, _len1 = tokens.length, _step = 2; _j < _len1; _j += _step) {
        item = tokens[_j];
        _results.push(item.value);
      }
      return _results;
    })();
  };

  nest = function(nodes) {
    var node, parent, root, stack, _i, _len, _ref;
    root = new Node(null, null, -1);
    stack = [root];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      while (node.indent <= (parent = stack[stack.length - 1]).indent) {
        stack.pop();
      }
      ((_ref = parent.children) != null ? _ref : parent.children = []).push(node);
      stack.push(node);
    }
    return root;
  };

  ion = {
    parse: function(text, options) {
      var indent, index, line, nodes, root, value, _i, _len, _ref, _ref1, _ref2, _ref3;
      text = text.trim();
      nodes = [];
      _ref = text.split('\r\n');
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        line = _ref[index];
        if (!(line.trim()[0] !== '#')) {
          continue;
        }
        indent = (_ref1 = (line.trim().length === 0 ? indent : indent = (_ref2 = line.match(/^\s*/)) != null ? (_ref3 = _ref2[0]) != null ? _ref3.length : void 0 : void 0)) != null ? _ref1 : 0;
        nodes.push(new Node(index + 1, line, indent));
      }
      root = nest(nodes);
      value = root.getValue();
      return value;
    }
  };

  if (typeof module === 'undefined') {
    (function() {
      return this.ion = ion;
    })();
  } else {
    module.exports = ion;
  }

}).call(this);
