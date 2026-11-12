import Delimiter from "../delimiter";
import Label from "./label";
import Variable from "./variable";

export default class VariableIndexed 
{
    variable: Variable;
    delimiter: Delimiter;
    label: Label;
    
    constructor(v:Variable, p:Delimiter, l:Label)
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