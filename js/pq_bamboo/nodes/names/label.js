import Variable from "./variable"
import Value from "../value"

export default class Label {
    constructor(v)
    {
        this.value = v;
    }

    toString()
    {
        return "<span class='label'>" + this.value.toString() + "</span>";
    }

    toKey()
    {
        let val = this.value;

        // if it's a variable, try to grab its value as a key
        const isVariable = (val instanceof Variable);
        if(isVariable) { 
            let keyVal = val.toKey();
            if(keyVal) { return keyVal; }
        }

        // if it's not a value, it must be a container of a value, so grab inside it
        const isValue = (val instanceof Value);
        if(!isValue) { val = val.toResult(); }

        // val should now be a Value object, which we can call to get the original string
        return val.toResult();
    }
}