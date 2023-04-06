import Delimiter from "../delimiter"

// @NOTE: "toResult" gives us the value itself, it doesn't call "toResult" on _that_
// That's because this is a terminal node; there's nothing more to evaluate, we've reached the value we wanted
export default class Literal {
    constructor(value, o = "", c = "")
    {
        this.value = value;
        if(o != "") { this.delimOpen = new Delimiter(o, "open"); }
        if(c != "") { this.delimClose = new Delimiter(o, "close"); }
    }

    toString()
    {
        let str = "<span class='literal literal-" + this.value.getType() + "'>";
        if(this.delimOpen) { str += this.delimOpen.toString(); }
        str += this.value.toString();
        if(this.delimClose) { str += this.delimClose.toString(); }
        str += '</span>';
        return str;
    }

    toResult()
    {
        return this.value;
    }
}