import Operator from "./operators/operator"
import OperatorSymbol from "./operators/operatorSymbol"
import Term from "./term";

export default class Expression 
{
    term: Term;
    operator: Operator;
    expression: Expression;
    
    constructor(t:Term, op:OperatorSymbol, expr:Expression)
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