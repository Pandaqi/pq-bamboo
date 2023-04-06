import Variable from "../names/variable"

export default class BagPop {
    constructor(l,k1,key,k2,k3,b)
    {
        this.lexer = l;
        this.keyword1 = k1;
        this.key = key; // this is optional, only for named bags
        this.keyword2 = k2;
        this.keyword3 = k3;
        this.bagName = b;
    }

    toString()
    {
        return "<span class='bag-push'>"
                + this.keyword1.toString()
                + (this.key ? this.key.toString() : "")
                + this.keyword2.toString()
                + this.keyword3.toString()
                + this.bagName.toString()
                + "</span>";
    }

    // @IMPROV: now I often do a manual check if something is a variable and then call "toKey()"
    // Is there _some way_ to integrate this with everything, so I can just call "toKey" on anything?
    toResult()
    {
        const bagObject = this.lexer.getMemory().get(this.bagName.toOriginalString());
        if(this.key) { 
            const isVariable = (this.key instanceof Variable);
            let keyResult = "";
            if(isVariable) { keyResult = this.key.toKey(); }
            else { keyResult = this.key.toResult().toOriginalString(); }
            return bagObject.removeValueByKey(keyResult); 
        }
        return bagObject.pop();
    }
}