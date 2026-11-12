import Lexer from "js/pq_bamboo/lexer";
import BagName from "../names/bagName";
import Keyword from "../names/keyword";

export default class BagPush 
{
    lexer: Lexer;
    keyword1: Keyword;
    value: any;
    keyword2: Keyword;
    bagName: BagName;
    
    constructor(l:Lexer, k1:Keyword, v:any, k2:Keyword, b:BagName)
    {
        this.lexer = l;
        this.keyword1 = k1;
        this.value = v;
        this.keyword2 = k2;
        this.bagName = b;
    }

    toString()
    {
        return "<span class='bag-push'>"
                + this.keyword1.toString()
                + this.value.toString()
                + this.keyword2.toString()
                + this.bagName.toString()
                + "</span>";
    }

    toResult()
    {
        const bagObject = this.lexer.getMemory().get(this.bagName.toOriginalString());
        const valueRaw = this.value.toResult();
        return bagObject.push(valueRaw);
    }
}