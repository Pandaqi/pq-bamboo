import Value from "../value"
import Bag from "../dataTypes/bag"
import Config from "../../config"

export default class FactorKeyword {
    constructor(k, v)
    {
        this.keyword = k;
        this.value = v;
    }

    toString()
    {
        return "<span class='factor-keyword'>"
                + this.keyword.toString()
                + this.value.toString()
                + "</span>"
    }

    toResult()
    {
        const op = Config.operators[this.keyword.toOriginalString()];
        let vals = [this.value.toResult()];
        const isBag = (vals[0] instanceof Bag);
        if(isBag) { vals = this.value.toResult().getValuesRaw(); }

        const arr = [];
        for(const elem of vals)
        {
            const newVal = new Value();
            op.toResult(elem.clone(), newVal)
            arr.push(newVal);
        }

        if(arr.length == 1) { return arr[0]; }

        const newBag = new Bag("unnamed");
        newBag.setContent(arr);
        return newBag;
    }
}
