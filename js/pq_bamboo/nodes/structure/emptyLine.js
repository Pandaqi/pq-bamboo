import Delimiter from "../delimiter"

export default class EmptyLine {
    constructor(s, ln)
    {
        this.space = new Delimiter(s, "space");
        this.lineNumber = ln;
    }

    toString()
    {
        return "<span class='single-line-container'><span class='single-line'>"
                + "<span class='line-number'>" + this.lineNumber + "</span>"
                + "<span class='blank-line'>" 
                + this.space.toString() 
                + "</span></span></span>";
    }

    getLineNumber()
    {
        return this.lineNumber;
    }
}