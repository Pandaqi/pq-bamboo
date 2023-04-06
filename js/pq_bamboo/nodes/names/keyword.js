import Delimiter from "../delimiter"
import Value from "../value"

export default class Keyword {
    constructor(s1,v,s2)
    {
        this.space1 = new Delimiter(s1, "space");
        this.value = v;
        this.space2 = new Delimiter(s2, "space");
    }

    toString()
    {
        return "<span class='keyword'>"
                + this.space1.toString()
                + this.value.toString()
                + this.space2.toString()
                + "</span>"
    }

    toResult()
    {
        return new Value(this.value, "keyword");
    }

    toOriginalString()
    {
        return this.value;
    }

    is(v)
    {
        return this.value == v;
    }
}