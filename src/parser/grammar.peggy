{{
  import { createBasicAccumulator } from '@core/pipeline/accumulators/index'
}}

start
  = "[" ws stage:stage (ws "," ws stage)* ws "]" { return [stage]; }

stage
  = groupStage / matchStage / limitStage

groupStage
  = "{" ws "$" type:"group"i ws ":" ws stage:groupStageContent ws "}" { return {type, ...stage}; }

matchStage
  = "{" ws "$" type:"match"i ws ":" ws stage:matchStageContent ws "}" { return {type, ...stage}; }

limitStage
  = "{" ws "$" type:"limit"i ws ":" ws stage:limitStageContent ws "}" { return {type, ...stage}; }

groupStageContent
  = "{" ws  "_id" ws  ":" ws  groupExpr:expressionValue ws accumulators:groupAccumulator* "}" { return {groupExpr, accumulators}; }

groupAccumulator
  = "," ws  outputFieldName:outputField ws  ":" ws "{" ws gr:groupExpression ws "}" ws  { return createBasicAccumulator({outputFieldName, operator: gr.operator, expression: gr.expression}) }

groupExpression
  = "$" operator:groupOperator ws ":" ws expression:(expressionValueArray / expressionValue) { return { operator, expression }; }

expressionValueArray
  = "[" ws value:expressionValue ws values:expressionValueSeparated* ws "]" { return [value, ...values]; }

expressionValueSeparated
  = ws "," ws value:expressionValue ws { return value; }

groupOperator
  = "addToSet"i / "avg"i / "first"i / "last"i / "max"i / "min"i / "push"i / "sum"i

matchStageContent
  =  conditions:matchConditionEnumeration*  { return {conditions}; }

logicalOperatorCondition
  = "{" ws "$" operator:("and"i / "or"i / "not"i) ws ":" ws "[" ws conditions:matchConditionEnumeration* ws "]" ws "}" { return { operator, conditions }; }

matchConditionEnumeration
  = condition:matchCondition ws conditions:matchConditionSeparated* { return [condition, ...conditions]; }
  / condition:logicalOperatorCondition ws conditions:matchConditionSeparated* { return [condition, ...conditions]; }

matchConditionSeparated 
  = ws "," ws condition:matchCondition ws { return condition; }
  / ws "," ws condition:logicalOperatorCondition ws { return condition; }

matchCondition
  = "{" ws fieldName:identifier ws  ":" ws condition:(logicalOperatorCondition / comparisonOperator / simpleValue) ws "}" { return { fieldName, condition }; }

limitStageContent
  = ws limitValue:positiveInteger ws { return { limit: limitValue }; }

comparisonOperator
  = "{" ws "$" operator:("eq"i / "ne"i / "gt"i / "gte"i / "lt"i / "lte"i) ws ":" ws value:expressionValue ws "}" { return { operator, value }; }

simpleValue
  = expressionValue

conditionSeparated
  = ws "," ws condition:condition ws { return condition; }

condition
  = field:fieldReference ws  ":" ws  value:expressionValue { return { field, value }; }

expressionValue
  = 
  fieldReference 
  / expression
  / string
  / boolean
  / null
  / number
  / expressionValueArray

expression
  = "{" ws "$" operator:expressionOperator ws  ":" ws  value:expressionValue ws "}" { return { operator, value }; }

expressionOperator
  = "add"i / "subtract"i / "multiply"i / "divide"i / "toUpper"i / "toLower"i / "cond"i / "gte"i

fieldReference
  = '"$' chars:[^"]* '"' { return { field: chars.join('') } }

outputField
  = identifier

identifier
  = '"'? firstLetter:[a-zA-Z_] restLetters:([a-zA-Z0-9_.])* '"'? { return firstLetter + restLetters.join(''); }

number
  = integer / float

positiveInteger
  = [0-9]+ { return parseInt(text()); }

integer
  = "-"? [0-9]+ { return parseInt(text()); }

float
  = "-"? [0-9]+ "." [0-9]+ (("e"i / "E") ("+" / "-")? [0-9]+)? { return parseFloat(text()); }
string
  = '"' chars:[^"]* '"' { return chars.join(''); }
  / "'" chars:[^']* "'" { return chars.join(''); }

boolean
  = "true"i { return true; }
  / "false"i { return false; }

null
  = "null"i { return null; }

ws "whitespace"
  = [ \t\n\r]*