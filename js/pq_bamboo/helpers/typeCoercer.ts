import Value from "../nodes/value";

export default 
{
    toBool(node:Value)
    {
        this.numberToBool(node);
        this.stringToBool(node);
    },

    numberToBool(node:Value)
    {
        if(node.type != "number") { return; }
        node.set(parseInt(node.value.toString()) != 0, "bool");
    },

    stringToBool(node:Value)
    {
        if(typeof node.value != "string") { return; }
        node.set(node.value.length > 0, "bool");
    },

    toNumber(node:Value)
    {
        this.boolToNumber(node);
        this.stringToNumber(node);
    },

    boolToNumber(node:Value)
    {
        if(node.type != "bool") { return; }
        let bool = node.value;
        if(typeof bool === 'string') { bool = (bool == "true"); }
        node.set(bool ? 1 : 0, "number");
    },

    stringToNumber(node:Value)
    {
        if(typeof node.value != "string") { return; }
        const num = parseFloat(node.value);
        if(isNaN(num)) { node.set("Can't use string **" + node.value + "** as a number", "error"); }
        else { node.set(num, "number"); }
    },

    toString(node:Value)
    {
        this.boolToString(node);
        this.numberToString(node);
    },

    boolToString(node:Value)
    {
        if(node.type != "bool") { return; }
        node.set(node.value, "string");
    },

    numberToString(node:Value)
    {
        if(node.type != "number") { return; }
        node.set(node.value.toString(), "string");
    }
}