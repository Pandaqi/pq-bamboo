/*

"LEXICAL GRAMMAR" (kind of)

Code ::= Block
Block ::= [Block | Statement]*
Statement ::= [
    EmptyLine |
    Comment | 
    IfStatement |
    LogStatement |
    LoopStatement |
    StopStatement |
    FunctionStatement |
    Assignment |
    Expr 
] LineTerminator

Assignment ::= `put` Cond `into` Variable | `change` Variable `by` Cond
IfStatement ::= `if` Cond
LogStatement ::= `say` Cond
LoopStatement ::= `repeat` [Expr `times` | nothing]
StopStatement ::= `stop`
FunctionStatement ::= `machine` FunctionName `wants` ParamsList
Comment ::= `>` stringchars
EmptyLine ::= [emptychars]*


Cond ::= not Cond | Expr [is Cond | or Cond | and Cond | nothing ]
Expr ::= Term [`+` Expr | `-` Expr]
Term ::= Factor [`^` Term | `*` Term | `/` Term]
Factor ::= `(` Cond `)` | Keyword Cond | Variable | FunctionCall | Literal

Literal ::= [symbolOpen] Value [symbolClose]
FunctionCall ::= `give` ParamsList `to` FunctionName
ParamsList ::= FunctionParam [`and` FunctionParam]*
FunctionName ::= FunctionParam ::= (functionchars)*
Variable ::= (varchars)*

Value ::= Bool | Number | String | nothing => saved as (value, type)
Bool ::= `true` | `false`
String ::= `"` [stringchars]* `"`
Number ::= [integer] [`.` integer]

LineTerminator ::= "\n" | EndOfFile

*/