// @NOTE: This includes whitespace and terminators
export default class Delimiter {
    constructor(v, t)
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