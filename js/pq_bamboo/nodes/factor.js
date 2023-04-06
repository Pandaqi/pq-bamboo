import Delimiter from "./delimiter"

// @NOTE: this one retains its space around the value inside delimOpen/delimClose (if needed)
export default class Factor {
    constructor(o = "", v, c = "")
    {
        this.value = v;
        if(o) { this.delimOpen = new Delimiter(o, "open"); }
        if(c) { this.delimClose = new Delimiter(c, "close"); }
    }

    toString()
    {
        return "<span class='factor'>"
                + (this.delimOpen ? this.delimOpen.toString() : "")
                + this.value.toString()
                + (this.delimClose ? this.delimClose.toString() : "")
                + "</span>"
    }

    toResult()
    {
        return this.value.toResult();
    }
}