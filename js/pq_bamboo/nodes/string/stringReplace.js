import TypeCoercer from "../../helpers/typeCoercer"
import Value from "../value"

export default class StringReplace {
    constructor(k1,c1,k2,c2,k3,c3)
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
        return "<span class='replace-statement'>"
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
        const search = this.value1.toResult().clone();
        const replace = this.value2.toResult().clone();

        TypeCoercer.toString(oldText);
        TypeCoercer.toString(search);
        TypeCoercer.toString(replace);
        
        const newText = oldText.toResult().replaceAll(search.toResult(), replace.toResult());
        return new Value(newText, "string");
    }
}