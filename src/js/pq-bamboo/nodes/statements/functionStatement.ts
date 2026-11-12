import ParamList from "../functions/paramList";
import FunctionName from "../names/functionName";
import Keyword from "../names/keyword";
import Value from "../value"

export default class FunctionStatement 
{
    keyword1: Keyword;
    name: FunctionName;
    keyword2: Keyword;
    params: ParamList;

    constructor(k1:Keyword, n:FunctionName, k2:Keyword, p:ParamList)
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
        return new Value(this.getFunctionName(), "function");
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
}