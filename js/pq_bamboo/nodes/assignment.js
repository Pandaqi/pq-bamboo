
export default class Assignment {
    constructor(k1,v1,k2,v2)
    {
        this.keyword1 = k1;
        this.value1 = v1;
        this.keyword2 = k2;
        this.value2 = v2;
    }

    toString()
    {
        return "<span class='assignment'>"
                + this.keyword1.toString()
                + this.value1.toString()
                + (this.keyword2 ? this.keyword2.toString() : "")
                + (this.value2 ? this.value2.toString() : "")
                + "</span>";
    }

    toResult()
    {
        let val
        let key
        let result

        // "put EXPR into VAR"
        if(this.keyword1.is("put"))
        {
            val = this.value1.toResult();
            key = this.value2.toOriginalString();
            this.value2.getMemory().set(key, val);
            result = val;
        }

        // "now VAR means EXPR" (reversed order)
        else if(this.keyword1.is("now"))
        {
            key = this.value1.toOriginalString();
            val = this.value2.toResult();
            this.value1.getMemory().set(key, val);
            result = val;
        }
        
        // "change VAR by EXPR" (reversed order)
        else if(this.keyword1.is("change")) { 
            key = this.value1.toOriginalString();
            val = this.value2.toResult();

            let valObj = this.value1.getMemory().get(key);
            if(valObj.type != "error") { valObj.update(val); }
            result = valObj;
        }

        // "delete VAR"
        else if(this.keyword1.is("delete")) {
            key = this.value1.toOriginalString();
            let memory = this.value1.getMemory();
            result = memory.delete(key);
        }

        return result;
    }
}