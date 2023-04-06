import Operator from "./operators/operator"
import OperatorSymbol from "./operators/operatorSymbol"

export default class Expression {
    constructor(t,op,expr)
    {
        this.term = t;
        if(!op) { op = new OperatorSymbol(); }
        this.operator = new Operator(op);
        if(expr) { this.expression = expr; }
    }

    toString()
    {
        return "<span class='expression'>"
                + this.term.toString()
                + ((this.operator && this.expression) ? this.operator.toString() + this.expression.toString() : "")
                + "</span>";
    }

    toResult()
    {
        return this.operator.toResult(this.term, this.expression);
    }
}