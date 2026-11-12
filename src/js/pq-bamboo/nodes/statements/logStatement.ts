import Keyword from "../names/keyword";
import Value from "../value"

export default class LogStatement 
{
    keyword: Keyword;
    value: any;
    
    constructor(k:Keyword, v:any)
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
        const newValue = new Value(valueObject.toLogString(), "log");
        console.log(newValue); //@KEEP (supposed to console.log, it's the log statement)
        return newValue;
    }
}