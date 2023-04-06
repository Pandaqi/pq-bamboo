import Bag from "../dataTypes/bag"
import Value from "../value"

export default class Variable {
    constructor(l, v)
    {
        this.lexer = l;
        this.value = v;
    }

    toString()
    {
        return "<span class='variable'>" + this.value.toString() + "</span>";
    }

    toResult()
    {
        return this.getMemory().get(this.value);
    }

    existsInMemory()
    {
        return this.getMemory().has(this.value);
    }

    isReservedKeyword()
    {
        return ["size", "labels", "items"].includes(this.toOriginalString());
    }

    toKey()
    {
        if(this.isReservedKeyword()) { return this.toOriginalString(); }
        if(this.existsInMemory()) { return this.toResult().toResult(); }
        return this.toOriginalString();
    }

    getLabel(key)
    {
        const val = this.toResult();
        const isBag = (val instanceof Bag);

        const originalKey = key;
        const keyIsObject = (key instanceof Value);
        if(keyIsObject) { key = key.toOriginalString(); }

        // default keywords
        if(key == "size") { 
            return val.getSize();
        } else if(key == "labels") {
            return val.getLabels();
        } else if(key == "items") {
            return val.getItems();
        }

        // otherwise just ask the bag to search for the key
        if(isBag) { return val.getValue(key); }
        
        // strings can be indexed by number (num => which character) or string (string => which index)
        const isString = val.getType() == "string";
        if(isString)
        {
            let stringIndex = key;
            if(keyIsObject && originalKey.getType() == "number") { stringIndex = originalKey.toResult(); }

            const indexStringByNumber = isNaN(stringIndex);
            const indexStringByCharacter = !indexStringByNumber;
            if(indexStringByNumber) { 
                const returnVal = val.toResult().indexOf(stringIndex); 
                return new Value(returnVal, "number");
            }

            if(indexStringByCharacter) { 
                const returnVal = val.toResult().at(stringIndex)
                return new Value(returnVal, "string"); 
            }
        }

        // if we have a basic indexable object behind us, use that
        const canIndex = Array.isArray(key) || (typeof key === 'object');
        if(canIndex) { return val[key]; }

        // otherwise, we can't access and should error
        return new Value("Can't access **" + key + "** on **" + this.toOriginalString() + "**", "error"); 
    }

    toOriginalString()
    {
        return this.value;
    }

    getMemory()
    {
        return this.lexer.memory;
    }
}