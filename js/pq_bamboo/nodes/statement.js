export default class Statement {
    constructor(v)
    {
        this.spaceBefore = 0;
        this.spaceAfter = 0;
        this.value = v;
    }

    toString()
    {
        let s1 = new Array(this.spaceBefore);
        let s2 = new Array(this.spaceAfter);
        s1 = s1.fill(" ").join("");
        s2 = s2.fill(" ").join("");

        if(this.spaceBefore == 0) { s1 = ""; }
        if(this.spaceAfter == 0) { s2 = ""; }

        return "<span class='single-line-container'><span class='single-line'>"
                + "<span class='line-number'>" + this.lineNumber + "</span>"
                + "<span class='statement'>"
                + s1 
                + this.value.toString() 
                + s2
                + "</span>"
                + "</span></span>";
    }

    toResult()
    {
        return this.value.toResult();
    }

    setSpaceBefore(s)
    {
        this.spaceBefore = s;
    }

    setSpaceAfter(s)
    {
        this.spaceAfter = s;
    }

    getSpaceBefore()
    {
        return this.spaceBefore;
    }

    getDefinition()
    {
        return this.value
    }

    isDefinition(classInstance)
    {
        return this.value instanceof classInstance;
    }

    setLineNumber(ln)
    {
        this.lineNumber = ln;
    }

    getLineNumber()
    {
        return this.lineNumber;
    }
}