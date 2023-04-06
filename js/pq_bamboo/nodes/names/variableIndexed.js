export default class VariableIndexed {
    constructor(v,p,l)
    {
        this.variable = v;
        this.delimiter = p;
        this.label = l;
    }

    toString()
    {
        return "<span class='variable-indexed'>"
                + this.variable.toString()
                + this.delimiter.toString()
                + this.label.toString()
                + "</span>";
    }

    toResult()
    {
        const key = this.label.toKey();
        return this.variable.getLabel(key);
    }
}