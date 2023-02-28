/*

"LEXICAL GRAMMAR" (kind of)

Code ::= Block
Block ::= [Block | Statement]*
Statement ::= [
    EmptyLine |
    Comment | 
    IfStatement |
    LogStatement |
    LoopStatement |
    StopStatement |
    FunctionStatement |
    Assignment |
    Expr 
] LineTerminator

Assignment ::= `put` Cond `into` Variable | `change` Variable `by` Cond
IfStatement ::= `if` Cond
LogStatement ::= `say` Cond
LoopStatement ::= `repeat` [Expr `times` | nothing]
StopStatement ::= `stop`
FunctionStatement ::= `machine` FunctionName `wants` ParamsList
Comment ::= `>` stringchars
EmptyLine ::= [emptychars]*


Cond ::= not Cond | Expr [is Cond | or Cond | and Cond | nothing ]
Expr ::= Term [`+` Expr | `-` Expr]
Term ::= Factor [`^` Term | `*` Term | `/` Term]
Factor ::= `(` Cond `)` | Keyword Cond | Variable | FunctionCall | Literal

Literal ::= [symbolOpen] Value [symbolClose]
FunctionCall ::= `give` ParamsList `to` FunctionName
ParamsList ::= FunctionParam [`and` FunctionParam]*
FunctionName ::= FunctionParam ::= (functionchars)*
Variable ::= (varchars)*

Value ::= Bool | Number | String | nothing => saved as (value, type)
Bool ::= `true` | `false`
String ::= `"` [stringchars]* `"`
Number ::= [integer] [`.` integer]

LineTerminator ::= "\n" | EndOfFile

*/

PQ_BAMBOO.Lexer = class {
    constructor(cfg)
    {
        this.config = cfg;
        this.memory = new PQ_BAMBOO.Nodes.Memory(cfg);
        this.memoryGlobal = this.memory.pushContext();
        this.memoryGlobal["bamboo"] = {};
    }

    getBambooMemory(key)
    {
        return this.memoryGlobal["bamboo"][key];
    }

    setBambooMemory(key, value)
    {
        this.memoryGlobal["bamboo"][key] = value;
    }

    getMemory()
    {
        return this.memory;
    }

    isInvalid(res)
    {
        return !(res instanceof PQ_BAMBOO.Nodes.Block);
    }

    isEmptyLine(text)
    {
        const textNoSpaces = text.replace(/\s/g, '');
        return textNoSpaces.length <= 0;
    }

    parse(text)
    {
        const res = this.parseCode(text);
        if(this.isInvalid(res)) { return null; }
        return res;
    }

    parseCode(text)
    {

        // @OPTIMIZATION: we know the code won't be correct, so stop
        // @TODO: do give a helpful error message, though
        const numOpenDelimiters = text.length - text.replaceAll("(", "").length;
        const numClosingDelimiters = text.length - text.replaceAll(")", "").length;
        if(numOpenDelimiters != numClosingDelimiters) { return null; }
        
        const textSplit = text.split(/[\n]/);
        const p = PQ_BAMBOO.PARSER;
        p.setLexer(this);

        const statements = [];
        let invalid = false;
        let lineNumber = 0;
        for(let txt of textSplit)
        {
            lineNumber += 1;
            if(this.isEmptyLine(txt)) { 
                statements.push(new PQ_BAMBOO.Nodes.EmptyLine(txt, lineNumber)); 
                continue; 
            }

            
            // @IMPROV: this counts tabs as two spaces; use a global setting to easily sync this with CSS
            txt = txt.replace("\t", "\u00a0\u00a0");
            
            // find first non-whitespace character
            const indent = txt.search(/\S/);
            txt = txt.slice(indent);
            const spaceAfter = txt.length - txt.trim().length;
            txt = txt.trim();

            // @NOTE: this is the only thing that actually calls the parser from outside
            const res = p.statement(txt);
            const invalidResult = ((!res.length) || (res[1] != ""));
            if(invalidResult) { invalid = true; break; }

            const statement = res[0];
            statements.push(statement);
            statement.setSpaceBefore(indent);
            statement.setSpaceAfter(spaceAfter);
            statement.setLineNumber(lineNumber);
        }

        if(invalid) { return null; }

        const indentation = [0];
        let curBlock = new PQ_BAMBOO.Nodes.Block(this);

        for(let i = 0; i < statements.length; i++)
        {
            const curInd = indentation[indentation.length - 1];
            let nextInd = curInd;
            const endOfFile = (i >= (statements.length - 1));

            // ensure we "de-dent" properly, all the way down to 0, at end of file
            // (@ANNOYING BUG: If you don't, ending the code with _any_ indented line will destroy everything before it)
            // otherwise, if the next line has some indentation (not empty), read it
            if(endOfFile) { nextInd = 0; } 
            else  { 
                const nextIsNewLine = statements[i+1] instanceof PQ_BAMBOO.Nodes.EmptyLine;
                if(!nextIsNewLine) { nextInd = statements[i+1].getSpaceBefore(); }
            }

            const goDeeper = (nextInd > curInd);
            if(goDeeper) { 
                indentation.push(nextInd); 

                const b = new PQ_BAMBOO.Nodes.Block(this);
                b.setParentBlock(curBlock);
                b.setHeader(statements[i]);
                curBlock = b;
                continue;
            }

            curBlock.addStatement(statements[i]);

            const goBack = (nextInd < curInd);
            if(goBack)
            {
                const idx = indentation.indexOf(nextInd);
                for(let j = indentation.length-1; j > idx; j--)
                {
                    indentation.pop();
                    curBlock = curBlock.getParentBlock();
                }
                continue;
            }
        }

        console.log(curBlock);

        return curBlock;
    }
}