import TypeCoercer from "../../helpers/typeCoercer"
import Keyword from "../names/keyword";
import Value from "../value"

export default class StringSlice 
{
    keyword1: Keyword;
    value1: any;
    keyword2: Keyword;
    value2: any;
    keyword3: Keyword;
    value3: any;
    
    constructor(k1:Keyword, c1:any, k2:Keyword, c2:any, k3:Keyword, c3:any)
    {
        this.keyword1 = k1;
        this.value1 = c1;
        this.keyword2 = k2;
        this.value2 = c2;
        this.keyword3 = k3;
        this.value3 = c3;
    }

    toString()
    {
        return "<span class='slice-statement'>"
                + this.keyword1.toString()
                + this.value1.toString()
                + this.keyword2.toString()
                + this.value2.toString()
                + this.keyword3.toString()
                + this.value3.toString()
                + "</span>";
    }

    toResult()
    {
        const oldText = this.value3.toResult().clone();
        const startIndex = this.value1.toResult();
        const endIndex = this.value2.toResult().clone();

        TypeCoercer.toString(oldText);
        TypeCoercer.toNumber(startIndex);
        TypeCoercer.toNumber(endIndex);

        const newText = oldText.toResult().slice(startIndex.toResult(), endIndex.toResult());
        return new Value(newText, "string");
    }
}