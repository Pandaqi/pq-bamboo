export default class IfStatement {
    constructor(k,c)
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

    isTrue()
    {
        return this.toResult().isTrue();
    }
}
