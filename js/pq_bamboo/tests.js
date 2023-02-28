PQ_BAMBOO.Tests = {
    runningAll: false,
    profile: false,
    time: true,
    reportResults: false,
    onlyParse: false,

    runAll()
    {
        if(this.runningAll) { return; }

        const keys = Object.keys(this.tests);
        this.runningAll = true;
        this.run(...keys);
        this.runningAll = false;
    },

    run(...list)
    {
        const totalStart = Date.now();

        for(const key of list)
        {
            console.log("== Running Test (" + key + ") ==");

            if(this.profile) { console.profile(); }

            const start = Date.now();
            const func = this.tests[key].bind(this)
            func();
            const end = Date.now();
            
            if(this.profile) { console.profileEnd(); }
            if(this.time) { console.log("> Time: " + (end - start) + " ms"); }

            console.log("== End ==");
        }

        const totalEnd = Date.now();
        if(this.time) { console.log("> Total Time: " + (totalEnd - totalStart) + " ms"); }
    },

    // returns false if
    //  - the result is [] (parse failed)
    //  - the parsed result isn't correct (equal to out1, if set)
    //  - the unconsumed string isn't correct (equal to out2, default "" = full parse)
    true(f, inp = "", out1 = null, out2 = null)
    {
        const res = f(inp);
        if(this.reportResults) { console.log(res); }
        if(this.onlyParse) { return true; }
        return res.length > 0 && ((res[0] == out1) || (out1 == null)) && ((res[1] == out2) || (out2 == null))
    },

    trueInstance(f, inp = "", type, out = null)
    {
        const res = f(inp);
        if(this.reportResults) { console.log(res); }
        if(this.onlyParse) { return true; }
        return res.length > 0 && (res[0] instanceof type) && ((res[1] == out) || (out == null))
    },

    toResult(f, string, expVal)
    {
        const res = f(string);
        if(!res) { return null; }
        if(this.onlyParse) { return true; }

        const resVal = res[0].toResult();
        if(this.reportResults) { console.log(resVal); }
        return resVal.toResult() == expVal;
    },

    tests: {

        //
        // Literals & Values
        //
        bools()
        {
            const a = console.assert;
            const p = PQ_BAMBOO.PARSER;
            const t = this.true.bind(this);
            const f = p.bool;

            a(t(f, "true"));
            a(t(f, "false"));
            a(!t(f, "tru"));
            a(t(f, "true that", undefined, " that"));
        },

        numbers()
        {
            const p = PQ_BAMBOO.PARSER;
            const a = console.assert;
            const t = this.true.bind(this);
            const f = p.number;
    
            a(t(f, "321"));
            a(t(f,"3.2"));
            a(t(f,"0.321"));
            a(t(f,"0.0321"));
            a(t(f,"-3"));
            a(t(f,"+3"));
            a(t(f,"-3.2"));
            a(t(f,"+3.2"));
    
            a(!t(f,"text"));
            a(!t(f,"true"));
            a(t(f,"3 3", null, " 3"));
            a(t(f,"2-2", null, "-2"));
        },
    
        strings()
        {
            const p = PQ_BAMBOO.PARSER;
            const a = console.assert;
            const t = this.true.bind(this);

            // basic character checker
            let f = p.char("c");
            a(t(f,"cat","c")); 
            a(!t(f,"dog"));

            f = p.chars("cat");
            a(t(f,"cataco", "cat"));
            a(!t(f,"cadog"));
            a(!t(f,"ca"));

            // inverted
            f = p.charnot("c");
            a(!t(f, "cat"));
            a(t(f, "dog", "d"));
            a(!t(f, "cataco"));

            // pick any from list of choices 
            f = p.charchoice("cat");
            a(t(f, "ahoy", "a"));
            a(!t(f, "dog"));

            f = p.charchoicelist(["w", "a", "t"]);
            a(t(f, "willow", "w"));
            f = p.charchoicelist(["cat", "dog", "well"]);
            a(t(f, "apple", "a"));
            
            // pick from a range
            f = p.range("a", "z")
            a(t(f, "d"));
            f = p.range("3", "9");
            a(!t(f, "2"));

            // characters allowed in variable names
            f = p.varchar(false);
            a(t(f, "h"));
            a(!t(f, "-"));

            f = p.varchars;
            a(t(f, "hello"));
            a(!t(f, " hello"));
            a(!t(f, "he llo", "hello"));

            // characters allowed in strings
            f = p.stringchar;
            a(t(f, "h"));
            a(!t(f, '"'));

            f = p.stringchars;
            a(t(f, "hekl9063289j-=."));
            a(!t(f, 'hel"lo', 'hel"lo'));

            // finding exact keywords
            f = p.charsexact("true");

            a(t(f, "true"));
            a(!t(f, "truela"));

            f = p.charsexact("use");
            a(!t(f, "users"));
        },

        variables() 
        {
            const p = PQ_BAMBOO.PARSER;
            const a = console.assert;
            let t = this.trueInstance.bind(this);
            const n = PQ_BAMBOO.Nodes;

            let f = p.variable;
            a(t(f, "khelkh", n.Variable));
            a(!t(f, "true", n.Variable));
            a(t(f, "kle a", n.Variable, " a"));

            f = p.literal;
            a(t(f, "true", n.Literal));
            a(t(f, "false", n.Literal));
            a(t(f, '"hehek"', n.Literal)); // string
            a(t(f, "3.6309", n.Literal));

            t = this.true.bind(this);
            f = p.iskeyword;
            a(t(f, "true"));
        },

        //
        // Arithmetic
        //
        arithmetic_plus_min()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.statement;
            const r = this.toResult.bind(this);
            const a = console.assert;

            a(r(s, "5+5", "10"));
            a(r(s, "5 + 10", "15"));
            a(r(s, "-5 + 10", "5"));
            a(r(s, "5-5", "0"));
            a(r(s, "5-10", "-5"));
            a(r(s, "5+-10", "-5"));
        },

        arithmetic_mult_div()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.statement;
            const r = this.toResult.bind(this);
            const a = console.assert;

            a(r(s, "5*5", "25"));
            a(r(s, "5 * 10", "50"));
            a(r(s, "-5 * 10", "-50"));
            a(r(s, "5/5", "1"));
            a(r(s, "5/10", "0.5"));

            // it's 5/5/5 = (5/5)/5 = 1/5, right?
            // @TODO: fix this ordering
            a(r(s, "5/5/5", "5")); 

            a(r(s, "5 mod 2", "1"));
            a(r(s, "2.5 mod 1.5", "1"));
            a(r(s, "-5 mod -3", "-2"));
        },

        artihmetic_exp()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.statement;
            const r = this.toResult.bind(this);
            const a = console.assert;

            a(r(s, "2^2", "4"));
            a(r(s, "0.5^3", "0.125"));
            a(r(s, "5^2+3", "28")); // precedence
        },

        arithmetic_factor()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.statement;
            const r = this.toResult.bind(this);
            const a = console.assert;

            a(r(s, "(2+3)^2", "25"));
            a(r(s, "(2+3)/(2+3)", "1"));
            a(r(s, "(2-1/2)^(2-1)", "1.5"));
        },

        //
        // Conditionals
        //
        conditionals()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.conditional;
            const ti = this.trueInstance.bind(this);
            const r = this.toResult.bind(this);
            const a = console.assert;
            const n = PQ_BAMBOO.Nodes;

            a(ti(s, "5 is 5", n.Conditional));
            a(ti(s, "both true and true", n.Conditional));
            a(ti(s, "either true or false", n.Conditional));
            a(ti(s, "not true", n.Conditional));

            a(r(s, "5 is 5", true));
            a(r(s, "both true and true", true));
            a(r(s, "both true and false", false));
            a(r(s, "either true or false", true));
        },

        //
        // Functions
        //
        functions()
        {
            const p = PQ_BAMBOO.PARSER;
            const s = p.statement;
            let t = this.true.bind(this);
            if(this.onlyParse) { t = (val) => { return val } }

            // definition and call without params
            let txt = "machine A\n say 0\nuse A";
            t(s, txt);

            // definition with one param
            txt = "machine A wants a\n a*a"
            t(s, txt);

            // definition + call with one param
            txt += "\ngive 5 to A";
            t(s, txt);

            // definition + call with 2 params
            txt = "machine A wants a and b\n a*b\ngive 1 and 2 to A";
            t(s, txt);

            // call through bracketed expression
            txt = "machine A wants a\n a*a\ngive (1+2) to A";
            t(s, txt);
        },


        statements()
        {
            const p = PQ_BAMBOO.PARSER
            const a = console.assert;
            const ti = this.trueInstance.bind(this);
            const ok = p.oneKeywordStatements;
            const mk = p.multiKeywordStatements;
            const s = p.statement;
            const n = PQ_BAMBOO.Nodes;
            
            a(ti(ok, "stop", n.Keyword));
            a(ti(ok, "output", n.Keyword));
            a(ti(ok, "unplug", n.Keyword));
            a(ti(ok, "skip", n.Keyword));

            a(ti(mk, "> Comment", n.Comment));
            a(ti(mk, "say ho", n.LogStatement));
            a(ti(mk, "if 5 is 5", n.IfStatement));

            a(ti(mk, "repeat 5 times", n.LoopStatement));
            a(ti(mk, "machine A wants b", n.FunctionStatement));
            a(ti(mk, "put 5 into VAR", n.Assignment));

            const loopStatementFull = 'repeat 5 times \n say "WHAT"';
            a(ti(s, loopStatementFull, n.Statement));
        }



    }
    
}