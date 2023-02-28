const o = PQ_BAMBOO.Operators;

PQ_BAMBOO.config = {
    maxLoopCount: 20,
    workerURL: '/tutorials/js/pqBamboo-parser.js',
    // these are accessible with the "bamboo NAME" keyword
    // @TODO: implement "draw" and "update"
    builtinGlobals: ["iterator", "value", "random", "time", "draw", "update"], 
    tabCharacter: "\u00a0",
    tabSize: 2,
    builtinFunctions: [
        "number", "round", "ceiling", "floor", "abs",
        "string", "uppercase", "lowercase"
    ],
    keywords: [
        "plus", "minus", "times", "divide", // arithmetic
        "put", "into", "change", "by", "delete", "now", "means", // variables
        "if", "is", "and", "or", "not", "above", "below", "true", "false", "both", "either", // conditionals 
        "stop", "repeat", "skip", "search", // loops
        "machine", "wants", "give", "to", "use", "unplug", "output", // functions
        "say", "comment", // native
        "replace", "with", "select", "in", "from", // (advanced) string manipulation
        "add", "to", "take", "out", "of", // bags
    ],
    operators: {
        "identity": o.Identity,
        "+": o.Add,
        "plus": o.Add,
        "-": o.Sub,
        "minus": o.Sub,
        "*": o.Mult,
        "times": o.Mult,
        "/": o.Div,
        "divide": o.Div,
        "%": o.Mod,
        "mod": o.Mod,
        "^": o.Exp,
        "exp": o.Exp,
        "=": o.Equals,
        "is": o.Equals,
        "!": o.LogicalNot,
        "not": o.LogicalNot,
        "&&": o.LogicalAnd,
        "and": o.LogicalAnd,
        "||": o.LogicalOr,
        "or": o.LogicalOr,
        "above": o.Above,
        ">": o.Above,
        "below": o.Below,
        "<": o.Below,
        "round": o.Round,
        "floor": o.Floor,
        "ceiling": o.Ceiling,
        "abs": o.Absolute,
        "number": o.Number,
        "string": o.String,
        "uppercase": o.UpperCase,
        "lowercase": o.LowerCase,
    }
}

PQ_BAMBOO.config.keywords = PQ_BAMBOO.config.keywords.concat(PQ_BAMBOO.config.builtinFunctions).concat(PQ_BAMBOO.config.builtinGlobals);