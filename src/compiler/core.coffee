require '../runtime/sugar'

lineDelimiter = "\n"
isEmpty = (s) -> not s? or s.length is 0 or (s.trim? and s.trim().length is 0)

module.exports =
    indentToken: "{{{{"
    outdentToken: "}}}}"
    splitLines: splitLines = (s) -> s.split lineDelimiter
    joinLines: joinLines = (array) -> array.join lineDelimiter
    getIndent: getIndent = (s) -> /^[ ]*/.exec(s)[0].length
    unindent: unindent = unindent = (s) ->
        lines = splitLines s.trimRight()
        minIndent = Number.MAX_VALUE
        for line in lines
            if (!isEmpty(line))
                minIndent = Math.min(minIndent, getIndent(line))
        for line, i in lines
            trim = if isEmpty(line) then getIndent(line) else minIndent
            lines[i] = line.substring(trim)
        return joinLines(lines).trim()