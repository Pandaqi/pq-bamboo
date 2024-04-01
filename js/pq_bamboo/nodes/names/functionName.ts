export default class FunctionName 
{
    value: any;
    
    constructor(v:any)
    {
        this.value = v;
    }

    toString()
    {
        return "<span class='function-name'>" + this.toOriginalString() + "</span>";
    }

    toOriginalString()
    {
        return this.value.toString();
    }

    toResult()
    {
        // ??
    }
}