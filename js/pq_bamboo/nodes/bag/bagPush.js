export default class BagPush {
    constructor(l,k1,v,k2,b)
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