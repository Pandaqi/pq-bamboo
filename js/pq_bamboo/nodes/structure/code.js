export default class Code {
    constructor(b)
    {
        this.blocks = b;
    }

    toString()
    {
        let str = "<span class='code'>";
        for(const block of this.blocks)
        {
            str += block.toString();
        }
        str += "</span>";
        return str;
    }

    toResult()
    {
        let results = [];
        for(const block of this.blocks)
        {
            results = results.concat(block.toResult());
        }
        return results;
    }
}