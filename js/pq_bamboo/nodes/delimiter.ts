// @NOTE: This includes whitespace and terminators
export default class Delimiter 
{
    value: string;
    type: string;
    
    constructor(v:string, t:string)
    {
        this.value = v;
        this.type = t;
    }

    toString()
    {
        return "<span class='delimiter delimiter-" + this.type + "'>" + this.toOriginalString() + "</span>"
    }

    toOriginalString()
    {
        return this.value;
    }
}