{traverse} = require './traverseAst'
basicTraverse = require('./traverse').traverse
{addStatement,forEachDestructuringAssignment} = require './astFunctions'
nodes = require './nodes'

undefinedExpression = Object.freeze
    type: 'UnaryExpression'
    argument:
        type: 'Literal'
        value: 0
    operator: 'void'
    prefix: true
nullExpression = Object.freeze
    type: 'Literal'
    value: null

extractForLoopRightVariable = (node, context) ->
    if node.type is 'ForOfStatement' or node.type is 'ForInStatement' and node.left.declarations.length > 1
        if node.left.declarations.length > 2
            throw new Error "too many declarations"
        right = node.right
        if right.type isnt "Identifier"
            ref = context.getNewInternalIdentifier()
            node.right = ref
            context.replace
                type: "BlockStatement"
                body: [
                    {type:"VariableDeclaration",declarations:[{type:"VariableDeclarator",id:ref,init:right}],kind:node.left.kind}
                    node
                ]

createForInLoopValueVariable = (node, context) ->
    if node.type is 'ForInStatement' and node.left.declarations.length > 1
        valueDeclarator = node.left.declarations[1]
        context.addVariable
            id: valueDeclarator.id
            init:
                type: 'MemberExpression'
                computed: true
                object: node.right
                property: node.left.declarations[0].id

convertForInToForLength = (node, context) ->
    if node.type is 'ForOfStatement'
        userIndex = node.left.declarations[1]?.id
        loopIndex = context.getNewInternalIdentifier "_i"

        addStatement node,
            type:"VariableDeclaration"
            declarations:[
                {
                    type:"VariableDeclarator"
                    id: node.left.declarations[0].id
                    init:
                        type: "MemberExpression"
                        object: node.right
                        property: loopIndex
                        computed: true
                }
            ]
            kind: node.left.kind

        if userIndex?
            addStatement node,
                type:"VariableDeclaration"
                declarations:[
                    {
                        type:"VariableDeclarator"
                        id: userIndex
                        init: loopIndex
                    }
                ]
                kind: node.left.kind

        context.replace
            type: 'ForStatement'
            init:
                type:"VariableDeclaration"
                declarations:[
                    { type:"VariableDeclarator",id:loopIndex,init:{ type:"Literal", value:0 } }
                ]
                kind: 'let'
            test:
                type: "BinaryExpression"
                operator: "<"
                left: loopIndex
                right:
                    type: "MemberExpression"
                    object: node.right
                    property: { type: "Identifier", name: "length" }
                    computed: false
            update:
                type: "UpdateExpression"
                operator: "++"
                argument: loopIndex
                prefix: false
            body: node.body

callFunctionBindForFatArrows = (node, context) ->
    if node.type is "FunctionExpression" and node.bound
        delete node.bound
        context.replace
            type: "CallExpression"
            callee:
                type: "MemberExpression"
                object: node
                property:
                    type: "Identifier"
                    name: "bind"
            arguments: [ { type:"ThisExpression" } ]

nodejsModules = (node, context) ->
    # convert ImportExpression{name} into require(name)
    if node.type is 'ImportExpression'
        node.type = 'CallExpression'
        node.callee =
            type: 'Identifier'
            name: 'require'
        node.arguments = [node.name]
        delete node.name
    else if node.type is 'ExportStatement'
        if node.value.type is 'VariableDeclaration'
            # variable export
            context.exports = true
            # replace this node with the VariableDeclaration
            context.replace node.value
            # then make each init also assign to it's export variable.
            for declarator in node.value.declarations by -1
                if not declarator.init?
                    throw new Error "Export variables must have an init value"
                declarator.init =
                    type: 'AssignmentExpression'
                    operator: '='
                    left:
                        type: 'MemberExpression'
                        object:
                            type: 'Identifier'
                            name: 'exports'
                        property: declarator.id
                    right: declarator.init
        else
            # default export
            if context.exports
                throw new Error "default export must be first"
            context.replace
                type: 'ExpressionStatement'
                expression:
                    type: 'AssignmentExpression'
                    operator: '='
                    left:
                        type: 'MemberExpression'
                        object:
                            type: 'Identifier'
                            name: 'module'
                        property:
                            type: 'Identifier'
                            name: 'exports'
                    right:
                        type: 'AssignmentExpression'
                        operator: '='
                        left:
                            type: 'Identifier'
                            name: 'exports'
                        right: node.value

separateAllVariableDeclarations = (node, context) ->
    if node.type is 'VariableDeclaration' and context.isParentBlock()
        while node.declarations.length > 1
            declaration = node.declarations.pop()
            context.addStatement
                type: node.type
                declarations: [declaration]
                kind: node.kind

