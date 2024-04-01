import Value from "../value"
import Config from "../../config"
import Keyword from "../names/keyword";

export default class LoopStatement 
{
    keyword1: Keyword;
    value: any;
    keyword2: Keyword;

    constructor(k1:Keyword, v:any, k2:Keyword)
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
        return new Value(this.keyword1.toString(), "keyword");
    }

    getLoopCount()
    {
        if(!this.value) { return Config.maxLoopCount; }
        return this.value.toResult().toResult();
    }
}