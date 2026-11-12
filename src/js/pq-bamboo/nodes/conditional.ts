import Keyword from "./names/keyword";
import Operator from "./operators/operator"
import OperatorSymbol from "./operators/operatorSymbol";

export default class Conditional 
{
    keyword1: Keyword;
    value1: any;
    operator: Operator;
    value2: any;
    
    // @ NOTE: k1 and v1 can be null; operator and v2 never are (e.g. "_ _ not Cond")
    constructor(k1:Keyword, v1:any, op:OperatorSymbol, v2:any)
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