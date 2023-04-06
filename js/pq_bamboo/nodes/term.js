import Operator from "./operators/operator"
import OperatorSymbol from "./operators/operatorSymbol"

export default class Term {
    constructor(f, op, t)
    {
        this.factor = f;
        if(!op) { op = new OperatorSymbol(); }
        this.operator = new Operator(op);
        if(t) { this.term = t; }
    }

    toString()
    {
        return "<span class='term'>" 
                + this.factor.toString()
                + ((this.operator && this.term) ? this.operator.toString() + this.term.toString() : "")
                + "</span>"
    }

    toResult()
    {
        return this.operator.toResult(this.factor, this.term);
    }
}