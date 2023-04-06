import Operator from "./operators/operator"

export default class Conditional {
    // @ NOTE: k1 and v1 can be null; operator and v2 never are (e.g. "_ _ not Cond")
    constructor(k1,v1,op,v2)
    {
        this.keyword1 = k1;
        this.value1 = v1;
        this.operator = new Operator(op);
        this.value2 = v2;
    }

    toString()
    {
        return "<span class='conditional'>"
                + (this.keyword1 ? this.keyword1.toString() : "")
                + (this.value1 ? this.value1.toString() : "" )
                + this.operator.toString()
                + this.value2.toString()
                + "</span>";
    }

    toResult()
    {
        if(!this.value1) { return this.operator.toResult(this.value2); }
        return this.operator.toResult(this.value1, this.value2);
    }
}