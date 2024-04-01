import Value from "./value";

export default class Statement 
{
    spaceBefore: number;
    spaceAfter: number;
    value: any;
    lineNumber: number;

    constructor(v:Value)
    {
        this.spaceBefore = 0;
        this.spaceAfter = 0;
        this.value = v;
    }

    toString()
    {
        const s1prep = new Array(this.spaceBefore);
        const s2prep = new Array(this.spaceAfter);
        let s1 = s1prep.fill(" ").join("");
        let s2 = s2prep.fill(" ").join("");

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

    setSpaceBefore(s:number)
    {
        this.spaceBefore = s;
    }

    setSpaceAfter(s:number)
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

    setLineNumber(ln:number)
    {
        this.lineNumber = ln;
    }

    getLineNumber()
    {
        return this.lineNumber;
    }
}