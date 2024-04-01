import Value, { Atom } from "../value"
import Delimiter from "../delimiter"

export default class Comment 
{
    delim: Delimiter;
    value: Value;
    
    constructor(symbol:string, v:Atom)
    {
        this.delim = new Delimiter(symbol, "comment");
        this.value = new Value(v, "comment");
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
}