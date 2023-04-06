import TypeCoercer from "../../helpers/typeCoercer"
import Value from "../value"

export default class StringSlice {
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