destructuringAssignments = (node, context) ->
    isPattern = (node) -> node.properties? or node.elements?
    # variable assignments
    if node.type is 'VariableDeclaration' and (context.isParentBlock() or node.type is 'ForOfStatement')
        for declarator in node.declarations when isPattern declarator.id
            pattern = declarator.id
            tempId = context.getNewInternalIdentifier()
            declarator.id = tempId
            count = 0
            forEachDestructuringAssignment pattern, tempId, (id, expression) ->
                context.addStatement {
                        type: 'VariableDeclaration'
                        declarations: [{
                            type: 'VariableDeclarator'
                            id: id
                            init: expression
                        }]
                        kind: 'let'
                    }, ++count

    # other assignments
    if node.type is 'ExpressionStatement' and node.expression.operator is '='
        expression = node.expression
        pattern = expression.left
        if isPattern pattern
            tempId = context.getNewInternalIdentifier()
            context.replace
                type: 'VariableDeclaration'
                declarations: [{
                    type: 'VariableDeclarator'
                    id: tempId
                    init: expression.right
                }]
                kind: 'const'

            count = 0
            forEachDestructuringAssignment pattern, tempId, (id, expression) ->
                context.addStatement {
                        type: 'ExpressionStatement'
                        expression:
                            type: 'AssignmentExpression'
                            operator: '='
                            left: id
                            right: expression
                    }, ++count

defaultOperatorsToConditionals = (node, context) ->
    if node.type is 'BinaryExpression' and (node.operator is '??' or node.operator is '?')
        context.replace
            type: 'ConditionalExpression'
            test:
                type: 'BinaryExpression'
                operator: '!='
                left: node.left
                right: if node.operator is '??' then undefinedExpression else nullExpression
            consequent: node.left
            alternate: node.right

defaultAssignmentsToDefaultOperators = (node, context) ->
    if node.type is 'AssignmentExpression' and (node.operator is '?=' or node.operator is '??=')
        # a ?= b --> a = a ? b
        node.right =
            type: 'BinaryExpression'
            operator: if node.operator is '?=' then '?' else '??'
            left: node.left
            right: node.right
        node.operator = '='

existentialExpression = (node, context) ->

    if node.type is 'UnaryExpression' and node.operator is '?'
        context.replace
            type: 'BinaryExpression'
            operator: '!='
            left: node.argument
            right: nullExpression

    # this could be more efficient by caching the left values
    # especially when the left side involves existential CallExpressions
    # should only apply within an imperative context
    if node.type is 'MemberExpression' or node.type is 'CallExpression'
        # search descendant objects for deepest existential child
        getExistentialDescendantObject = (check) ->
            result = null
            if check.type is 'MemberExpression' or check.type is 'CallExpression'
                result = getExistentialDescendantObject check.object ? check.callee
                if check.existential
                    result ?= check
            return result
        # create temp ref variable
        # a?.b --> a != null ? a.b : undefined
        existentialChild  = getExistentialDescendantObject node
        if existentialChild?
            existentialChildObject = existentialChild.object ? existentialChild.callee
            delete existentialChild.existential
            context.replace
                type: 'ConditionalExpression'
                test:
                    type: 'BinaryExpression'
                    operator: '!='
                    left: existentialChildObject
                    right: nullExpression
                consequent: node
                alternate: undefinedExpression

addUseStrict = (node, context) ->
    if node.type is 'Program'
        node.body.unshift
            type: 'ExpressionStatement'
            expression:
                type: 'Literal'
                value: 'use strict'

extractForLoopsInnerAndTest = (node, context) ->
    if node.type is 'ForInStatement' or node.type is 'ForOfStatement'
        if node.inner?
            node.inner.body = node.body
            node.body = node.inner
            delete node.inner
        if node.test?
            node.body =
                type: 'IfStatement'
                test: node.test
                consequent: node.body
            delete node.test

arrayComprehensionsToES5 = (node, context) ->
    if node.type is 'ArrayExpression' and node.value? and node.comprehension?
        # add a statement
        tempId = context.addVariable
            offset: 0
            init:
                type: 'ArrayExpression'
                elements: []
        forStatement = node.comprehension
        forStatement.body =
            type: 'ExpressionStatement'
            expression:
                type: 'CallExpression'
                callee:
                    type: 'MemberExpression'
                    object: tempId
                    property:
                        type: 'Identifier'
                        name: 'push'
                arguments: [node.value]
        context.addStatement 0, forStatement
        context.replace tempId

functionParameterDefaultValuesToES5 = (node, context) ->
    if node.type is 'FunctionExpression' and node.params? and node.defaults?
        for param, index in node.params
            defaultValue = node.defaults?[index]
            if defaultValue?
                context.addStatement
                    type: 'ExpressionStatement'
                    expression:
                        type: 'AssignmentExpression'
                        operator: '?='
                        left: param
                        right: defaultValue
                node.defaults[index] = undefined

