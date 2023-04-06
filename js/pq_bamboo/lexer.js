import Memory from "./nodes/memory"
import Block from "./nodes/structure/block"
import EmptyLine from "./nodes/structure/emptyLine"
import Parser from "./parser"

export default class Lexer {
    constructor(cfg)
    {
        this.config = cfg;
        this.memory = new Memory(cfg);
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
        return !(res instanceof Block);
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
        const p = Parser;
        p.setLexer(this);

        const statements = [];
        let invalid = false;
        let lineNumber = 0;
        for(let txt of textSplit)
        {
            lineNumber += 1;
            if(this.isEmptyLine(txt)) { 
                statements.push(new EmptyLine(txt, lineNumber)); 
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
        let curBlock = new Block(this);

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
                const nextIsNewLine = statements[i+1] instanceof EmptyLine;
                if(!nextIsNewLine) { nextInd = statements[i+1].getSpaceBefore(); }
            }

            const goDeeper = (nextInd > curInd);
            if(goDeeper) { 
                indentation.push(nextInd); 

                const b = new Block(this);
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

        return curBlock;
    }
}