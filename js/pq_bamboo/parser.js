//
// Each parser returns another "parser function"
// This is any function that transforms String -> [parsedResult (nodes), unconsumedResult (string)]
//
// @SOURCE: https://github.com/lupomontero/parsing
// This gave me a great headstart. I rewrote it, though, to be more clear and explicit about how it work
// Then I added many more helper functions, and build the Bamboo-specific lexer on top of that
//
PQ_BAMBOO.Parser = class {

    setLexer(l)
    {
        this.lexer = l;
    }

    //
    // Core chaining functions
    //
    // Goes through the parsers from left to right
    // Returns the first one that has a valid execution
    returnerDefault = (results) => { return results; }
    choice = (parsers, returner = this.returnerDefault) => {
        let input = parsers.slice();

        return (str) => {
            if (!parsers.length) { return []; }

            let firstParser = parsers[0];
            const parserIsWrapped = firstParser.length == 0;
            if(parserIsWrapped) { firstParser = firstParser(); } 

            const result = firstParser(str);
            const validResult = result.length;
            if(validResult) { 
                return [returner(result[0]), result[1]]; 
            }

            return this.choice(input.slice(1), returner)(str);
        };
    }

    // Executes multiple parsers in sequence
    // While we have parsers, recurse further into them
    // Until we hit one that fails, or none remain
    reducerDefault = (results) => { return results.join(''); }
    seq = (parsers, reducer = this.reducerDefault) => { 
        let input = parsers.slice();

        return (str) => {

            const recurse = (remainingParsers, data) => {
                const noParsersRemain = !remainingParsers.length;
                if (noParsersRemain) { return data; }

                // it has 0 required arguments; parsers always have 1 (`str`)
                // @IMPROV: might update to a while loop, so it keeps unwrapping until it finds something
                let firstParser = remainingParsers[0];
                const parserIsWrapped = firstParser.length == 0;
                if(parserIsWrapped) { firstParser = firstParser(); } 

                const unconsumedText = data[1];
                const result = firstParser(unconsumedText);
                const validResult = result.length;
                if(!validResult) { return []; }

                const parsedText = data[0];
                const newParsedText = [...parsedText, result[0]];
                const newData = [newParsedText, result[1]];
                return recurse(remainingParsers.slice(1), newData);
            };
            
            const result = recurse(input, [[], str]);
            const validResult = result.length > 0;
            if(!validResult) { return []; }

            return [reducer(result[0]), result[1]];
      };
    }

    // Tries the same parser over and over again, until it can't anymore
    // (So failing doesn't mean the _whole_ thing fails, just that it stops recursing)
    someReduceDefault = (results) => { return results.join(''); }
    some = (parser, reducer = this.someReduceDefault) => { 
        return (str) => {
            const recurse = (memo, remaining) => {
                const data = [memo, remaining];
                if (!remaining) { return data }

                const result = parser(remaining);
                const validResult = result.length;
                if(!validResult) { 
                    const nothingConsumed = !data[0];
                    if(nothingConsumed) { return []; }
                    return data;
                }

                const newParsedResults = [...memo, result[0]];
                const unconsumedText = result[1];
                return recurse(newParsedResults, unconsumedText);
            };

            const [result, remaining] = recurse('', str);
            const validResult = result;
            if(!validResult) { return []; }

            return [reducer(result), remaining];
        };
    }
    
    // A "some" parser that's allowed to not consume anything
    maybe = (parser, choiceReducer = undefined, someReducer = undefined) => {
        return this.choice([
            this.some(parser, someReducer),
            this.nothing
        ], choiceReducer);
    }

    // Matches the single character
    char = (c) => {
        return (str) => {
            if(!str.length) { return []; }
            if(str[0] != c) { return []; }
            return [str[0], str.slice(1)];
        };
    }

    // Matches a single space character (regular space, newline, tab, ...)
    charSpace = (str) => {
        if(!str.length) { return []; }
        if(!/\s/.test(str[0])) { return []; }
        return [str[0], str.slice(1)];
    };

    // Matches any character within the given range
    // (JavaScript will automatically convert characters to their code, in alphanumeric order)
    range = (start, end) => {
        return (str) => {
            if(str[0] >= start && str[0] <= end)
            {
                return [str[0], str.slice(1)];
            }
            return [];
        }
    }


    //
    // Useful for parsers that might succeed without doing anything (like "maybe")
    //

    nothing = (str) => { return ['', str]; }
    all = (str) => { return [str, '']; }
    fail = (_str) => { return []; }


    //
    // Helpers for number matching
    //

    zero = this.char('0');
    onenine = this.range('1', '9');
    digit = this.choice([this.zero, this.onenine]);
    digits = this.some(this.digit);
    sign = this.choice([this.char("+"), this.char("-"), this.nothing]);
    
    // Matches an integer of any length
    // Options: 
    // - 1-9 followed by any digits
    // - just one digit
    // - a +/- sign, followed by one of the two options (this option comes later, as +/- takes preference as operator)
    integer = this.choice(
        [
            this.digits,
            this.digit,
            this.seq([this.sign, this.digits]),
        ]);

    // Matches a fraction/float point of any length
    fraction = this.choice([
        this.seq([this.char("."), this.digits]),
        this.nothing
    ]);

    // 
    // Helpers for variables
    //
    varChar = (first = false) => {
        // @TODO: move this to the BAMBOO CONFIG
        const validFirstTokens = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
        const validVariableTokens = validFirstTokens + "0123456789";
        return (str) => {
            if(first) { return this.charChoice(validFirstTokens)(str); }
            return this.charChoice(validVariableTokens)(str);
        }
    }
    varChars = this.seq([this.varChar(true), this.maybe(this.varChar(false))]);

    // Matches if the first character is any from the given list 
    // (can be an array or a string of characters)
    charChoice = (longstring) => {
        return (str) => {
            if(!str.length) { return []; }
            if(!longstring.includes(str[0])) { return []; }
            return [str[0], str.slice(1)];
        }
    }

    charChoiceList = (list) => {
        return (str) => {
            const arr = [];
            for(const elem of list)
            {
                arr.push(this.charChoice(elem));
            }
            return this.choice(arr)(str);
        }
    }


    //
    // Helpers for string matching
    //

    // Matches a string of multiple characters 
    chars = (c) => {
        return (str) => {
            if(str.length < c.length) { return []; }
            const match = (str.slice(0, c.length) == c);
            if(!match) { return []; }
            return [str.slice(0, c.length), str.slice(c.length)];
        }
    }

    // Matches anything BUT the given character
    // @IMPROV: can I create one helper function "not" that will just invert whatever parsers are put into it?
    charNot = (c) => {
        return (str) => {
            if(str.length && str[0] === c) { return []; }
            return [str[0], str.slice(1)];
        }
    }

    charsNot = (c) => {
        return (str) => {
            if(str.length && c.includes(str[0])) { return []; }
            return [str[0], str.slice(1)];
        }
    }

    stringChar = this.charsNot(['"', '\n', '\n\r', '\r']);
    stringChars = this.maybe(this.stringChar);

    //
    // Literals
    //

    // Matches a boolean
    boolReturner = (res) => { return new PQ_BAMBOO.Nodes.Value(res == "true", "bool"); };
    bool = this.choice([this.chars("true"), this.chars("false")], this.boolReturner);

    // Matches a full number (int or float)
    // @NOTE: no parseFloat or anything happens, as the exact _string_ typed needs to be maintained!
    numberReduce = ([i,f]) => { return new PQ_BAMBOO.Nodes.Value(i + f, "number"); }
    number = this.seq([this.integer, this.fraction], this.numberReduce);

    // Matches a string
    stringReduce = ([open,content,close]) => { return new PQ_BAMBOO.Nodes.Value(content, "string", open, close); };
    string = this.seq([this.char('"'), this.stringChars, this.char('"')], this.stringReduce);


    // Matches a literal value
    literalReturner = (val) => { return new PQ_BAMBOO.Nodes.Literal(val); }
    literal = this.choice([
        this.bool,
        this.number,
        this.string
    ], this.literalReturner);  

    //
    // Controlling (loose) spacing
    //

    optSpace = this.maybe(this.charSpace); // optional space
    reqSpace = (str) => { // required space, unless it's the end of the line (str is empty)
        if(str.length <= 0) { return this.nothing(str); }
        return this.some(this.charSpace)(str);
    }

    // matches if the exact chars are present AND it has a space/separator immediately after it
    // (so the string/name can't change into something longer)
    charsExact = (c) => {
        return (str) => {
            if(str.length > c.length) { 
                const nextCharIsSpace = this.charSpace( str[c.length] ).length
                if(!nextCharIsSpace) { return [] }
            }
            return this.chars(c)(str);
        }
    }

    //
    //
    //
    // Specific to my language
    //
    //
    //

    //
    // Operators, keywords and names (variable, function param, ...)
    //

    operator = (c = "+", needsSpace = false) => {
        return (text) => {
            const reducer = ([s1,op,s2]) => { return new PQ_BAMBOO.Nodes.OperatorSymbol(this.lexer.config, s1,op,s2); }

            let parserSequence = this.seq([this.optSpace, this.chars(c), this.optSpace], reducer);
            if(needsSpace) {  parserSequence = this.seq([this.optSpace, this.chars(c), this.reqSpace], reducer); }

            return parserSequence(text);
        }
    }

    keywordReducer = ([s1,k,s2]) => { return new PQ_BAMBOO.Nodes.Keyword(s1,k,s2); }
    keyword = (k) => {
        return this.seq([this.optSpace, this.chars(k), this.reqSpace], this.keywordReducer);
    }

    keywordChoiceList = PQ_BAMBOO.config.keywords.map((elem) => this.charsExact(elem));
    iskeyword = this.choice(this.keywordChoiceList);

    namedValue = (reducer) => {
        return (text) => {
            const keywords = this.iskeyword(text);
            const isKeyword = keywords.length; // it parsed something
            if(isKeyword) { return this.fail(text); }
            return this.seq([this.varChars], reducer)(text);
        }
    }
    
    bagNameReducer = ([v]) => { return new PQ_BAMBOO.Nodes.BagName(v); }
    bagName = this.namedValue(this.bagNameReducer);

    functionNameReducer = ([v]) => { return new PQ_BAMBOO.Nodes.FunctionName(v); }
    functionName = this.namedValue(this.functionNameReducer);

    functionParamReducer = ([v]) => { return new PQ_BAMBOO.Nodes.FunctionParameter(v); }
    functionParameter = this.namedValue(this.functionParamReducer);

    variableReducer = ([v]) => { return new PQ_BAMBOO.Nodes.Variable(this.lexer, v); }
    variable = this.namedValue(this.variableReducer);

    possessiveReducer = ([s1,p,s2]) => { return new PQ_BAMBOO.Nodes.Delimiter(s1+p+s2, "possessive"); }
    possessive = this.seq([this.optSpace, this.chars("'s"), this.optSpace], this.possessiveReducer)

    labelReducer = ([v]) => { return new PQ_BAMBOO.Nodes.Label(v); }
    label = this.seq([
        this.choice([this.literal, this.variable, () => this.evaluation])
    ], this.labelReducer);

    variableIndexedReducer = ([v,p,l]) => { return new PQ_BAMBOO.Nodes.VariableIndexed(v,p,l); }
    variableIndexed = this.seq([
        this.variable,
        this.possessive,
        this.label
    ], this.variableIndexedReducer)

    //
    // Function calls
    //

    // @TODO: optimize and clean this up
    paramList = (asValue = false) => {
        return (text) => {
            let dataType = this.functionParameter;
            if(asValue) { dataType = () => this.evaluation; }

            const someReducer = (res) => { return res.flat(); }
            const extraReducer = ([k,param]) => { return [k, param]; }
            const extraParams = this.maybe(
                this.seq([this.keyword("and"), dataType], extraReducer), 
                undefined, someReducer
            );

            const reducer = ([v1,rest]) => {
                return new PQ_BAMBOO.Nodes.ParamList(v1, rest);
            }
            return this.seq([dataType, extraParams], reducer)(text);
        }
    }

    functionCallReducer = ([k1,c,k2,f]) => { return new PQ_BAMBOO.Nodes.FunctionCall(this.lexer,k1,c,k2,f); }
    
    functionCallWithParams = this.seq([
        this.keyword("give"),
        this.paramList(true),
        this.keyword("to"),
        this.functionName
    ], this.functionCallReducer);
    
    functionCallWithoutParams = this.seq([
        this.keyword("use"),
        this.functionName,
    ], this.functionCallReducer)

    functionCall = this.choice([
        this.functionCallWithoutParams,
        this.functionCallWithParams
    ]);
    
    //
    // Now we get to the actual "grammar"
    // => All the building blocks, from tiniest to largest, that create the syntax
    //

    factorBracket = this.seq(
        [this.char("("), this.optSpace, () => this.evaluation, this.optSpace, this.char(")")],
        ([o,s1,v,s2,c]) => { return new PQ_BAMBOO.Nodes.Factor(o+s1, v, s2+c); }
    )

    literalNamedReducer = ([n,k,c]) => { return new PQ_BAMBOO.Nodes.ValueNamed(n,k,c); }
    literalNamed = this.seq([
        this.bagName,
        this.keyword("means"),
        () => this.evaluation
    ], this.literalNamedReducer)

    factor = this.choice(
        [
            this.factorBracket,
            this.literalNamed,
            this.literal,
            this.functionCall,
            this.variableIndexed,
            this.variable,
        ]);

    termOperator = (op, needsSpace) => {
        return this.seq(
            [this.operator(op, needsSpace), () => this.term], 
            ([op,t]) => { return { op: op, term: t } }
        );
    }

    termChoice = this.choice(
        [
            this.termOperator("^", false,),
            this.termOperator("exp", true),
            this.termOperator("*", false),
            this.termOperator("times", true),
            this.termOperator("/", false),
            this.termOperator("divide", true),
            this.termOperator("%", false),
            this.termOperator("mod", true),
            this.nothing
        ])

    termReducer = ([f,data]) => { 
        if(!data) { return f; }
        return new PQ_BAMBOO.Nodes.Term(f, data.op, data.term); 
    }
    term = this.seq([this.factor, this.termChoice], this.termReducer);

    exprOperator = (op, needsSpace) => {
        return this.seq(
            [this.operator(op, needsSpace), () => this.expression], 
            ([op,expr]) => { return { op: op, expr: expr }; }
        );
    }

    exprChoice = this.choice(
        [
            this.exprOperator("+", false),
            this.exprOperator("plus", true),
            this.exprOperator("-", false),
            this.exprOperator("minus", true),
            this.nothing
        ])

    expressionReducer = ([t,data]) => { 
        if(!data) { return t; }
        return new PQ_BAMBOO.Nodes.Expression(t, data.op, data.expr); 
    }
    expression = this.seq([this.term,this.exprChoice], this.expressionReducer);

    condOneOperator = (op, needsSpace) => {
        const oneReducer = ([expr,k1,cond]) => { return new PQ_BAMBOO.Nodes.Conditional(null, expr, k1, cond); }

        return this.seq([
            this.expression, 
            this.operator(op, needsSpace), 
            () => this.conditional
        ], oneReducer);
    }

    condTwoOperator = (kw, op, needsSpace) => {
        const twoReducer = ([k1,expr,k2,cond]) => { return new PQ_BAMBOO.Nodes.Conditional(k1, expr, k2, cond); }

        return this.seq([
            this.keyword(kw, needsSpace), 
            this.expression, 
            this.operator(op, needsSpace), 
            () => this.conditional
        ], twoReducer);
    }

    unaryReducer = ([op,cond]) => { return new PQ_BAMBOO.Nodes.Conditional(null, null, op, cond); }
    unaryNot = this.choice([
            this.seq([this.operator("!", false), () => this.conditional], this.unaryReducer),
            this.seq([this.operator("not", true), () => this.conditional], this.unaryReducer)
        ]);

    condOneKeyword = this.choice(
        [
            this.condOneOperator("=", false),
            this.condOneOperator("is", true),
            this.condOneOperator(">", false),
            this.condOneOperator("above", true),
            this.condOneOperator("<", false),
            this.condOneOperator("below", true),
        ])

    condTwoKeyword = this.choice(
        [
            this.condTwoOperator("both", "and", true),
            this.condTwoOperator("either", "or", true)
        ])

    // @NOTE: Check "two keyword" first. Otherwise we might calculate an expensive Expression we don't use 
    // ( = first parser of `oneKeyword`)
    conditional = this.choice(
        [
            this.unaryNot,
            this.condTwoKeyword,
            this.condOneKeyword,
            this.expression
        ])
    
    factorKeywordChoice = () => {
        const arr = [];
        for(const func of PQ_BAMBOO.config.builtinFunctions)
        {
            arr.push(this.keyword(func))
        }

        return this.choice(arr);
    }

    factorKeyword = this.seq(
        [this.factorKeywordChoice(), () => this.conditional],
        ([k,v]) => { return new PQ_BAMBOO.Nodes.FactorKeyword(k, v); }
    )

    bambooGlobalChoice = () => {
        const arr = [];
        for(const bambooGlobal of PQ_BAMBOO.config.builtinGlobals)
        {
            arr.push(this.chars(bambooGlobal));
        }
        return this.choice(arr);
    }
    bambooKeyword = this.seq(
        [this.keyword("bamboo"), this.bambooGlobalChoice()],
        ([k1,k2]) => { return new PQ_BAMBOO.Nodes.BambooKeyword(this.lexer,k1,k2); }
    )

    replaceReducer = ([k1,c1,k2,c2,k3,c3]) => { return new PQ_BAMBOO.Nodes.StringReplace(k1,c1,k2,c2,k3,c3); }
    stringReplace = this.seq([
        this.keyword("replace"),
        () => this.evaluation,
        this.keyword("with"),
        () => this.evaluation,
        this.keyword("in"),
        () => this.evaluation
    ], this.replaceReducer)

    sliceReducer = ([k1,c1,k2,c2,k3,c3]) => { return new PQ_BAMBOO.Nodes.StringSlice(k1,c1,k2,c2,k3,c3); }
    stringSlice = this.seq([
        this.keyword("select"),
        () => this.evaluation,
        this.keyword("to"),
        () => this.evaluation,
        this.keyword("from"),
        () => this.evaluation
    ], this.sliceReducer)

    bagPushReducer = ([k1,v,k2,b]) => { return new PQ_BAMBOO.Nodes.BagPush(this.lexer,k1,v,k2,b); }
    bagPush = this.seq([
        this.keyword("add"),
        this.choice([
            () => this.evaluation,
            this.literalNamed
        ]),
        this.keyword("to"),
        this.bagName
    ], this.bagPushReducer)

    bagPopReducer = ([k1,key,k2,k3,b]) => { return new PQ_BAMBOO.Nodes.BagPop(this.lexer,k1,key,k2,k3,b); }
    bagPop = this.seq([
        this.keyword("take"),
        this.choice([
            () => this.evaluation,
            this.nothing
        ]),
        this.keyword("out"),
        this.keyword("of"),
        this.bagName
    ], this.bagPopReducer)
    
    evaluation = this.choice(
        [
            this.bambooKeyword,
            this.factorKeyword,
            this.bagPush,
            this.bagPop,
            this.stringReplace,
            this.stringSlice,
            this.conditional
        ])

    // @TODO: probably just rewrite this into separate cases, 
    // much cleaner to read (with no performance hit)
    loopReducer = ([k1,c,k2]) => { return new PQ_BAMBOO.Nodes.LoopStatement(k1,c,k2); }
    blockSomeReducer = (res) => { return res[0]; } // take the first thing from each list
    loopStatement = this.seq(
        [
            this.keyword("repeat"),
            this.maybe(this.evaluation, undefined, this.blockSomeReducer),
            this.maybe(this.keyword("times"), undefined, this.blockSomeReducer)
        ], 
        this.loopReducer
    )

    searchReducer = ([k,v]) => { return new PQ_BAMBOO.Nodes.SearchStatement(k,v); }
    searchStatement = this.seq(
        [
            this.keyword("search"),
            this.evaluation
        ],
        this.searchReducer
    )

    functionStatementReducer = ([k1,v,k2,p]) => { return new PQ_BAMBOO.Nodes.FunctionStatement(k1,v,k2,p); }
    functionStatement = this.seq(
        [
            this.keyword("machine"),
            this.functionName,
            this.maybe(this.keyword("wants"), undefined, this.blockSomeReducer),
            this.maybe(this.paramList(false), undefined, this.blockSomeReducer)
        ], 
        this.functionStatementReducer
    );

    commentReducer = ([op,content]) => { return new PQ_BAMBOO.Nodes.Comment(op, content); }
    comment = this.seq([
        this.choice([this.char(">"), this.keyword("comment")]),
        this.stringChars
    ], this.commentReducer);

    logReducer = ([k,c]) => { return new PQ_BAMBOO.Nodes.LogStatement(k,c); }
    logStatement = this.seq([this.keyword("say"), this.evaluation], this.logReducer);

    assignmentReducer = ([k1,c,k2,v]) => { return new PQ_BAMBOO.Nodes.Assignment(k1,c,k2,v); }
    assignmentNow = this.seq([
        this.keyword("now"),
        this.variable,
        this.keyword("means"),
        this.evaluation
    ], this.assignmentReducer)

    assignmentPut = this.seq([
        this.keyword("put"),
        this.evaluation,
        this.keyword("into"),
        this.variable
    ], this.assignmentReducer);

    assignmentChange = this.seq([
        this.keyword("change"),
        this.variable,
        this.keyword("by"),
        this.evaluation
    ], this.assignmentReducer)

    assignmentDelete = this.seq([
        this.keyword("delete"),
        this.variable
    ], this.assignmentReducer);

    assignment = this.choice([
        this.assignmentNow,
        this.assignmentPut,
        this.assignmentChange,
        this.assignmentDelete
    ]);

    ifReducer = ([k,s,cond]) => { return new PQ_BAMBOO.Nodes.IfStatement(k, s, cond); }
    ifStatement = this.seq([this.keyword("if"), this.evaluation], this.ifReducer);

    bagReducer = ([k1,v,k2]) => { return new PQ_BAMBOO.Nodes.BagStatement(k1, v, k2); }
    bagStatement = this.seq([
        this.keyword("bag"),
        this.bagName,
        this.keyword("holds")
    ], this.bagReducer)

    oneKeywordStatements = this.choice(
        [
            this.keyword("stop"), 
            this.keyword("skip"), 
            this.keyword("unplug"), 
            this.keyword("output")
        ]);

    multiKeywordStatements = this.choice(
        [
            this.logStatement,
            this.ifStatement,
            this.loopStatement,
            this.searchStatement,
            this.functionStatement,
            this.bagStatement,
            this.assignment,
            this.comment,
            this.evaluation
        ]) 

    statement = this.choice(
        [this.oneKeywordStatements, this.multiKeywordStatements],
        (val) => { return new PQ_BAMBOO.Nodes.Statement(val); }
    )
  
}

PQ_BAMBOO.PARSER = new PQ_BAMBOO.Parser();