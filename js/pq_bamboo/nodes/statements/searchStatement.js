import Value from "../value"
import Bag from "../dataTypes/bag"

export default class SearchStatement {
    constructor(k,b)
    {
        this.keyword = k;
        this.bag = b;
    }

    toString()
    {
        return "<span class='search-statement'>"
                + this.keyword.toString()
                + this.bag.toString()
                + "</span>";
    }

    isInvalid()
    {
        return !(this.bag.toResult() instanceof Bag);
    }

    toResult()
    {
        return new Value(this.keyword, "keyword");
    }

    getLoopCount()
    {
        if(this.isInvalid()) { return 0; }
        const sizeObject = this.bag.toResult().getSize();
        return sizeObject.toResult();
    }

    getLoopValues()
    {
        if(this.isInvalid()) { return []; }
        return this.bag.toResult().getValuesRaw();
    }
}