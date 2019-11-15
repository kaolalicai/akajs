const {tsquery} = require('@phenomnomnominal/tsquery')
import * as ts from 'typescript'
import * as _ from 'lodash'
import * as path from 'path'
import * as fs from 'fs'

const {options} = ts.convertCompilerOptionsFromJson({},'.','tsconfig.json')
options.skipDefaultLibCheck = true
options.skipLibCheck = true

const fileName = 'UserController'
const filePath = `./src/controller/`
const value = fs.readFileSync(filePath + fileName + '.ts').toString()
const ast = tsquery.ast(value)

// 获取这个文件中的controller
// TODO 多个注解的情况需要测试
// TODO 兼容CrudController的restfulApi
const [thisControllerNode] = tsquery(ast, 'ClassDeclaration[name.name="' + fileName + '"]')
if (thisControllerNode) {
  const basePath = thisControllerNode.decorators[0].expression.arguments[0].text
  const methodNodes = tsquery(thisControllerNode,'MethodDeclaration')
  methodNodes.map(methodNode => {
    const method = methodNode.decorators[0].expression.expression.text
    const path = methodNode.decorators[0].expression.arguments[0].text
    const parametersNodes = methodNode.parameters
    const dtoNames: string[] = []
    parametersNodes.map(parametersNode => {
      const [parameterNode] = tsquery(parametersNode,'CallExpression')
      const dtoName = parameterNode && parameterNode.expression.text === 'DTO' ? parameterNode.arguments[0].text : ''
      dtoName && dtoNames.push(dtoName)
    })
    const dtoMsg = parseControllerDtoParams(filePath,ast,dtoNames)
    let params = {}
    dtoNames.map(dtoName => {
      dtoMsg[dtoName].map(item => {
        const param = {}
        param[item.name] = item.type
        _.merge(params,param)
      })
    })

    // 解析res
    const [resNode] = tsquery(methodNode,'TypeReference > TypeLiteral')
    const resMsg = parseResNode(methodNode,filePath,resNode)
    console.log(`${method}  ${basePath}${path} params:${JSON.stringify(params)}  resMsg:`)
  })
}
console.log('==========parse end===========') // 2

function parseResNode (methodNode,dtoPath: string,resNode: any) {
  if (!resNode) return {}
  const paramNodes = tsquery(methodNode,'TypeReference > TypeLiteral > PropertySignature')
  const resProperty = paramNodes.map(paramNode => {
    return parseParamNode(paramNode)
  })
  // todo 把object和array解析出来

  console.log('fiojowiejfoew')
}

interface IResProperty {
  name: string
  type: string
  desc: string
  property?: IResProperty[]
}

function parseParamNode (paramNodes: any,resProperty: IResProperty): IResProperty {
  paramNodes.map(paramNode => {
    if (resProperty && resProperty.type !== 'array' && resProperty.type !== 'object') {
      return resProperty
    }
    const name = paramNode.name.getText() as string
    const type = getTypeFromText(paramNode.type.getText())
    const desc = 'sdfojsdfoijsdoifjdso' // todo 读取注解
    const newResProperty = {name,type,desc,property: []}
    if (!resProperty) {
      resProperty = newResProperty
    } else {
      resProperty.property.push(newResProperty)
    }
  })

  return {name,type,desc,property: []}
}

function getTypeFromText (text: string): string {
  if (text === 'string') return 'string'
  if (text === 'number') return 'number'
  if (text.match(/\]$/)) return 'array'
  if (text.match(/^\{/)) return 'object'
  throw new Error('not match type from Text:' + text)
}

function parseControllerDtoParams (dtoPath: string,fileAst: ts.Node,dtoNames: string[]) {
  const parseResult = {}
  dtoNames.map(dtoName => {
    let [dtoNode] = tsquery(fileAst,'ClassDeclaration[name.name="' + dtoName + '"]')
    if (!dtoNode) {
      // TODO 查找缓存中的dto 思路：先找到导入dto的路径，再找出是否有缓存，没有则根据导入路径直接解析对应的路径
    }
    // TODO 判断是否找到DTO

    const dtoParams = parseExtends(dtoPath,dtoNode,parseDtoParams(dtoNode))

    parseResult[dtoName] = dtoParams
  })
  return parseResult
}

function parseClassValidator (decoratorName: string,args: any[]) {
  // 这是一个对照表用，用name（注解名）找到对应的args解析
}

