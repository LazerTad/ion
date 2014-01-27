preprocessor = require './preprocessor'
parser = require './parser'
postprocessor = require './postprocessor'

stripLineColumnNumbers = (ast) ->
    if ast? and typeof ast is 'object'
        delete ast.line
        delete ast.column
        if Array.isArray ast
            stripLineColumnNumbers arg for arg in ast
        else if Array.isArray ast.args
            stripLineColumnNumbers arg for arg in ast.args
    return

module.exports = exports =
    parseStatement: parseStatement = (source, id) ->
        try
            lineMapping = {}
            preprocessed = preprocessor.preprocess source, lineMapping
            # console.log preprocessed
            ast = parser.parse preprocessed
            postprocessed = postprocessor.postprocess ast
            postprocessed.id = id if id?
            stripLineColumnNumbers postprocessed
            return postprocessed
        catch e
            if typeof e.line is 'number' and typeof e.column is 'number' and e.line > 0 and e.column > 0
                # fix line and column with lineMapping
                e.line = lineMapping[e.line - 1] + 1
                e.column += lineMapping.columnOffset ? 0
                # set location on error in a manner consistent with coffeescript compile errors
                e.location =
                    first_line: e.line - 1
                    last_line: e.line - 1
                    first_column: e.column - 1
                    last_column: e.column - 1
                line = source.split('\n')[e.line - 1]
                caret = "^"
                for i in [2..e.column] by 1
                    caret = " " + caret
                newMessage = "#{if id? then id + ':' else ''}#{e.line}:#{e.column}\n#{e.message}\n#{line}\n#{caret}"
                e.originalMessage = e.message
                e.message = newMessage
            throw e

    parseExpression: parseExpression = (source, id) ->
        ast = parseStatement source, id
        # the only statement should be a single add statement
        throw new Error "Expected a single expression:\n#{source}" unless ast.op is 'add'
        return ast.args[0]

    compileTemplate: compileTemplate = (ast, templateModuleId) ->
        throw new Error "templateModuleId is required" unless templateModuleId?
        return """
        var Template = require(#{JSON.stringify templateModuleId});
        var ast = #{JSON.stringify ast, null, '    '};
        module.exports = function(input, output, variables) {
            if (variables == null) variables = {};
            if (variables.module == null) variables.module = module;
            if (variables.require == null) variables.require = require;
            return new Template(ast, input, output, variables);
        }
        """
