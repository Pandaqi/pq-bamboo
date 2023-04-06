import Operators from "./nodes/operators"

// these are accessible with the "bamboo NAME" keyword
// @TODO: implement "draw" and "update"
const builtinGlobals = ["iterator", "value", "random", "time", "draw", "update"]

const builtinFunctions = [
    "number", "round", "ceiling", "floor", "abs",
    "string", "uppercase", "lowercase"
]

let baseKeywords = [
    "plus", "minus", "times", "divide", // arithmetic
    "put", "into", "change", "by", "delete", "now", "means", // variables
    "if", "is", "and", "or", "not", "above", "below", "true", "false", "both", "either", // conditionals 
    "stop", "repeat", "skip", "search", // loops
    "machine", "wants", "give", "to", "use", "unplug", "output", // functions
    "say", "comment", // native
    "replace", "with", "select", "in", "from", // (advanced) string manipulation
    "add", "to", "take", "out", "of", // bags
]

const keywords = baseKeywords.concat(builtinGlobals).concat(builtinFunctions);
const operators = {
    "identity": Operators.Identity,
    "+": Operators.Add,
    "plus": Operators.Add,
    "-": Operators.Sub,
    "minus": Operators.Sub,
    "*": Operators.Mult,
    "times": Operators.Mult,
    "/": Operators.Div,
    "divide": Operators.Div,
    "%": Operators.Mod,
    "mod": Operators.Mod,
    "^": Operators.Exp,
    "exp": Operators.Exp,
    "=": Operators.Equals,
    "is": Operators.Equals,
    "!": Operators.LogicalNot,
    "not": Operators.LogicalNot,
    "&&": Operators.LogicalAnd,
    "and": Operators.LogicalAnd,
    "||": Operators.LogicalOr,
    "or": Operators.LogicalOr,
    "above": Operators.Above,
    ">": Operators.Above,
    "below": Operators.Below,
    "<": Operators.Below,
    "round": Operators.Round,
    "floor": Operators.Floor,
    "ceiling": Operators.Ceiling,
    "abs": Operators.Absolute,
    "number": Operators.Number,
    "string": Operators.String,
    "uppercase": Operators.UpperCase,
    "lowercase": Operators.LowerCase,
}

const obj = {
    maxLoopCount: 20,
    workerURL: '/tutorials/js/pq_bamboo/pqBamboo-webworker.min.js',
    builtinGlobals: builtinGlobals, 
    tabCharacter: "\u00a0",
    tabSize: 2,
    builtinFunctions: builtinFunctions,
    keywords: keywords,
    operators: operators,
}
export default obj