/**
 * 判断并解析继承参数
 * @param dtoPath 这个dto的目录
 * @param dtoNode
 * @param dtoParams
 */
function parseExtends (dtoPath: string,dtoNode: ts.Node,dtoParams: IProperty[]): IProperty[] {
  const [extendsNode] = tsquery(dtoNode,'HeritageClause > ExpressionWithTypeArguments')
  if (!extendsNode) return dtoParams
  const extendsDtoName = extendsNode.getText()
  const extendsDtoData = getDtoNodeData(dtoPath,dtoNode,extendsDtoName)
  const extendsParams = parseDtoParams(extendsDtoData.dtoNode)

  // merge params
  extendsParams.forEach(property => {
    const newProperty = _.find(dtoParams,item => item.name === property.name)
    if (newProperty) {
      newProperty.conditions.forEach(condition => {
        const exitCondition = _.find(property.conditions,item => item.name === condition.name)
        if (!exitCondition) {
          newProperty.conditions.push(condition)
        }
      })
    } else {
      dtoParams.push(property)
    }
  })
  return parseExtends(extendsDtoData.dtoFilePath,extendsDtoData.dtoNode,dtoParams)
}

// 解析dto里的参数
function parseDtoParams (dtoNode: ts.Node): IProperty[] {
  // TODO 嵌套问题
  // TODO 解析classValidator注解
  const propertyNodes = tsquery(dtoNode,'PropertyDeclaration')
  return propertyNodes.map(propertyNode => {
    const name = propertyNode.name.getText()
    const type = propertyNode.type.getText()
    return {name,type,conditions: []}
  })
}

// 获取特定名字的dtoNode节点，优先选择当前文件
function getDtoNodeData (dtoFilePath: string,fileNode: ts.Node,dtoName: string): {dtoFilePath: string ,dtoNode: ts.Node} {
  fileNode = getFileNode(fileNode)
  const [dtoNode] = tsquery(fileNode,'ClassDeclaration[name.name="' + dtoName + '"]')
  if (dtoNode) return {dtoFilePath,dtoNode}
  // 获取该dto的import绝对路径
  const importNodes = tsquery(fileNode,'ImportSpecifier')
  const importNode = _.find(importNodes,node => node.name.getText() === dtoName)
  if (!importNode) throw new Error('not find DTO :' + dtoName)
  const importPath = importNode.parent.parent.parent.moduleSpecifier.text
  const extendsPath = path.resolve(dtoFilePath,importPath)

  const fileExists = fs.existsSync(extendsPath + '.ts')
  const isTSFile = fileExists && fs.statSync(extendsPath + '.ts').isFile()
  // 如果是文件夹则证明引用的是index文件
  const isDirectory = fs.existsSync(extendsPath) && fs.statSync(extendsPath).isDirectory()
  const node = isTSFile ? getDtoNodeByFilePathAndDtoName(extendsPath + '.ts',dtoName) : getDtoNodeFormDirectoryByDtoName(extendsPath,dtoName)
  if (!node) throw new Error('not find DTO :' + dtoName)
  // 可能的路径
  return {dtoFilePath: extendsPath,dtoNode: node}
}

function getFileNode (node: ts.Node) {
  if (!node.parent) return node
  return getFileNode(node.parent)
}

// 根据dto文件路径和dto名字找到对应的node
function getDtoNodeByFilePathAndDtoName (filePath: string,dtoName: string) {
  const value = fs.readFileSync(filePath).toString()
  const ast = tsquery.ast(value)
  const [dtoNode] = tsquery(ast,'ClassDeclaration[name.name="' + dtoName + '"]')
  return dtoNode
}

function getDtoNodeFormDirectoryByDtoName (dirPath: string,dtoName: string) {
  const fileNames = fs.readdirSync(dirPath)
  const dtoFilePaths = []
  fileNames.map(name => {
    if (name !== 'index.ts') {
      dtoFilePaths.push(path.resolve(dirPath,name))
    }
  })
  let node: ts.Node
  dtoFilePaths.map(p => {
    const dtoNode = getDtoNodeByFilePathAndDtoName(p,dtoName)
    if (dtoNode) node = dtoNode
  })
  return node
}

interface IProperty {
  name: string
  type: string
  conditions: {
    name: string
    args: string[]
  }[]
}