# only for imperative code
typedObjectExpressions = (node, context) ->
    if node.type is 'ObjectExpression' and node.objectType?

        # first see if the object expression is complex or not
        if node.type is "ObjectExpression" and node.objectType?.type is "ArrayExpression"
            elements = []
            for element in node.objectType.elements
                elements.push element
            for expressionStatement in node.properties
                elements.push expressionStatement.expression
            context.replace
                type: "ArrayExpression"
                elements: elements
            return

        # empty object expression without properties {}
        if node.objectType.type is 'ObjectExpression' and node.objectType.properties.length is 0
            delete node.objectType
            return

        if node.objectType.type is 'ArrayExpression' or node.objectType.type is 'NewExpression' or node.objectType.type is 'ObjectExpression'
            initialValue =
                node.objectType
        else
            initialValue =
                type: 'NewExpression'
                callee: node.objectType
                arguments: []

        parentNode = context.parentNode()
        grandNode = context.ancestorNodes[context.ancestorNodes.length-2]
        addPosition = 0
        getExistingObjectIdIfTempVarNotNeeded = (node, parentNode, grandNode) ->
            # don't need a temp variable because nothing can trigger on variable declaration
            if parentNode.type is 'VariableDeclarator'
                return parentNode.id
            # don't need a temp variable because nothing can trigger on variable assignment
            if parentNode.type is 'AssignmentExpression' and parentNode.left.type is 'Identifier' and grandNode?.type is 'ExpressionStatement'
                return parentNode.left
            # for everything else we must use a temp variable and assign all sub properties
            # before using the final value in an expression, because it may trigger a setter
            # or be a parameter in a function call or constructor
            return null

        objectId = getExistingObjectIdIfTempVarNotNeeded node, parentNode, grandNode
        if objectId?
            # replace this with the initial value
            context.replace initialValue
            addPosition = 1
            node.properties.reverse()
        else
            # create a temp variable
            objectId = context.addVariable
                offset: 0
                init: initialValue
            # replace this with a reference to the variable
            context.replace objectId

        # traverse all properties and expression statements
        # add a new property that indicates their output scope
        traverse node.properties, (subnode, subcontext) ->
            if subnode.type is 'ObjectExpression' or subnode.type is 'ArrayExpression'
                return subcontext.skip()
            if subnode.type is 'Property' #or subnode.type is 'ExpressionStatement'
                # if initialValue is a simple ObjectExpression then just add to it
                if initialValue.type is 'ObjectExpression' and subnode.computed isnt true
                    initialValue.properties.push subnode
                    return
                # we convert the node to a Property: ObjectExpression node
                # it will be handled correctly by the later propertyStatements rule
                subnode = subcontext.replace
                    type: 'Property'
                    key: objectId
                    value:
                        type: 'ObjectExpression'
                        properties: [subnode]
                        create: false
                subcontext.skip()
            else if subnode.type is 'ExpressionStatement'
                subnode = subcontext.replace
                    type: 'ExpressionStatement'
                    expression:
                        type: 'CallExpression'
                        callee:
                            type: 'MemberExpression'
                            object: objectId
                            property:
                                type: 'Identifier'
                                name: 'add'
                        arguments: [subnode.expression]
                subcontext.skip()
            if not subcontext.parentNode()?
                # add this statement to the current context
                context.addStatement subnode, addPosition

propertyStatements = (node, context) ->
    parent = context.parentNode()
    if node.type is 'Property' and not (parent.type is 'ObjectExpression' or parent.type is 'ObjectPattern')
        if node.objectType?
            throw new Error "Cannot use a typed object on a property declaration statement"
        createAssignments = (path, value) ->
            if value.type is 'ObjectExpression' and not value.objectType?
                for property in value.properties by -1
                    newPath =
                        type: 'MemberExpression'
                        object: path
                        property: property.key
                        computed: property.computed || property.key.type isnt 'Identifier'
                    createAssignments newPath, property.value
                # assign an empty object if required
                if value.create isnt false
                    context.addStatement {
                        type: 'IfStatement'
                        test:
                            type: 'BinaryExpression'
                            operator: '=='
                            left: path
                            right: nullExpression
                        consequent:
                            type: 'ExpressionStatement'
                            expression:
                                type: 'AssignmentExpression'
                                operator: '='
                                left: path
                                right:
                                    type: 'ObjectExpression'
                                    properties: []
                    }, 0
            else
                context.addStatement {
                    type: 'ExpressionStatement'
                    expression:
                        type: 'AssignmentExpression'
                        operator: '='
                        left: path
                        right: value
                }, 0
        createAssignments node.key, node.value
        context.remove node
        # context.replace
        #     type: 'EmptyStatement'

exports.postprocess = (program, options) ->
    steps = [
        [functionParameterDefaultValuesToES5, arrayComprehensionsToES5, extractForLoopsInnerAndTest, extractForLoopRightVariable, callFunctionBindForFatArrows]
        [createForInLoopValueVariable, convertForInToForLength, nodejsModules]
        [separateAllVariableDeclarations, destructuringAssignments]
        [existentialExpression, addUseStrict, typedObjectExpressions, propertyStatements, defaultAssignmentsToDefaultOperators, defaultOperatorsToConditionals]
    ]
    for traversal in steps
        traverse program, (node, context) ->
            for step in traversal
                node = context.current() # might have been changed by a previous step
                step node, context, options
    program
