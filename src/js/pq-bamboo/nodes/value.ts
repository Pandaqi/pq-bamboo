import Feedback from "../helpers/feedback"
import Delimiter from "./delimiter"
import Config from "../config"
import TypeCoercer from "../helpers/typeCoercer"

type Atom = number|string|boolean;

// @NOTE: Values are always stored as their strings
// They are converted to their proper type only when you do toResult()
// Otherwise, conversion changes representation, which messes up our syntax highlighting 
//      => eg. parseFloat(5.0) = 5, you suddenly lose the digit!
export { Value, Atom }
export default class Value 
{
    delimOpen: Delimiter;
    delimClose: Delimiter;
    label: string;
    type: string;
    value: Atom;

    constructor(v:Atom = 0, t = "nothing", o = null, c = null)
    {
        this.set(v,t);
        if(o) { this.delimOpen = new Delimiter(o, "quote"); }
        if(c) { this.delimClose = new Delimiter(o, "quote"); }
    }

    clone()
    {
        return new Value(this.value, this.type);
    }

    // @NOTE: Values can _optionally_ be labeled, only used for named keys in bags
    setLabel(l:string)
    {
        this.label = l;
    }

    getLabel()
    {
        return this.label;
    }

    print(lineNumber:number)
    {
        return new Feedback(this, lineNumber);
    }

    // @NOTE: This is what actually gives a raw piece of info ("value") back
    // Otherwise, these _objects_ (Value() are stored and passed around)
    toResult()
    {
        const val = this.clone();
        if(this.type == "number") { TypeCoercer.toNumber(val); }
        else if(this.type == "bool") { TypeCoercer.toBool(val); }
        else if(this.type == "string") { TypeCoercer.toString(val); }
        return val.value;
    }

    toString()
    {
        return "<span class='value " + this.type + "'>"
                + (this.delimOpen ? this.delimOpen.toString() : "")
                + this.value.toString()
                + (this.delimClose ? this.delimClose.toString() : "")
                + "</span>";
    }

    toLogString()
    {
        return this.value + "";
    }

    toOriginalString()
    {
        return this.value;
    }

    set(v:Atom,t:string)
    {
        this.setValue(v);
        this.setType(t);
        return this;
    }

    setType(t:string)
    {
        this.type = t;
    }

    getType()
    {
        return this.type;
    }

    setValue(v:Atom)
    {
        this.value = v;
    }

    getValue()
    {
        return this.value;
    }

    // @NOTE: optimizing by calling `this` immediately (3rd param toResult) will break stuff, don't do it
    update(valueObj:Value)
    {
        const plusOperator = Config.operators["+"];
        const res = new Value();
        plusOperator.toResult(this, valueObj, res);
        this.set(res.value, res.type);
        return this;
    }

    isError()
    {
        return this.type == "error";
    }

    isBool()
    {
        return this.type == "bool";
    }

    isNumber()
    {
        return this.type == "number";
    }

    isString()
    {
        return this.type == "string";
    }

    isKeyword(val = "")
    {
        const kw = this.type == "keyword";
        if(!val) { return kw }
        return kw && this.value == val;
    }

    getKeyword()
    {
        if(this.type != "keyword") { return null; }
        return this.value;
    }

    isTrue()
    {
        if(this.isError()) { return false; }
        return this.toResult() as boolean;
    }

    getSize()
    {
        let size = 0;
        if(this.type == "number" || this.type == "boolean") { size = this.value as number; }
        else if(this.type == "string") { size = (this.toResult() as string).length; }
        return new Value(size, "number"); 
    }

    getLabels()
    {
        // @TODO: labels returns bag for literal values? Only makes some sense for strings?
    }

    getItems()
    {
        // @TODO: items returns bag for literal values? Only makes some sense for strings?
    }
}