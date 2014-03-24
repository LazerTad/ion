'use strict';
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