import Config from "../../config"
import Value from "../value"
import Bag from "../dataTypes/bag"
import EmptyLine from "./emptyLine"
import Function from "../function"
import IfStatement from "../statements/ifStatement"
import LoopStatement from "../statements/loopStatement"
import SearchStatement from "../statements/searchStatement"
import BagStatement from "../statements/bagStatement"
import FunctionStatement from "../statements/functionStatement"

export default class Block {
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
            const isEmptyLine = (cont instanceof EmptyLine);
            if(isEmptyLine) { continue; }
            contentStripped.push(cont);
        }

        // If we handle a _statement_, we'll get a single result that nobody else has handled yet
        // So we print those into feedback, and hand this to our parent at the end
        // (Block nodes will already have handled their own statements and thus given their feedback)

        let loopCounter = 0;
        let loopValues = header.loopValues;
        let lastResult = new Value();
        let allResults = header.bag || new Bag();

        while(true) {
            let stopLooping = !header.loop;

            const iterator = new Value(loopCounter, "number");
            this.lexer.setBambooMemory("iterator", iterator);

            let val = new Value("No loop value (possibly not looping over a bag?)", "error");
            if(loopCounter < loopValues.length) { val = loopValues[loopCounter] }
            this.lexer.setBambooMemory("value", val);
            
            for(const cont of contentStripped)
            {
                const res = cont.toResult();

                const isBlock = cont instanceof Block;
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
            stopLooping = stopLooping || (loopCounter >= header.loopCount) || (loopCounter >= Config.maxLoopCount);
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
            result: new Value()
        };

        if(!this.header) { return obj; }

        const ifStatement = this.header.isDefinition(IfStatement);
        const loopStatement = this.header.isDefinition(LoopStatement);
        const searchStatement = this.header.isDefinition(SearchStatement);
        const bagStatement = this.header.isDefinition(BagStatement);
        const functionStatement = this.header.isDefinition(FunctionStatement);
        
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
            const bagNode = new Bag(name, this.memory);
            this.parentMemory.set(name, bagNode);
            obj.result.set("Bag defined", "parser");
            obj.bag = bagNode;
            return obj;
        }

        if(functionStatement)
        {
            const name = this.header.getDefinition().getFunctionName();
            const functionNode = new Function(name, this, this.memory);
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
}