export default class FunctionParameter {
    constructor(v)
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