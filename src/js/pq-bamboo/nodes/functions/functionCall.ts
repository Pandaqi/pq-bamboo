import Lexer from "js/pq_bamboo/lexer";
import Function from "../function"
import FunctionName from "../names/functionName";
import Keyword from "../names/keyword";
import ParamList from "./paramList"

export default class FunctionCall 
{
    lexer: Lexer;
    keyword1: Keyword;
    keyword2: Keyword;
    name: FunctionName;
    paramsList: ParamList;

    constructor(l:Lexer, k1:Keyword, v:any, k2:Keyword, n:FunctionName)
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
        if(!(functionNode instanceof Function)) { return functionNode; }
        return functionNode.call(this.getParamsList());
    }

    getParamsList()
    {
        if(!this.paramsList) { return new ParamList(); }
        return this.paramsList;
    }

    getMemory()
    {
        return this.lexer.memory;
    }
}