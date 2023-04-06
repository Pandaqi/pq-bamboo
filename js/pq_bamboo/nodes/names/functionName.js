export default class FunctionName {
    constructor(v)
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