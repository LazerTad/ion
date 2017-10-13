import {traverse,remove,Visitor} from "../Traversal"
import toposort from "../toposort"
import * as escodegen from "escodegen"
import * as iot from "../IonAstTypes"
import * as common from "../common"

export function fail(node:any, message: string) {
    let error: any = new Error(message)
    let location = node.__location || node
    error.location = location
    throw error
}

const Module_NoVars = (node:any) => {
    function failIfVar(declaration:any) {
        if (Array.isArray(declaration)) {
            for (let d of declaration) {
                failIfVar(d)
            }
        }
        else if (declaration.type === iot.VariableDeclaration && declaration.kind !== 'let') {
            fail(declaration, "Cannot export mutable variables")
        }
    }
    failIfVar(node.declarations)
    failIfVar(node.exports)
}
// const __BinaryExpression_ToCall = (node:any) => {
//     let {location, left, right, operator} = node
//     return {
//         type:'Call',
//         location,
//         callee: {type:'IdReference', name:operator},
//         arguments: [left, right]
//     }
// }
const Assembly_NamesInitAndModuleNameInit = (node:any) => {
    let names: any = {}
    for (let modulePath in node.modules) {
        let module = node.modules[modulePath]
        let name: any = modulePath.split('.').pop()
        module.name = name
        if (names[name])
            fail(node.modules[modulePath], "CompilerError: " + modulePath + " short name cannot be the same as " + names[name])
        names[name] = modulePath
    }
    node._names = names
}
const IdDeclaration_CheckNoHideModuleNames = (node:any, ancestors:any[], path:string[]) => {
    let {name} = node
    let root = ancestors[0]
    let moduleName = path[1]
    if (root._names[name] && !moduleName.endsWith(name))
        fail(node, "Cannot declare identifier with same name as local module: " + name)
}
const Module_DependenciesCreate = (node:any, ancestors:any[]) => {
    node._dependencies = {}
}
const IdReference_ModuleDependenciesInit = (node:any, ancestors:any[]) => {
    let {name} = node
    let [assembly, , module] = ancestors
    let modulePath = assembly._names[name]
    if (modulePath) {
        module._dependencies[modulePath] = {__location:node.__location}
    }
}
const Assembly_ModuleOrderInit = (node:any) => {
    let edges: [any,any,any][] = [] // third item is location of dependency IdReference
    let tail = {}
    // get all the module dependencies as edges
    for (let modulePath in node.modules) {
        let module = node.modules[modulePath]
        let dependencies = module._dependencies
        edges.push([modulePath, tail, null])
        for (let dep in dependencies) {
            edges.push([dep, modulePath, dependencies[dep]])
        }
    }
    let lastRemovedEdge = null
    while (true) {
        let order
        try {
            order = toposort(edges).slice(0, -1) // slice to remove tail
        }
        catch (e) {
            lastRemovedEdge = edges.pop()
            continue
        }
        if (lastRemovedEdge != null) {
            //  this means we have failed with a cyclic dependency
            //  the last removed one must be the problem since it works now
            let location = lastRemovedEdge[2].__location
            fail(location, "Cyclic module dependencies are not supported")
        }
        node._moduleOrder = order
        return
    }

}

const _Literal_AddType = (node:any) => {
    let {value} = node
    if (typeof value === 'number') {
        node.valueType = {type: "TypeReference", name:"Number", absolute:true}
    }
    if (typeof value === 'boolean') {
        node.valueType = {type: "TypeReference", name:"Boolean", absolute:true}
    }
    if (typeof value === 'string') {
        node.valueType = {type: "TypeReference", name:"String", absolute:true}
    }
}

const _VariableDeclarator_ValueTypeInferFromValue = (node:any) => {
    if (node.valueType == null && node.value != null && node.value.valueType != null) {
        //  shared copy reference?? is this desirable?
        node.valueType = node.value.valueType
    }
}

const Assembly_NestModules = (node:any) => {
    let rootModules: any = {modules:{}}
    function getModule(steps:string[]): any {
        if (steps.length == 0)
            return rootModules
        let parentModule = getModule(steps.slice(0, -1))
        let name = steps[steps.length - 1]
        let module = parentModule.modules[name]
        if (module == null)
            module = parentModule.modules[name] = {type:'Module',imports:[],declarations:[],exports:[],modules:{}}
        return module
    }

    for (let path in node.modules) {
        let module = node.modules[path]
        let steps = path.split('.')
        let parentPath = steps.slice(0, -1)
        let parentModule = getModule(parentPath)
        let name = steps[steps.length - 1]
        parentModule.modules[name] = module
    }
    //  now replace root modules with this new modules
    node.modules = rootModules.modules
}

const Module_ModulesToExports = (node: any) => {
    for (let name in node.modules) {
        let module = node.modules[name]
        node.exports.push(
            {
                type: iot.VariableDeclaration,
                kind: 'let',
                declarations: [
                    {
                        type: iot.VariableDeclarator,
                        id: {type:'Id', name},
                        init: module
                    }
                ]
            }
        )
    }
    //  now remove modules
    delete node.modules
}

const File_Write = (node:any) => {
    console.log('Writing ' + node.path)
    common.write(node.path, node.content, node.encoding)
}

export const passes = [
    [Module_NoVars, Assembly_NamesInitAndModuleNameInit, IdDeclaration_CheckNoHideModuleNames],
    [Module_DependenciesCreate, IdReference_ModuleDependenciesInit],
    [_Literal_AddType,_VariableDeclarator_ValueTypeInferFromValue],
    [Assembly_ModuleOrderInit, Assembly_NestModules],
    [Module_ModulesToExports]
]