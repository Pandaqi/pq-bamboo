import Value from "../value"

export default class Bag {
    constructor(n)
    {
        this.name = n;
        this.content = {};
    }

    // @TODO: a function to check if it's numbered? Default to an _Array_, but switch once we receive our first named value?

    clone()
    {
        const b = new Bag(this.name);
        b.setContent(this.content);
        return b;
    }

    print(lineNumber)
    {
        return new Value(this.toLogString(), "bag").print(lineNumber);
    }

    toLogString()
    {            
        const sections = [];
        for(const [key, value] of Object.entries(this.content))
        {
            sections.push(key + " => " + value);
        }

        return "[" + sections.join(", ") + "]";
    }
    
    // @NOTE: Only Bag and Value objects are "end points" => they don't call toResult automatically.
    toResult()
    {
        return this;
    }

    isKeyword(k) { return false; }
    getKeyword() { return null; }
    isTrue() { return this.getSize() > 0; }
    getLabel() { return ""; }
    isError() { return false; }
    isBool() { return false; }
    isNumber() { return false; }
    isString() { return false; }

    setContent(list)
    {
        this.content = list;
    }

    addValue(val)
    {
        let key = Object.keys(this.content).length;
        let finalVal = val;
        if(val.getLabel()) { key = val.getLabel(); }
        this.content[key] = finalVal;
    }

    removeValueByKey(key)
    {
        const errorVal = new Value("Bag **" + this.name + "** doesn't have key **" + key + "**", "error");
        if(this.isArray())
        {
            key = parseInt(key);
            if(!isNaN(key)) { return this.content.splice(key, 1); }
            return errorVal;
        }

        key = key + "";
        
        if(!(key in this.content)) { return errorVal; }
        const val = this.content[key];
        delete this.content[key];
        return val;
    }

    push(val, key = null)
    {
        if(this.isArray()) { this.content.push(val); return val; }
        if(!key) { this.addValue(val); return val; }
        this.content[key] = val;
        return val;
    }

    pop()
    {
        if(this.isEmpty()) { return new Value(); }
        if(this.isArray()) { return this.content.pop(); }
        const keys = Object.keys(this.content);
        const lastKey = keys[keys.length - 1];
        const val = this.content[lastKey];
        delete this.content[lastKey];
        return val;
    }

    getValue(key)
    {
        const errorVal = new Value("Bag **" + this.name + "** doesn't have key **" + key + "**", "error");
        if(this.isArray())
        {
            key = parseInt(key);
            if(isNaN(key)) { return errorVal; }
            return this.content[key];
        }

        key = key + ""; // @NOTE: if it's not an array, all keys will be string indexed
        if(!Object.keys(this.content).includes(key)) { return errorVal; }
        return this.content[key];
    }

    isEmpty()
    {
        return this.getSize() <= 0;
    }

    getSize()
    {
        let length = Object.keys(this.content).length;
        if(this.isArray()) { length = this.content.length; }
        return new Value(length, "number"); 
    }

    getLabels()
    {
        const b = new Bag(this.name + "-labels");
        b.setContent(this.getKeysRaw());
        return b;
    }

    getItems()
    {
        const b = new Bag(this.name + "-items");
        b.setContent(this.getValuesRaw());
        return b;
    }

    isArray()
    {
        return Array.isArray(this.content);
    }

    isObject()
    {
        return (typeof this.content === 'object');
    }

    getKeysRaw()
    {
        const arr = [];
        if(this.isArray())
        {
            for(let i = 0; i < this.content.length; i++)
            {
                arr.push(i);
            }
        } else {
            for(const key of Object.keys(this.content))
            {
                arr.push(new Value(key, "string"));
            }
        }
        return arr;
    }
    
    getValuesRaw()
    {
        if(this.isArray()) { return this.content; }
        return Object.values(this.content);
    }

    getFirst()
    {
        if(this.getSize() <= 0) { return new Value(); }
        const keys = Object.keys(this.content);
        const firstKey = keys[0];
        const val = this.content[firstKey].toResult().clone()
        return val;
    }

    getLast()
    {
        if(this.getSize() <= 0) { return new Value(); }
        const keys = Object.keys(this.content);
        const lastKey = keys[keys.length - 1];
        const val = this.content[lastKey].toResult().clone();
        return val;
    }
}