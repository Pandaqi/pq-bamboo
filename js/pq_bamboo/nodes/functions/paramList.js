import Keyword from "../names/keyword"

export default class ParamList {
    constructor(v1, rest)
    {
        if(!v1) { this.list = []; return; }

        this.list = [v1];
        if(rest) { this.list = this.list.concat(rest.flat()); } // parameters should already be in a flat list, but just to be sure
    }

    toString()
    {
        let str = "<span class='function-parameters'>";
        for(const elem of this.list)
        {
            str += elem.toString();
        }
        str += "</span>";
        return str;
    }

    toResult()
    {
        // ??
    }

    getParamsAsList(byName = true)
    {
        const arr = [];
        for(const elem of this.list)
        {
            if(elem instanceof Keyword) { continue; }
            if(byName) { arr.push(elem.toOriginalString()); }
            else { arr.push(elem.toResult()); }
        }
        return arr;
    }
}