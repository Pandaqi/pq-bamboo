import BagName from "../names/bagName";
import Keyword from "../names/keyword";
import Value from "../value"

export default class BagStatement 
{
    keyword1: Keyword;
    name: BagName;
    keyword2: Keyword;

    constructor(k1:Keyword, v:BagName, k2:Keyword)
    {
        this.keyword1 = k1
        this.name = v;
        this.keyword2 = k2;
    }

    toString()
    {
        return "<span class='bag-statement'>"
                + this.keyword1.toString()
                + this.name.toString()
                + this.keyword2.toString()
                + "</span>"
    }

    toResult()
    {
        return new Value("Creation of a new bag: " + this.getBagName(), "parser");
    }

    getBagName()
    {
        return this.name.toOriginalString();
    }
}