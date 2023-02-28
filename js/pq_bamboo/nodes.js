PQ_BAMBOO.Helpers = {
    Feedback: class {
        constructor(valueNode, lineNumber)
        {
            this.value = valueNode.value.toString();
            this.type = valueNode.type;
            this.lineNumber = lineNumber;
        }

        printPretty(text)
        {
            text = text.replace(/\_(.*?)\_/g, "<em>$1</em>");
            text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return text;
        }

        capitalize(text)
        {
            return text.slice(0,1).toUpperCase() + text.slice(1);
        }

        print(params = {})
        {
            let str = this.printPretty(this.value);
            let lineNum = "<span class='line-num'>" + this.lineNumber + "</span>"
            if(!this.lineNumber) { lineNum = ""; }

            let header = params.header || this.capitalize(this.type)
            header += " > ";

            let cssClass = "bamboo-feedback-" + this.type;
            if(params.class) { cssClass += " " + params.class; }

            return "<div class='bamboo-feedback'>"
                    + "<div class='" + cssClass + "'>"
                    + lineNum
                    + header
                    + str
                    + "</div>"
                    + "</div>"
        }

        is(type)
        {
            return this.type == type;
        }

        isLiteral()
        {
            return this.type == "bool" || this.type == "number" || this.type == "string"
        }

        isBag()
        {
            return this.type == "bag"
        }
    },

    repeatString(txt, num)
    {
        let str = "";
        for(let i = 0; i < num; i++)
        {
            str += txt;
        }
        return str;
    },

    divideString(s1, s2)
    {
        for(let i = 0; i < s2.length; i++)
        {
            s1 = s1.replaceAll(s2[i], "");
        }
        return s1;
    }
}

PQ_BAMBOO.TypeCoercer = {
    toBool(val)
    {
        this.numberToBool(val);
        this.stringToBool(val);
    },

    numberToBool(node)
    {
        if(node.type != "number") { return; }
        node.set(parseInt(node.value) != 0, "bool");
    },

    stringToBool(node)
    {
        if(typeof node.value != "string") { return; }
        node.set(node.value.length > 0, "bool");
    },

    toNumber(val)
    {
        this.boolToNumber(val);
        this.stringToNumber(val);
    },

    boolToNumber(node)
    {
        if(node.type != "bool") { return; }
        let bool = node.value;
        if(typeof bool === 'string') { bool = (bool == "true"); }
        node.set(bool ? 1 : 0, "number");
    },

    stringToNumber(node)
    {
        if(typeof node.value != "string") { return; }
        const num = parseFloat(node.value);
        if(isNaN(num)) { node.set("Can't use string **" + node.value + "** as a number", "error"); }
        else { node.set(num, "number"); }
    },

    toString(val)
    {
        this.boolToString(val);
        this.numberToString(val);
    },

    boolToString(node)
    {
        if(node.type != "bool") { return; }
        node.set(node.value, "string");
    },

    numberToString(node)
    {
        if(node.type != "number") { return; }
        node.set(node.value.toString(), "string");
    }
},

PQ_BAMBOO.Operators = {

    Identity: {
        toResult(a, _b, val)
        {
            return val.set(a.toResult(), a.type);
        }
    },

    Add: {
        toResult(a,b,val)
        {
            if(a.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(a); }
            if(b.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber()) { 
                return val.set(a.toResult() + b.toResult(), "number");
            }

            return val.set(a.toString() + b.toString(), "string");
        }
    },

    Sub: {
        toResult(a,b,val)
        {
            if(a.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(a); }
            if(b.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() - b.toResult(), "number");
            }

            if(a.isString() && b.isNumber())
            {
                const aVal = a.toResult();
                const bVal = b.toResult();
                return val.set(aVal.slice(0, aVal.length - bVal), "string");
            }

            if(a.isNumber() && b.isString())
            {
                return val.set(b.toResult().slice(a.toResult()), "string");
            }

            if(a.isString() && b.isString())
            {
                let aVal = a.toResult();
                const bVal = b.toResult();
                if(aVal.includes(bVal)) { aVal = aVal.replace(bVal, ""); }
                return val.set(aVal, "string");
            }
        }
    },

    Mult: {
        toResult(a, b, val)
        {
            if(a.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(a); }
            if(b.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() * b.toResult(), "number");
            }

            // the same two things, just reversed
            if(a.isString() && b.isNumber())
            {
                const res = PQ_BAMBOO.Helpers.repeatString(a.toResult(), b.toResult());
                return val.set(res, "string");
            }

            if(a.isNumber() && b.isString())
            {
                const res = PQ_BAMBOO.Helpers.repeatString(b.toResult(), a.toResult());
                return val.set(res, "string");
            }

            if(a.isString() && b.isString())
            {
                // TODO: define string times string multiplication
            }
        }
    },

    Div: {
        toResult(a, b, val)
        {
            if(a.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(a); }
            if(b.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                if(b.toResult() == 0) { return val.set("Can't divide by zero!", "error"); }
                return val.set(parseFloat(a.toResult()) / parseFloat(b.toResult()), "number");
            }

            // 5 / "cat" = 5/3
            if(a.isNumber() && b.isString())
            {
                const divLength = b.toResult().length;
                return val.set(a.toResult() / divLength, "number");
            }

            // "cat" / 5 = 3/5 (inverse of above)
            // => @TODO: might want this a "string" output as well?
            if(a.isString() && b.isNumber())
            {
                const divLength = a.toResult().length;
                return val.set(b.toResult() / divLength, "number");
            }

            // "fat rat" / "fr" = "at at"
            if(a.isString() && b.isString())
            {
                const res = PQ_BAMBOO.Helpers.divideString(a.toResult(), b.toResult());
                return val.set(res, "string");
            }
        }
    },

    Mod: {
        toResult(a, b, val)
        {
            if(a.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(a); }
            if(b.isBool()) { PQ_BAMBOO.TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() % b.toResult(), "number");
            }

            // "hello" % 2 = "h"
            if(a.isString() && b.isNumber())
            {
                const modLength = Math.round(a.toResult().length % b.toResult());
                return val.set(a.toResult().slice(0, modLength), "string");
            }

            // 5 % "hey" = 2
            if(a.isNumber() && b.isString())
            {
                const modLength = b.toResult().length;
                return val.set(a.toResult() % modLength, "number");
            }

            // "fat rat" % "at" = "f r"
            if(a.isString() && b.isString())
            {
                const result = a.toResult().replaceAll(b.toResult(), "");
                return val.set(result, "string");
            }
        }
    },

    Exp: {
        toResult(a, b, val)
        {
            if(a.isNumber() && b.isNumber())
            {
                const res = Math.pow(a.toResult(), b.toResult());
                return val.set(res, "number");
            }

            // @TODO: define it for other types.
        }
    },

    Equals: {
        toResult(a, b, val)
        {
            const coerc = PQ_BAMBOO.TypeCoercer;
            if(a.isNumber() && b.isString()) { coerc.toNumber(b); }
            if(a.isString() && b.isNumber()) { coerc.toString(b); }
            if(a.isBool()) { coerc.toBool(b); }
            if(b.isBool()) { coerc.toBool(a); }

            return val.set(a.toResult() == b.toResult(), "bool");
        }
    },

    LogicalAnd: {
        toResult(a, b, val)
        {
            PQ_BAMBOO.TypeCoercer.toBool(a); 
            PQ_BAMBOO.TypeCoercer.toBool(b); 

            return val.set(a.toResult() && b.toResult(), "bool");
        }
    },

    LogicalOr: {
        toResult(a, b, val)
        {
            PQ_BAMBOO.TypeCoercer.toBool(a); 
            PQ_BAMBOO.TypeCoercer.toBool(b); 

            return val.set(a.toResult() || b.toResult(), "bool");
        }
    },

    LogicalNot: {
        toResult(a, b, val)
        {
            PQ_BAMBOO.TypeCoercer.toBool(a); 
            PQ_BAMBOO.TypeCoercer.toBool(b); 

            return val.set(!a.toResult(), "bool");
        }
    },

    // @IMPROV: I might allow coercing a string to a number, by giving its LENGTH
    Above: {
        toResult(a, b, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a); 
            PQ_BAMBOO.TypeCoercer.toNumber(b); 

            return val.set(a.toResult() > b.toResult(), "bool");
        }
    },

    Below: {
        toResult(a, b, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a); 
            PQ_BAMBOO.TypeCoercer.toNumber(b); 

            return val.set(a.toResult() < b.toResult(), "bool");
        }
    },

    Round: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a);
            return val.set(Math.round(a.toResult()), "number");
        }
    },

    Floor: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a);
            return val.set(Math.floor(a.toResult()), "number");
        }
    },

    Ceiling: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a);
            return val.set(Math.ceil(a.toResult()), "number");
        }
    },

    Absolute: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a);
            return val.set(Math.abs(a.toResult()), "number");
        }
    },

    Number: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toNumber(a);
            return val.set(a.toResult(), "number");
        }
    },

    String: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toString(a);
            return val.set(a.toResult(), "string");
        }
    },

    UpperCase: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toString(a);
            return val.set(a.toResult().toUpperCase(), "string");
        }
    },

    LowerCase: {
        toResult(a, val)
        {
            PQ_BAMBOO.TypeCoercer.toString(a);
            return val.set(a.toResult().toLowerCase(), "string");
        }
    }
}

