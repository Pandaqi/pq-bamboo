import Conditional from "../conditional";
import Keyword from "../names/keyword";

export default class IfStatement 
{
    keyword: Keyword;
    conditional: Conditional;

    constructor(k:Keyword, c:Conditional)
    {
        this.keyword = k;
        this.conditional = c;
    }

    toString()
    {
        return "<span class='if-statement'>"
                + this.keyword.toString()
                + this.conditional.toString()
                + "</span>"
    }

    toResult()
    {
        return this.conditional.toResult();   
    }

    isTrue() : boolean
    {
        return this.toResult().isTrue();
    }
}
