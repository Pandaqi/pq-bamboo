import Value from "../value"
import Bag from "../dataTypes/bag"
import Config from "../../config"

export default class Operator {
    constructor(op)
    {
        this.operatorSymbol = op;
    }

    toString()
    {
        return this.operatorSymbol.toString();
    }

    getSymbolString()
    {
        return this.operatorSymbol.toOriginalString();
    }  

    toResult(v1, v2)
    {
        const o = this.getSymbolString()
        const singleOperator = (!v2) || (o == "identity")

        // these are Value _objects_
        const val = new Value();
        let a = v1.toResult().clone();
        let b = !singleOperator ? v2.toResult().clone() : new Value();

        const cfg = this.operatorSymbol.getConfig();
        if(cfg.disabled.includes("typeCoercion") && !singleOperator) 
        {
            if(a.getType() != b.getType())
            {
                val.set("Invalid comparison between data types", "error");
                return val;
            }
        }

        const errors = [];
        if(a.isError()) { errors.push(a); }
        if(b.isError()) { errors.push(b); }
        if(errors.length > 0)
        {
            val.set(errors, "error");
            return val;
        }

        const keywords = [];
        if(a.isKeyword()) { keywords.push(a); }
        if(b.isKeyword()) { keywords.push(b); }
        if(keywords.length > 0)
        {
            val.set(keywords, "keyword");
            return val
        }

        let valsA = [a];
        let valsB = [b];
        
        let aIsBag = (a instanceof Bag);
        let bIsBag = (b instanceof Bag);
        let keys = [];
        if(aIsBag) { valsA = a.getValuesRaw(); keys = a.getKeysRaw(); }
        if(bIsBag) { valsB = b.getValuesRaw(); keys = b.getKeysRaw(); }

        const arr = [];
        const scalar = (valsA.length == 1 || valsB.length == 1);
        const piecewise = (valsA.length == valsB.length) && !scalar;
        const matrix = (valsA.length != valsB.length) && !scalar;

        if(scalar || matrix)
        {
            for(let i = 0; i < valsA.length; i++)
            {
                for(let j = 0; j < valsB.length; j++)
                {
                    let tempVal = new Value();
                    Config.operators[o].toResult(valsA[i], valsB[j], tempVal);
                    arr.push(tempVal);
                }
            }
        }

        if(piecewise)
        {
            const maxVals = Math.max(valsA.length, valsB.length);
            for(let i = 0; i < maxVals; i++)
            {
                let tempVal = new Value();
                Config.operators[o].toResult(valsA[i], valsB[i], tempVal);
                arr.push(tempVal);
            }
        }

        if(arr.length == 1) { return arr[0]; }

        const obj = {};
        for(let i = 0; i < keys.length; i++)
        {
            obj[keys[i]] = arr[i];
        }

        const newBag = new Bag("unnamed");
        newBag.setContent(obj);
        return newBag;
    }

}