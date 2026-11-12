export default class BagName 
{
    value: string;
    
    constructor(v:string)
    {
        this.value = v;
    }

    toString()
    {
        return "<span class='bag-name'>" + this.toOriginalString() + "</span>";
    }

    toOriginalString()
    {
        return this.value;
    }

    toResult()
    {
        // ??
    }
}