export default {
    toBool(val)
    {
        this.numberToBool(val);
        this.stringToBool(val);
    },

    numberToBool(node)
    {
        if(node.type != "number") { return; }
        node.set(parseInt(node.value) != 0, "bool");
    },

    stringToBool(node)
    {
        if(typeof node.value != "string") { return; }
        node.set(node.value.length > 0, "bool");
    },

    toNumber(val)
    {
        this.boolToNumber(val);
        this.stringToNumber(val);
    },

    boolToNumber(node)
    {
        if(node.type != "bool") { return; }
        let bool = node.value;
        if(typeof bool === 'string') { bool = (bool == "true"); }
        node.set(bool ? 1 : 0, "number");
    },

    stringToNumber(node)
    {
        if(typeof node.value != "string") { return; }
        const num = parseFloat(node.value);
        if(isNaN(num)) { node.set("Can't use string **" + node.value + "** as a number", "error"); }
        else { node.set(num, "number"); }
    },

    toString(val)
    {
        this.boolToString(val);
        this.numberToString(val);
    },

    boolToString(node)
    {
        if(node.type != "bool") { return; }
        node.set(node.value, "string");
    },

    numberToString(node)
    {
        if(node.type != "number") { return; }
        node.set(node.value.toString(), "string");
    }
}