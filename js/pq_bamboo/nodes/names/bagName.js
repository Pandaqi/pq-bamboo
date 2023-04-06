export default class BagName {
    constructor(v)
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