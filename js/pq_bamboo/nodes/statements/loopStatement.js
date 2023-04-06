import Value from "../value"
import Config from "../../config"

export default class LoopStatement {
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
        return new Value(this.keyword1, "keyword");
    }

    getLoopCount()
    {
        if(!this.value) { return Config.maxLoopCount; }
        return this.value.toResult().toResult();
    }
}