core = require './core'

getSpace = (size) ->
    result = []
    result.push " " for i in [0...size]
    result.join ""

exports.isMarkdownCommented = (source) -> /(\n|^)[^\s\n][^\n]*\n(\s*\n)+\s+[^\s\n]/.test source

exports.preprocess = preprocess = (source, sourceMapping) ->
    isMarkdownCommented = exports.isMarkdownCommented source
    baseIndent = if isMarkdownCommented then 1 else 0
    totalIndent = 0
    indentStack = []
    lines = core.splitLines source
    writeLine = (line, inputIndex) ->
        if inputIndex?
            sourceMapping?[output.length] = inputIndex
        output.push line
    outdent = (inputIndex) ->
        indentStack.pop()
        totalIndent = indentStack[indentStack.length - 1] ? 0
        if totalIndent >= baseIndent
            writeLine getSpace(totalIndent) + core.outdentToken, inputIndex
    output = []
    for line, index in lines
        indent = core.getIndent line
        isEmpty = line.trim().length is 0
        if not isEmpty
            if indent > totalIndent
                if totalIndent >= baseIndent
                    writeLine getSpace(totalIndent) + core.indentToken, index
                totalIndent = indent
                indentStack.push indent
            else
                while indent < totalIndent
                    outdent index

        comment = isMarkdownCommented and indent is 0 and not isEmpty
        if not comment
            writeLine line, index
    # push any remaining outdents
    while indentStack.length > 0
        outdent()

    return core.unindent core.joinLines(output), sourceMapping

sample = """

This is a comment.
Anything left justified is a comment.

    Person
        name: "Alpha"
        age: 40
        children:
            Person
                name: "Beta"
                age: 1
            Person

                name: "Charlie"

                age: 2
                description: ""
                        This is just a
                    sample indented multiline
                    string literal.
"""
sample2 = """


Person
    name: "Alpha"
    age: 40
    children:
        Person
            name: "Beta"
            age: 1
        Person

            name: "Charlie"

            age: 2
            description: ""
                    This is just a
                sample indented multiline
                string literal.
"""
expectedResult = """


Person
{{{{
    name: "Alpha"
    age: 40
    children:
    {{{{
        Person
        {{{{
            name: "Beta"
            age: 1
        }}}}
        Person

        {{{{
            name: "Charlie"

            age: 2
            description: ""
            {{{{
                    This is just a
            }}}}
                sample indented multiline
            {{{{
                string literal.
            }}}}
        }}}}
    }}}}
}}}}
"""
exports.test = ->
    sourceMapping = {}
    # first try with the markdown commented sample.
    result = preprocess sample, sourceMapping
    if result != expectedResult
        console.log 'result---------------------------------'
        console.log result
        console.log 'expected-------------------------------'
        console.log expectedResult
        throw new Error "Preprocessor result not expected result."
    if JSON.stringify(sourceMapping) != '{"0":0,"1":3,"2":4,"3":5,"4":5,"5":6,"6":7,"7":8,"8":8,"9":9,"10":9,"11":10,"12":11,"13":11,"14":12,"15":13,"16":13,"17":14,"18":15,"19":16,"20":17,"21":17,"22":18,"23":18,"24":19,"25":19,"columnOffset":4}'
        throw new Error "Unexpected line mapping: " + JSON.stringify sourceMapping
    # now try with the uncommented sample.
    sourceMapping = {}
    result = preprocess sample2, sourceMapping
    if result != expectedResult
        console.log 'result---------------------------------'
        console.log result
        console.log 'expected-------------------------------'
        console.log expectedResult
        throw new Error "Preprocessor result not expected result."
