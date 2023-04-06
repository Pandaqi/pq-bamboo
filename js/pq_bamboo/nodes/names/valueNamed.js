export default class ValueNamed {
    constructor(n,k,v)
    {
        this.name = n;
        this.keyword = k;
        this.value = v;
    }  

    toString()
    {
        return "<span class='literal-named'>"
                + this.name.toString()
                + this.keyword.toString()
                + this.value.toString()
                + "</span>"
    }

    toResult()
    {
        const v = this.value.toResult().clone();
        v.setLabel(this.getLabel());
        return v;
    }

    getLabel()
    {
        return this.name.toOriginalString();
    }
}