PQ_BAMBOO.Nodes = {

    // @NOTE: Values are always stored as their strings
    // They are converted to their proper type only when you do toResult()
    // Otherwise, conversion changes representation, which messes up our syntax highlighting 
    //      => eg. parseFloat(5.0) = 5, you suddenly lose the digit!
    Value: class {
        constructor(v = 0, t = "nothing", o = null, c = null)
        {
            this.set(v,t);
            if(o) { this.delimOpen = new PQ_BAMBOO.Nodes.Delimiter(o, "quote"); }
            if(c) { this.delimClose = new PQ_BAMBOO.Nodes.Delimiter(o, "quote"); }
        }

        clone()
        {
            return new PQ_BAMBOO.Nodes.Value(structuredClone(this.value), structuredClone(this.type));
        }

        // @NOTE: Values can _optionally_ be labeled, only used for named keys in bags
        setLabel(l)
        {
            this.label = l;
        }

        getLabel()
        {
            return this.label;
        }

        print(lineNumber)
        {
            return new PQ_BAMBOO.Helpers.Feedback(this, lineNumber);
        }

        // @NOTE: This is what actually gives a raw piece of info ("value") back
        // Otherwise, these _objects_ (Value() are stored and passed around)
        toResult()
        {
            const coerc = PQ_BAMBOO.TypeCoercer;
            const val = this.clone();
            if(this.type == "number") { coerc.toNumber(val); }
            else if(this.type == "bool") { coerc.toBool(val); }
            else if(this.type == "string") { coerc.toString(val); }
            return val.value;
        }

        toString()
        {
            return "<span class='value " + this.type + "'>"
                    + (this.delimOpen ? this.delimOpen.toString() : "")
                    + this.value.toString()
                    + (this.delimClose ? this.delimClose.toString() : "")
                    + "</span>";
        }

        toLogString()
        {
            return this.value + "";
        }

        toOriginalString()
        {
            return this.value;
        }

        set(v,t)
        {
            this.setValue(v);
            this.setType(t);
            return this;
        }

        setType(t)
        {
            this.type = t;
        }

        getType()
        {
            return this.type;
        }

        setValue(v)
        {
            this.value = v;
        }

        getValue()
        {
            return this.value;
        }

        // @NOTE: optimizing by calling `this` immediately (3rd param toResult) will break stuff, don't do it
        update(valueObj)
        {
            const plusOperator = PQ_BAMBOO.config.operators["+"];
            const res = new PQ_BAMBOO.Nodes.Value();
            plusOperator.toResult(this, valueObj, res);
            this.set(res.value, res.type);
            return this;
        }

        isError()
        {
            return this.type == "error";
        }

        isBool()
        {
            return this.type == "bool";
        }

        isNumber()
        {
            return this.type == "number";
        }

        isString()
        {
            return this.type == "string";
        }

        isKeyword(val = "")
        {
            const kw = this.type == "keyword";
            if(!val) { return kw }
            return kw && this.value == val;
        }

        getKeyword()
        {
            if(!this.type == "keyword") { return null; }
            return this.value;
        }

        isTrue()
        {
            if(this.isError()) { return false; }
            return this.toResult();
        }

        getSize()
        {
            return new PQ_BAMBOO.Nodes.Value(this.toResult().length, "number"); 
        }

        getLabels()
        {
            // @TODO: labels returns bag for literal values? Only makes some sense for strings?
        }

        getItems()
        {
            // @TODO: items returns bag for literal values? Only makes some sense for strings?
        }
    },

    ValueNamed: class {
        constructor(n,k,v)
        {
            this.name = n;
            this.keyword = k;
            this.value = v;
        }  

        toString()
        {
            return "<span class='literal-named'>"
                    + this.name.toString()
                    + this.keyword.toString()
                    + this.value.toString()
                    + "</span>"
        }

        toResult()
        {
            const v = this.value.toResult().clone();
            v.setLabel(this.getLabel());
            return v;
        }

        getLabel()
        {
            return this.name.toOriginalString();
        }
    },

    Bag: class {
        constructor(n)
        {
            this.name = n;
            this.content = {};
        }

        // @TODO: a function to check if it's numbered? Default to an _Array_, but switch once we receive our first named value?
    
        clone()
        {
            const b = new PQ_BAMBOO.Nodes.Bag(this.name);
            b.setContent(this.content);
            return b;
        }

        print(lineNumber)
        {
            return new PQ_BAMBOO.Nodes.Value(this.toLogString(), "bag").print(lineNumber);
        }

        toLogString()
        {            
            const sections = [];
            for(const [key, value] of Object.entries(this.content))
            {
                sections.push(key + " => " + value);
            }

            return "[" + sections.join(", ") + "]";
        }
        
        // @NOTE: Only Bag and Value objects are "end points" => they don't call toResult automatically.
        toResult()
        {
            return this;
        }

        isKeyword(k) { return false; }
        getKeyword() { return null; }
        isTrue() { return this.getSize() > 0; }
        getLabel() { return ""; }
        isError() { return false; }
        isBool() { return false; }
        isNumber() { return false; }
        isString() { return false; }

        setContent(list)
        {
            this.content = list;
        }

        addValue(val)
        {
            let key = Object.keys(this.content).length;
            let finalVal = val;
            if(val.getLabel()) { key = val.getLabel(); }
            this.content[key] = finalVal;
        }

        removeValueByKey(key)
        {
            const errorVal = new PQ_BAMBOO.Nodes.Value("Bag **" + this.name + "** doesn't have key **" + key + "**", "error");
            if(this.isArray())
            {
                key = parseInt(key);
                if(!isNaN(key)) { return this.content.splice(key, 1); }
                return errorVal;
            }

            key = key + "";
            console.log(this.content);
            console.log(key);
            console.log(this.content[key]);

            if(!(key in this.content)) { return errorVal; }
            const val = this.content[key];
            delete this.content[key];
            return val;
        }

        push(val, key = null)
        {
            if(this.isArray()) { this.content.push(val); return val; }
            if(!key) { this.addValue(val); return val; }
            this.content[key] = val;
            return val;
        }

        pop()
        {
            if(this.isEmpty()) { return new PQ_BAMBOO.Nodes.Value(); }
            if(this.isArray()) { return this.content.pop(); }
            const keys = Object.keys(this.content);
            const lastKey = keys[keys.length - 1];
            const val = this.content[lastKey];
            delete this.content[lastKey];
            return val;
        }

        getValue(key)
        {
            const errorVal = new PQ_BAMBOO.Nodes.Value("Bag **" + this.name + "** doesn't have key **" + key + "**", "error");
            if(this.isArray())
            {
                key = parseInt(key);
                if(isNaN(key)) { return errorVal; }
                return this.content[key];
            }

            key = key + ""; // @NOTE: if it's not an array, all keys will be string indexed
            if(!Object.keys(this.content).includes(key)) { return errorVal; }
            return this.content[key];
        }

        isEmpty()
        {
            return this.getSize() <= 0;
        }

        getSize()
        {
            let length = Object.keys(this.content).length;
            if(this.isArray()) { length = this.content.length; }
            return new PQ_BAMBOO.Nodes.Value(length, "number"); 
        }

        getLabels()
        {
            const b = new PQ_BAMBOO.Nodes.Bag(this.name + "-labels");
            b.setContent(this.getKeysRaw());
            return b;
        }

        getItems()
        {
            const b = new PQ_BAMBOO.Nodes.Bag(this.name + "-items");
            b.setContent(this.getValuesRaw());
            return b;
        }

        isArray()
        {
            return Array.isArray(this.content);
        }

        isObject()
        {
            return (typeof this.content === 'object');
        }

        getKeysRaw()
        {
            const arr = [];
            if(this.isArray())
            {
                for(let i = 0; i < this.content.length; i++)
                {
                    arr.push(i);
                }
            } else {
                for(const key of Object.keys(this.content))
                {
                    arr.push(new PQ_BAMBOO.Nodes.Value(key, "string"));
                }
            }
            return arr;
        }
        
        getValuesRaw()
        {
            if(this.isArray()) { return this.content; }
            return Object.values(this.content);
        }

        getFirst()
        {
            if(this.getSize() <= 0) { return new PQ_BAMBOO.Nodes.Value(); }
            const keys = Object.keys(this.content);
            const firstKey = keys[0];
            const val = this.content[firstKey].toResult().clone()
            return val;
        }

        getLast()
        {
            if(this.getSize() <= 0) { return new PQ_BAMBOO.Nodes.Value(); }
            const keys = Object.keys(this.content);
            const lastKey = keys[keys.length - 1];
            const val = this.content[lastKey].toResult().clone();
            return val;
        }

    },
    
    Memory: class {
        constructor(cfg)
        {
            this.contexts = [];
            this.config = cfg;
        }

        pushContext(block = undefined, data = undefined)
        {
            const ctx = new PQ_BAMBOO.Nodes.MemoryContext(block, data);
            this.contexts.push(ctx);
            return ctx.getData();
        }

        popContext()
        {
            return this.contexts.pop();
        }

        getLastContext()
        {
            return this.contexts[this.contexts.length - 1];
        }

        scopeBlockingEnabled()
        {
            return !this.config.disabled.includes("scopeBlock");
        }

        // @IMPROV: just make proper Error classes?
        error(key)
        {
            return new PQ_BAMBOO.Nodes.Value("Name **" + key + "** doesn't exist in memory!", "error"); 
        }

        has(key)
        {
            for(let i = this.contexts.length - 1; i >= 0; i--)
            {
                const ctx = this.contexts[i];
                if(ctx.has(key)) { return true; }
                if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
            }
            return false;
        }

        get(key)
        {
            for(let i = this.contexts.length - 1; i >= 0; i--)
            {
                const ctx = this.contexts[i];
                if(ctx.has(key)) { return ctx.get(key); }
                if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
            }
            return this.error(key);
        }

        set(key, val)
        {
            for(let i = this.contexts.length - 1; i >= 0; i--)
            {
                const ctx = this.contexts[i];
                if(ctx.has(key)) { return ctx.set(key, val); }
                if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
            }

            // if we reached here, the value isn't anywhere else yet, so just set it locally
            return this.getLastContext().set(key, val);
        }

        delete(key)
        {
            for(let i = this.contexts.length - 1; i >= 0; i--)
            {
                const ctx = this.contexts[i];
                if(ctx.has(key)) { return ctx.delete(key); }
                if(ctx.blocksScope()) { break; }
            }
            return this.error(key);
        }
    },

    // @NOTE: _Nothing_ interfaces directly with this, they always use the main memory object
    MemoryContext: class {
        constructor(block = null, data = {})
        {
            this.block = block;
            this.data = data;
        }

        has(key)
        {
            return key in this.data;
        }

        get(key)
        {
            return this.data[key];
        }

        set(key, val)
        {
            this.data[key] = val;
            return val;
        }

        delete(key)
        {
            delete this.data[key];
        }

        getData()
        {
            return this.data;
        }

        blocksScope()
        {
            if(!this.block) { return false; }
            if(!this.block.header) { return false; }
            return this.block.header.isDefinition(PQ_BAMBOO.Nodes.FunctionStatement);
        }
    },

    // @NOTE: This includes whitespace and terminators
    Delimiter: class {
        constructor(v, t)
        {
            this.value = v;
            this.type = t;
        }

        toString()
        {
            return "<span class='delimiter delimiter-" + this.type + "'>" + this.toOriginalString() + "</span>"
        }

        toOriginalString()
        {
            return this.value;
        }
    },

    EmptyLine: class {
        constructor(s, ln)
        {
            this.space = new PQ_BAMBOO.Nodes.Delimiter(s, "space");
            this.lineNumber = ln;
        }

        toString()
        {
            return "<span class='single-line-container'><span class='single-line'>"
                    + "<span class='line-number'>" + this.lineNumber + "</span>"
                    + "<span class='blank-line'>" 
                    + this.space.toString() 
                    + "</span></span></span>";
        }

        getLineNumber()
        {
            return this.lineNumber;
        }
    },

    OperatorSymbol: class {
        constructor(cfg, s1 = "", c = "identity", s2 = "")
        {
            this.config = cfg;
            this.symbol = c;
            if(s1) { this.spaceBefore = new PQ_BAMBOO.Nodes.Delimiter(s1, "space"); }
            if(s2) { this.spaceAfter = new PQ_BAMBOO.Nodes.Delimiter(s2, "space"); }
        }

        toString()
        {
            if(this.symbol == "identity") { return ""; }
            return "<span class='operator'>"
                        + (this.spaceBefore ? this.spaceBefore.toString() : "")
                        + "<span class='operator-symbol'>" + this.symbol + "</span>" 
                        + (this.spaceAfter ? this.spaceAfter.toString() : "")
                        + "</span>";
        }
    
        toOriginalString()
        {
            return this.symbol;
        }

        getConfig()
        {
            return this.config;
        }
    },

    Operator: class {
        constructor(op)
        {
            this.operatorSymbol = op;
        }

        toString()
        {
            return this.operatorSymbol.toString();
        }

        getSymbolString()
        {
            return this.operatorSymbol.toOriginalString();
        }  

        toResult(v1, v2)
        {
            const o = this.getSymbolString()
            const singleOperator = (!v2) || (o == "identity")

            // these are Value _objects_
            const val = new PQ_BAMBOO.Nodes.Value();
            let a = v1.toResult().clone();
            let b = !singleOperator ? v2.toResult().clone() : new PQ_BAMBOO.Nodes.Value();

            const cfg = this.operatorSymbol.getConfig();
            if(cfg.disabled.includes("typeCoercion") && !singleOperator) 
            {
                if(a.getType() != b.getType())
                {
                    val.set("Invalid comparison between data types", "error");
                    return val;
                }
            }

            const errors = [];
            if(a.isError()) { errors.push(a); }
            if(b.isError()) { errors.push(b); }
            if(errors.length > 0)
            {
                val.set(errors, "error");
                return val;
            }

            const keywords = [];
            if(a.isKeyword()) { keywords.push(a); }
            if(b.isKeyword()) { keywords.push(b); }
            if(keywords.length > 0)
            {
                val.set(keywords, "keyword");
                return val
            }

            let valsA = [a];
            let valsB = [b];
            
            let aIsBag = (a instanceof PQ_BAMBOO.Nodes.Bag);
            let bIsBag = (b instanceof PQ_BAMBOO.Nodes.Bag);
            let keys = [];
            if(aIsBag) { valsA = a.getValuesRaw(); keys = a.getKeysRaw(); }
            if(bIsBag) { valsB = b.getValuesRaw(); keys = b.getKeysRaw(); }

            const arr = [];
            const scalar = (valsA.length == 1 || valsB.length == 1);
            const piecewise = (valsA.length == valsB.length) && !scalar;
            const matrix = (valsA.length != valsB.length) && !scalar;

            if(scalar || matrix)
            {
                for(let i = 0; i < valsA.length; i++)
                {
                    for(let j = 0; j < valsB.length; j++)
                    {
                        let tempVal = new PQ_BAMBOO.Nodes.Value();
                        PQ_BAMBOO.config.operators[o].toResult(valsA[i], valsB[j], tempVal);
                        arr.push(tempVal);
                    }
                }
            }

            if(piecewise)
            {
                const maxVals = Math.max(valsA.length, valsB.length);
                for(let i = 0; i < maxVals; i++)
                {
                    let tempVal = new PQ_BAMBOO.Nodes.Value();
                    PQ_BAMBOO.config.operators[o].toResult(valsA[i], valsB[i], tempVal);
                    arr.push(tempVal);
                }
            }

            if(arr.length == 1) { return arr[0]; }

            const obj = {};
            for(let i = 0; i < keys.length; i++)
            {
                obj[keys[i]] = arr[i];
            }

            const newBag = new PQ_BAMBOO.Nodes.Bag("unnamed");
            newBag.setContent(obj);
            return newBag;
        }

    },

    // @NOTE: "toResult" gives us the value itself, it doesn't call "toResult" on _that_
    // That's because this is a terminal node; there's nothing more to evaluate, we've reached the value we wanted
    Literal: class {
        constructor(value, o = "", c = "")
        {
            this.value = value;
            
            if(o != "")
            {
                this.delimOpen = new PQ_BAMBOO.Nodes.Delimiter(o, "open");
            }

            if(c != "")
            {
                this.delimClose = new PQ_BAMBOO.Nodes.Delimiter(o, "close");
            }
        }

        toString()
        {
            let str = "<span class='literal literal-" + this.value.getType() + "'>";
            if(this.delimOpen) { str += this.delimOpen.toString(); }
            str += this.value.toString();
            if(this.delimClose) { str += this.delimClose.toString(); }
            str += '</span>';
            return str;
        }

        toResult()
        {
            return this.value;
        }
    },

    BambooKeyword: class {
        constructor(l, k1, k2)
        {
            this.lexer = l;
            this.keyword1 = k1;
            this.keyword2 = k2;
        }

        toString()
        {
            return "<span class='bamboo-keyword'>"
                    + this.keyword1.toString()
                    + this.keyword2.toString()
                    + "</span>";
        }

        toResult()
        {
            const key = this.keyword2.toString();
            
            if(key == "random") { 
                return new PQ_BAMBOO.Nodes.Value(Math.random(), "number");
            }

            if(key == "time") {
                const newBag = new PQ_BAMBOO.Nodes.Bag("time");
                const date = new Date();
                const settings = { 
                    year: "getFullYear",
                    month: "getMonth",
                    day: "getDate",
                    hours: "getHours",
                    minutes: "getMinutes",
                    seconds: "getSeconds",
                    milliseconds: "getMilliseconds"
                };
                for(const [key,func] of Object.entries(settings))
                {
                    const val = new PQ_BAMBOO.Nodes.Value(date[func](), "number");
                    val.setLabel(key);
                    newBag.addValue(val);
                }

                return newBag;
            }
            
            const val = this.getBambooMemory(key);
            if(!val) { 
                return new PQ_BAMBOO.Nodes.Value("There's no **Bamboo** global with the name **" + key + "**", "error");
            }
            return val;
        }
        
        getBambooMemory(key)
        {
            return this.lexer.getBambooMemory(key);
        }
    },

    FactorKeyword: class {
        constructor(k, v)
        {
            this.keyword = k;
            this.value = v;
        }

        toString()
        {
            return "<span class='factor-keyword'>"
                    + this.keyword.toString()
                    + this.value.toString()
                    + "</span>"
        }

        toResult()
        {
            const op = PQ_BAMBOO.config.operators[this.keyword.toOriginalString()];
            let vals = [this.value.toResult()];
            const isBag = (vals[0] instanceof PQ_BAMBOO.Nodes.Bag);
            if(isBag) { vals = this.value.toResult().getValuesRaw(); }

            const arr = [];
            for(const elem of vals)
            {
                const newVal = new PQ_BAMBOO.Nodes.Value();
                op.toResult(elem.clone(), newVal)
                arr.push(newVal);
            }

            if(arr.length == 1) { return arr[0]; }

            const newBag = new PQ_BAMBOO.Nodes.Bag("unnamed");
            newBag.setContent(arr);
            return newBag;
        }
    },

    // @NOTE: this one retains its space around the value inside delimOpen/delimClose (if needed)
    Factor: class {
        constructor(o = "", v, c = "")
        {
            this.value = v;
            if(o) { this.delimOpen = new PQ_BAMBOO.Nodes.Delimiter(o, "open"); }
            if(c) { this.delimClose = new PQ_BAMBOO.Nodes.Delimiter(c, "close"); }
        }

        toString()
        {
            return "<span class='factor'>"
                    + (this.delimOpen ? this.delimOpen.toString() : "")
                    + this.value.toString()
                    + (this.delimClose ? this.delimClose.toString() : "")
                    + "</span>"
        }

        toResult()
        {
            return this.value.toResult();
        }
    },

    Term: class {
        constructor(f, op, t)
        {
            this.factor = f;
            if(!op) { op = new PQ_BAMBOO.Nodes.OperatorSymbol(); }
            this.operator = new PQ_BAMBOO.Nodes.Operator(op);
            if(t) { this.term = t; }
        }

        toString()
        {
            return "<span class='term'>" 
                    + this.factor.toString()
                    + ((this.operator && this.term) ? this.operator.toString() + this.term.toString() : "")
                    + "</span>"
        }

        toResult()
        {
            return this.operator.toResult(this.factor, this.term);
        }
    },

    Comment: class {
        constructor(symbol, v)
        {
            this.delim = new PQ_BAMBOO.Nodes.Delimiter(symbol, "comment");
            this.value = new PQ_BAMBOO.Nodes.Value(v, "comment");
        }

        toString()
        {
            return "<span class='comment'>"
                    + this.delim.toString()
                    + "<span class='comment-content'>" + this.value + "</span>"
                    + "</span>";
        }

        toResult()
        {
            return this.value;
        }
    },

    Expression: class {
        constructor(t,op,expr)
        {
            this.term = t;
            if(!op) { op = new PQ_BAMBOO.Nodes.OperatorSymbol(); }
            this.operator = new PQ_BAMBOO.Nodes.Operator(op);
            if(expr) { this.expression = expr; }
        }

        toString()
        {
            return "<span class='expression'>"
                    + this.term.toString()
                    + ((this.operator && this.expression) ? this.operator.toString() + this.expression.toString() : "")
                    + "</span>";
        }

        toResult()
        {
            return this.operator.toResult(this.term, this.expression);
        }
    },

    Conditional: class {
        // @ NOTE: k1 and v1 can be null; operator and v2 never are (e.g. "_ _ not Cond")
        constructor(k1,v1,op,v2)
        {
            this.keyword1 = k1;
            this.value1 = v1;
            this.operator = new PQ_BAMBOO.Nodes.Operator(op);
            this.value2 = v2;
        }

        toString()
        {
            return "<span class='conditional'>"
                    + (this.keyword1 ? this.keyword1.toString() : "")
                    + (this.value1 ? this.value1.toString() : "" )
                    + this.operator.toString()
                    + this.value2.toString()
                    + "</span>";
        }

        toResult()
        {
            if(!this.value1) { return this.operator.toResult(this.value2); }
            return this.operator.toResult(this.value1, this.value2);
        }
    },

    Assignment: class {
        constructor(k1,v1,k2,v2)
        {
            this.keyword1 = k1;
            this.value1 = v1;
            this.keyword2 = k2;
            this.value2 = v2;
        }

        toString()
        {
            return "<span class='assignment'>"
                    + this.keyword1.toString()
                    + this.value1.toString()
                    + (this.keyword2 ? this.keyword2.toString() : "")
                    + (this.value2 ? this.value2.toString() : "")
                    + "</span>";
        }

        toResult()
        {
            let val
            let key
            let result

            // "put EXPR into VAR"
            if(this.keyword1.is("put"))
            {
                val = this.value1.toResult();
                key = this.value2.toOriginalString();
                this.value2.getMemory().set(key, val);
                result = val;
            }

            // "now VAR means EXPR" (reversed order)
            else if(this.keyword1.is("now"))
            {
                key = this.value1.toOriginalString();
                val = this.value2.toResult();
                this.value1.getMemory().set(key, val);
                result = val;
            }
            
            // "change VAR by EXPR" (reversed order)
            else if(this.keyword1.is("change")) { 
                key = this.value1.toOriginalString();
                val = this.value2.toResult();

                let valObj = this.value1.getMemory().get(key);
                if(valObj.type != "error") { valObj.update(val); }
                result = valObj;
            }

            // "delete VAR"
            else if(this.keyword1.is("delete")) {
                key = this.value1.toOriginalString();
                let memory = this.value1.getMemory();
                result = memory.delete(key);
            }

            return result;
        }
    },

    LogStatement: class {
        constructor(k,v)
        {
            this.keyword = k;
            this.value = v;
        }

        toString()
        {
            return "<span class='log-statement'>"
                    + this.keyword.toString()
                    + this.value.toString()
                    + "</span>"
        }

        toResult()
        {
            const valueObject = this.value.toResult();
            const newValue = new PQ_BAMBOO.Nodes.Value(valueObject.toLogString(), "log");
            console.log(newValue); //@KEEP (supposed to console.log, it's the log statement)
            return newValue;
        }
    },

    IfStatement: class {
        constructor(k,c)
        {
            this.keyword = k;
            this.conditional = c;
        }

        toString()
        {
            return "<span class='if-statement'>"
                    + this.keyword.toString()
                    + this.conditional.toString()
                    + "</span>"
        }

        toResult()
        {
            return this.conditional.toResult();   
        }

        isTrue()
        {
            return this.toResult().isTrue();
        }
    },

    BagStatement: class {
        constructor(k1, v, k2)
        {
            this.keyword1 = k1
            this.name = v;
            this.keyword2 = k2;
        }

        toString()
        {
            return "<span class='bag-statement'>"
                    + this.keyword1.toString()
                    + this.name.toString()
                    + this.keyword2.toString()
                    + "</span>"
        }

        toResult()
        {
            return new PQ_BAMBOO.Nodes.Value("Creation of a new bag: " + this.toOriginalString(), "parser");
        }

        getBagName()
        {
            return this.name.toOriginalString();
        }
    },

    BagPush: class {
        constructor(l,k1,v,k2,b)
        {
            this.lexer = l;
            this.keyword1 = k1;
            this.value = v;
            this.keyword2 = k2;
            this.bagName = b;
        }

        toString()
        {
            return "<span class='bag-push'>"
                    + this.keyword1.toString()
                    + this.value.toString()
                    + this.keyword2.toString()
                    + this.bagName.toString()
                    + "</span>";
        }

        toResult()
        {
            const bagObject = this.lexer.getMemory().get(this.bagName.toOriginalString());
            const valueRaw = this.value.toResult();
            return bagObject.push(valueRaw);
        }
    },

    BagPop: class {
        constructor(l,k1,key,k2,k3,b)
        {
            this.lexer = l;
            this.keyword1 = k1;
            this.key = key; // this is optional, only for named bags
            this.keyword2 = k2;
            this.keyword3 = k3;
            this.bagName = b;
        }

        toString()
        {
            return "<span class='bag-push'>"
                    + this.keyword1.toString()
                    + (this.key ? this.key.toString() : "")
                    + this.keyword2.toString()
                    + this.keyword3.toString()
                    + this.bagName.toString()
                    + "</span>";
        }

        // @IMPROV: now I often do a manual check if something is a variable and then call "toKey()"
        // Is there _some way_ to integrate this with everything, so I can just call "toKey" on anything?
        toResult()
        {
            const bagObject = this.lexer.getMemory().get(this.bagName.toOriginalString());
            if(this.key) { 
                const isVariable = (this.key instanceof PQ_BAMBOO.Nodes.Variable);
                let keyResult = "";
                if(isVariable) { keyResult = this.key.toKey(); }
                else { keyResult = this.key.toResult().toOriginalString(); }
                return bagObject.removeValueByKey(keyResult); 
            }
            return bagObject.pop();
        }
    },
    
    StringSlice: class {
        constructor(k1,c1,k2,c2,k3,c3)
        {
            this.keyword1 = k1;
            this.value1 = c1;
            this.keyword2 = k2;
            this.value2 = c2;
            this.keyword3 = k3;
            this.value3 = c3;
        }

        toString()
        {
            return "<span class='slice-statement'>"
                    + this.keyword1.toString()
                    + this.value1.toString()
                    + this.keyword2.toString()
                    + this.value2.toString()
                    + this.keyword3.toString()
                    + this.value3.toString()
                    + "</span>";
        }

        toResult()
        {
            const oldText = this.value3.toResult().clone();
            const startIndex = this.value1.toResult();
            const endIndex = this.value2.toResult().clone();

            PQ_BAMBOO.TypeCoercer.toString(oldText);
            PQ_BAMBOO.TypeCoercer.toNumber(startIndex);
            PQ_BAMBOO.TypeCoercer.toNumber(endIndex);

            const newText = oldText.toResult().slice(startIndex.toResult(), endIndex.toResult());
            return new PQ_BAMBOO.Nodes.Value(newText, "string");
        }
    },
    
    StringReplace: class {
        constructor(k1,c1,k2,c2,k3,c3)
        {
            this.keyword1 = k1;
            this.value1 = c1;
            this.keyword2 = k2;
            this.value2 = c2;
            this.keyword3 = k3;
            this.value3 = c3;
        }

        toString()
        {
            return "<span class='replace-statement'>"
                    + this.keyword1.toString()
                    + this.value1.toString()
                    + this.keyword2.toString()
                    + this.value2.toString()
                    + this.keyword3.toString()
                    + this.value3.toString()
                    + "</span>";
        }

        toResult()
        {
            const oldText = this.value3.toResult().clone();
            const search = this.value1.toResult().clone();
            const replace = this.value2.toResult().clone();

            PQ_BAMBOO.TypeCoercer.toString(oldText);
            PQ_BAMBOO.TypeCoercer.toString(search);
            PQ_BAMBOO.TypeCoercer.toString(replace);
            
            const newText = oldText.toResult().replaceAll(search.toResult(), replace.toResult());
            return new PQ_BAMBOO.Nodes.Value(newText, "string");
        }
    },

    LoopStatement: class {
        constructor(k1,v,k2)
        {
            this.keyword1 = k1;
            if(v) { this.value = v };
            if(k2) { this.keyword2 = k2 };
        }

        toString()
        {
            return "<span class='loop-statement'>"
                    + this.keyword1.toString()
                    + (this.value ? this.value.toString() : "")
                    + (this.keyword2 ? this.keyword2.toString() : "")
                    + "</span>";
        }

        toResult()
        {
            return new PQ_BAMBOO.Nodes.Value(this.keyword1, "keyword");
        }

        getLoopCount()
        {
            if(!this.value) { return PQ_BAMBOO.config.maxLoopCount; }
            return this.value.toResult().toResult();
        }
    },

    SearchStatement: class {
        constructor(k,b)
        {
            this.keyword = k;
            this.bag = b;
        }

        toString()
        {
            return "<span class='search-statement'>"
                    + this.keyword.toString()
                    + this.bag.toString()
                    + "</span>";
        }

        isInvalid()
        {
            return !(this.bag.toResult() instanceof PQ_BAMBOO.Nodes.Bag);
        }

        toResult()
        {
            return new PQ_BAMBOO.Nodes.Value(this.keyword, "keyword");
        }

        getLoopCount()
        {
            if(this.isInvalid()) { return 0; }
            const sizeObject = this.bag.toResult().getSize();
            return sizeObject.toResult();
        }

        getLoopValues()
        {
            if(this.isInvalid()) { return []; }
            return this.bag.toResult().getValuesRaw();
        }
    },

    ParamList: class {
        constructor(v1, rest)
        {
            if(!v1) { this.list = []; return; }

            this.list = [v1];
            if(rest) { this.list = this.list.concat(rest.flat()); } // parameters should already be in a flat list, but just to be sure
        }

        toString()
        {
            let str = "<span class='function-parameters'>";
            for(const elem of this.list)
            {
                str += elem.toString();
            }
            str += "</span>";
            return str;
        }

        toResult()
        {
            // ??
        }

        getParamsAsList(byName = true)
        {
            const arr = [];
            for(const elem of this.list)
            {
                if(elem instanceof PQ_BAMBOO.Nodes.Keyword) { continue; }
                if(byName) { arr.push(elem.toOriginalString()); }
                else { arr.push(elem.toResult()); }
            }
            return arr;
        }
    },

    FunctionStatement: class {
        constructor(k1,n,k2,p)
        {
            this.keyword1 = k1;
            this.name = n;
            this.keyword2 = k2;
            this.params = p;
        }

        toString()
        {
            return "<span class='function-statement'>"
                    + this.keyword1.toString()
                    + this.name.toString()
                    + (this.keyword2 ? this.keyword2.toString() : "")
                    + (this.params ? this.params.toString() : "")
                    + "</span>"
        }

        // @IMPROV: make this a reference to the actual, live function?
        toResult()
        {
            return new PQ_BAMBOO.Nodes.Value(this.getFunctionName(), "function");
        }

        getFunctionName()
        {
            return this.name.toOriginalString();
        }

        getParamsAsList()
        {
            if(!this.params) { return []; }
            return this.params.getParamsAsList();
        }
    },

    Function: class {
        constructor(n, b, m)
        {
            this.name = n;
            this.block = b;
            this.memory = m;
        }

        call(paramsList)
        {
            const functionStatement = this.block.header.getDefinition();
            const paramNames = functionStatement.getParamsAsList(true);
            const paramValues = paramsList.getParamsAsList(false);

            const certainValues = Math.min(paramNames.length, paramValues.length);

            for(let i = 0; i < certainValues; i++)
            {
                const key = paramNames[i];
                const val = paramValues[i];
                this.memory[key] = val;
            }
            return this.block.toResult(true);
        }
    },

    BagName: class {
        constructor(v)
        {
            this.value = v;
        }

        toString()
        {
            return "<span class='bag-name'>" + this.toOriginalString() + "</span>";
        }

        toOriginalString()
        {
            return this.value;
        }

        toResult()
        {
            // ??
        }
    },

    FunctionName: class {
        constructor(v)
        {
            this.value = v;
        }

        toString()
        {
            return "<span class='function-name'>" + this.toOriginalString() + "</span>";
        }

        toOriginalString()
        {
            return this.value.toString();
        }

        toResult()
        {
            // ??
        }
    },

    FunctionCall: class {
        constructor(l,k1,v,k2,n)
        {
            this.lexer = l;
            this.keyword1 = k1;
            this.keyword2 = k2;

            if(k1 && k2) {
                this.name = n;
                this.paramsList = v;
            } else if(!k2) {
                this.name = v;
                this.paramsList = null;
            }
        }

        toString()
        {
            return "<span class='function-call'>"
                    + this.keyword1.toString()
                    + (this.paramsList ? this.paramsList.toString() : "")
                    + (this.keyword2 ? this.keyword2.toString() : "")
                    + this.name.toString()
                    + "</span>";
        }

        toResult()
        {
            const functionName = this.name.toOriginalString();
            const functionNode = this.getMemory().get(functionName);
            if(!(functionNode instanceof PQ_BAMBOO.Nodes.Function)) { return functionNode; }
            return functionNode.call(this.getParamsList());
        }

        getParamsList()
        {
            if(!this.paramsList) { return new PQ_BAMBOO.Nodes.ParamList(); }
            return this.paramsList;
        }

        getMemory()
        {
            return this.lexer.memory;
        }
    },

    FunctionParameter: class {
        constructor(v)
        {
            this.value = v;
        }

        toString()
        {
            return "<span class='function-parameter'>" + this.value.toString() + "</span>";
        }

        toResult()
        {
            // ??
        }

        toOriginalString()
        {
            return this.value.toString();
        }
    },

    Keyword: class {
        constructor(s1,v,s2)
        {
            this.space1 = new PQ_BAMBOO.Nodes.Delimiter(s1, "space");
            this.value = v;
            this.space2 = new PQ_BAMBOO.Nodes.Delimiter(s2, "space");
        }

        toString()
        {
            return "<span class='keyword'>"
                    + this.space1.toString()
                    + this.value.toString()
                    + this.space2.toString()
                    + "</span>"
        }

        toResult()
        {
            return new PQ_BAMBOO.Nodes.Value(this.value, "keyword");
        }

        toOriginalString()
        {
            return this.value;
        }

        is(v)
        {
            return this.value == v;
        }
    },

    Variable: class {
        constructor(l, v)
        {
            this.lexer = l;
            this.value = v;
        }

        toString()
        {
            return "<span class='variable'>" + this.value.toString() + "</span>";
        }

        toResult()
        {
            return this.getMemory().get(this.value);
        }

        existsInMemory()
        {
            return this.getMemory().has(this.value);
        }

        isReservedKeyword()
        {
            return ["size", "labels", "items"].includes(this.toOriginalString());
        }

        toKey()
        {
            if(this.isReservedKeyword()) { return this.toOriginalString(); }
            if(this.existsInMemory()) { return this.toResult().toResult(); }
            return this.toOriginalString();
        }

        getLabel(key)
        {
            const val = this.toResult();
            const isBag = (val instanceof PQ_BAMBOO.Nodes.Bag);

            const originalKey = key;
            const keyIsObject = (key instanceof PQ_BAMBOO.Nodes.Value);
            if(keyIsObject) { key = key.toOriginalString(); }

            // default keywords
            if(key == "size") { 
                return val.getSize();
            } else if(key == "labels") {
                return val.getLabels();
            } else if(key == "items") {
                return val.getItems();
            }

            // otherwise just ask the bag to search for the key
            if(isBag) { return val.getValue(key); }
            
            // strings can be indexed by number (num => which character) or string (string => which index)
            const isString = val.getType() == "string";
            if(isString)
            {
                const stringIndex = key;
                if(keyIsObject && originalKey.getType() == "number") { stringIndex = originalKey.toResult(); }

                const indexStringByNumber = isNaN(stringIndex);
                const indexStringByCharacter = !indexStringByNumber;
                if(indexStringByNumber) { 
                    const returnVal = val.toResult().indexOf(stringIndex); 
                    return new PQ_BAMBOO.Nodes.Value(returnVal, "number");
                }

                if(indexStringByCharacter) { 
                    const returnVal = val.toResult().at(stringIndex)
                    return new PQ_BAMBOO.Nodes.Value(returnVal, "string"); 
                }
            }

            // if we have a basic indexable object behind us, use that
            const canIndex = Array.isArray(key) || (typeof key === 'object');
            if(canIndex) { return val[key]; }

            // otherwise, we can't access and should error
            return new PQ_BAMBOO.Nodes.Value("Can't access **" + key + "** on **" + this.toOriginalString() + "**", "error"); 
        }

        toOriginalString()
        {
            return this.value;
        }

        getMemory()
        {
            return this.lexer.memory;
        }
    },

    VariableIndexed: class {
        constructor(v,p,l)
        {
            this.variable = v;
            this.delimiter = p;
            this.label = l;
        }

        toString()
        {
            return "<span class='variable-indexed'>"
                    + this.variable.toString()
                    + this.delimiter.toString()
                    + this.label.toString()
                    + "</span>";
        }

        toResult()
        {
            const key = this.label.toKey();
            return this.variable.getLabel(key);
        }
    },

    Label: class {
        constructor(v)
        {
            this.value = v;
        }

        toString()
        {
            return "<span class='label'>" + this.value.toString() + "</span>";
        }

        toKey()
        {
            console.log("VALUE BEFORE");
            console.log(this.value);

            let val = this.value;

            // if it's a variable, try to grab its value as a key
            const isVariable = (val instanceof PQ_BAMBOO.Nodes.Variable);
            if(isVariable) { 
                let keyVal = val.toKey();
                if(keyVal) { return keyVal; }
            }

            // if it's not a value, it must be a container of a value, so grab inside it
            const isValue = (val instanceof PQ_BAMBOO.Nodes.Value);
            if(!isValue) { val = val.toResult(); }

            console.log("VALUEUUE");
            console.log(val);

            // val should now be a Value object, which we can call to get the original string
            return val.toResult();
        }
    },

    Statement: class {
        constructor(v)
        {
            this.spaceBefore = 0;
            this.spaceAfter = 0;
            this.value = v;
        }

        toString()
        {
            let s1 = new Array(this.spaceBefore);
            let s2 = new Array(this.spaceAfter);
            s1 = s1.fill(" ").join("");
            s2 = s2.fill(" ").join("");

            if(this.spaceBefore == 0) { s1 = ""; }
            if(this.spaceAfter == 0) { s2 = ""; }

            return "<span class='single-line-container'><span class='single-line'>"
                    + "<span class='line-number'>" + this.lineNumber + "</span>"
                    + "<span class='statement'>"
                    + s1 
                    + this.value.toString() 
                    + s2
                    + "</span>"
                    + "</span></span>";
        }

        toResult()
        {
            return this.value.toResult();
        }

        setSpaceBefore(s)
        {
            this.spaceBefore = s;
        }

        setSpaceAfter(s)
        {
            this.spaceAfter = s;
        }

        getSpaceBefore()
        {
            return this.spaceBefore;
        }

        getDefinition()
        {
            return this.value
        }

        isDefinition(classInstance)
        {
            return this.value instanceof classInstance;
        }

        setLineNumber(ln)
        {
            this.lineNumber = ln;
        }

        getLineNumber()
        {
            return this.lineNumber;
        }
    },

    Block: class {
        constructor(lexer)
        {
            this.lexer = lexer;
            this.content = []; // a list of statements or blocks (mixed)
            this.header = null;
            this.parent = null;
            this.feedback = [];
            this.memory = {};
        }

        getLexer()
        {
            return this.lexer;
        }

        addBlock(b)
        {
            this.content.push(b);
        }

        addStatement(s)
        {
            this.content.push(s);
        }

        getParentBlock()
        {
            return this.parent;
        }

        setParentBlock(b)
        {
            b.addBlock(this)
            this.parent = b;
        }

        setHeader(h)
        {
            this.header = h;
        }

        toString()
        {
            let arr = [];

            if(this.header)
            {
                arr.push(this.header.toString());
            }

            for(const cont of this.content)
            {
                arr.push(cont.toString());
            }

            return "<span class='block'>" + arr.join("\n") + "</span>";
        }

        toResult(onlyBody = false)
        {
            this.feedback = [];
            this.parentMemory = this.lexer.memory.getLastContext();

            const header = this.toHeaderResult(onlyBody);

            if(header.result.type != "nothing") 
            { 
                const headerLineNum = this.header.getLineNumber();
                this.feedback.push(header.result.print(headerLineNum));
            }

            // if we don't execute our body, return our header and stop
            if(!header.execute) 
            { 
                this.bubbleUpFeedback();
                return header.result; 
            }

            if(header.newContext) { this.lexer.memory.pushContext(this, this.memory); }

            const contentStripped = [];
            for(const cont of this.content)
            {
                const isEmptyLine = (cont instanceof PQ_BAMBOO.Nodes.EmptyLine);
                if(isEmptyLine) { continue; }
                contentStripped.push(cont);
            }

            // If we handle a _statement_, we'll get a single result that nobody else has handled yet
            // So we print those into feedback, and hand this to our parent at the end
            // (Block nodes will already have handled their own statements and thus given their feedback)

            let loopCounter = 0;
            let loopValues = header.loopValues;
            let lastResult = new PQ_BAMBOO.Nodes.Value();
            let allResults = header.bag || new PQ_BAMBOO.Nodes.Bag();

            while(true) {
                let stopLooping = !header.loop;

                const iterator = new PQ_BAMBOO.Nodes.Value(loopCounter, "number");
                this.lexer.setBambooMemory("iterator", iterator);

                let val = new PQ_BAMBOO.Nodes.Value("No loop value (possibly not looping over a bag?)", "error");
                if(loopCounter < loopValues.length) { val = loopValues[loopCounter] }
                this.lexer.setBambooMemory("value", val);
                
                for(const cont of contentStripped)
                {
                    const res = cont.toResult();

                    const isBlock = cont instanceof PQ_BAMBOO.Nodes.Block;
                    if(!isBlock) { 
                        const lineNumber = cont.getLineNumber();
                        this.feedback.push(res.print(lineNumber)); 
                    }

                    const keyword = res.getKeyword();
                    const listenToKeyword = header.keywords.includes(keyword);

                    if(listenToKeyword && (res.isKeyword("output") || res.isKeyword("unplug"))) { stopLooping = true; break; }

                    lastResult = res;
                    allResults.addValue(res);

                    if(listenToKeyword && res.isKeyword("skip")) { break; }
                    if(listenToKeyword && res.isKeyword("stop")) { stopLooping = true; break; }
                }

                loopCounter += 1;
                stopLooping = stopLooping || (loopCounter >= header.loopCount) || (loopCounter >= PQ_BAMBOO.config.maxLoopCount);
                if(stopLooping) { break; }
            }

            this.bubbleUpFeedback();
            this.toHeaderCleanup(header);

            return lastResult;
        }

        bubbleUpFeedback()
        {
            const topLevelBlock = !this.parent;
            if(topLevelBlock) { return; }
            this.parent.addFeedback(this.feedback);
        }

        addFeedback(extraFeedback)
        {
            this.feedback = this.feedback.concat(extraFeedback);
        }

        getFeedback()
        {
            return this.feedback;
        }

        toHeaderCleanup(header)
        {
            if(header.newContext) { this.lexer.memory.popContext(); }
        }

        toHeaderResult(onlyBody = false)
        {
            const obj = { 
                execute: true, 
                loop: false, 
                loopCount: 1, 
                loopValues: [],
                newContext: false, 
                bag: null,
                keywords: [],
                result: new PQ_BAMBOO.Nodes.Value()
            };

            if(!this.header) { return obj; }

            const ifStatement = this.header.isDefinition(PQ_BAMBOO.Nodes.IfStatement);
            const loopStatement = this.header.isDefinition(PQ_BAMBOO.Nodes.LoopStatement);
            const searchStatement = this.header.isDefinition(PQ_BAMBOO.Nodes.SearchStatement);
            const bagStatement = this.header.isDefinition(PQ_BAMBOO.Nodes.BagStatement);
            const functionStatement = this.header.isDefinition(PQ_BAMBOO.Nodes.FunctionStatement);
            
            // @NOTE: need to set keywords here, because function header isn't executed when function executed
            // @IMPROV: find a cleaner way to do this (than the `onlyBody` param and exceptions)
            if(functionStatement) { obj.keywords = ["unplug", "output"]; }

            // any subtype of statement creates a new memory context,
            // even if they only execute their body
            obj.newContext = true;
            if(onlyBody) { return obj; }

            if(ifStatement)
            {
                obj.execute = this.header.getDefinition().isTrue();
                if(!obj.execute) { obj.result.set("If statement false; skipped", "parser") }
                return obj;
            }

            if(loopStatement)
            {
                obj.loopCount = this.header.getDefinition().getLoopCount();
                obj.loop = (obj.loopCount > 0);
                obj.keywords = ["stop", "skip"];
                obj.result.set("Loop statement (" + obj.loopCount + " times)", "parser")
                return obj;
            }

            if(searchStatement)
            {
                obj.loopCount = this.header.getDefinition().getLoopCount();
                obj.loop = (obj.loopCount > 0);
                obj.loopValues = this.header.getDefinition().getLoopValues();
                obj.keywords = ["stop", "skip"];
                obj.result.set("Loop statement (through bag)", "parser");
                return obj;
            }

            if(bagStatement)
            {
                const name = this.header.getDefinition().getBagName();
                const bagNode = new PQ_BAMBOO.Nodes.Bag(name, this.memory);
                this.parentMemory.set(name, bagNode);
                obj.result.set("Bag defined", "parser");
                obj.bag = bagNode;
                return obj;
            }

            if(functionStatement)
            {
                const name = this.header.getDefinition().getFunctionName();
                const functionNode = new PQ_BAMBOO.Nodes.Function(name, this, this.memory);
                this.parentMemory.set(name, functionNode);
                obj.execute = false;
                obj.result.set("Machine defined with name " + name, "parser");
                return obj;
            }

            return obj;
        }

        containsKeyword(value, type = "stop")
        {
            return (value.toResult() == type);
        }
    },

    Code: class {
        constructor(b)
        {
            this.blocks = b;
        }

        toString()
        {
            let str = "<span class='code'>";
            for(const block of this.blocks)
            {
                str += block.toString();
            }
            str += "</span>";
            return str;
        }

        toResult()
        {
            let results = [];
            for(const block of this.blocks)
            {
                results = results.concat(block.toResult());
            }
            return results;
        }
    }
}