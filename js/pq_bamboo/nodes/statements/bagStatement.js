import Value from "../value"

export default class BagStatement {
    constructor(k1, v, k2)
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
        return new Value("Creation of a new bag: " + this.toOriginalString(), "parser");
    }

    getBagName()
    {
        return this.name.toOriginalString();
    }
}