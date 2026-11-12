export default class FunctionParameter 
{
    value: any;
    
    constructor(v:any)
    {
        this.value = v;
    }

    toString()
    {
        return "<span class='function-parameter'>" + this.value.toString() + "</span>";
    }

    toResult()
    {
        // ??
    }

    toOriginalString()
    {
        return this.value.toString();
    }
}