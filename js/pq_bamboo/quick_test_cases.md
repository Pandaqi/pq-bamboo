put 0 into ITER
repeat 6 times
 say "HO"
 change ITER by 1
 if ITER is 2
  stop



put 5 into VAR
repeat 10 times
 change VAR by 1


machine A wants a
 say a*a

give 5 to A


machine A wants a and b
 say a*b

give 5 and 10 to A


put true into userLoggedIn
put true into passwordCorrect
if both userLoggedIn and passwordCorrect
 say "WOW!"


machine blab
 say "BLAB"

use blab



## Example of scoping (VAR2 not recognized outside of loop)

put 5 into VAR
repeat 10 times
 change VAR by 100
 put 10 into VAR2

if not (VAR2 is 10)
 say "WOW!"



## Errors, like it SHOULD (sub not defined yet)
machine add wants a and b
 give a and b to sub
 machine sub wants c and d
  say c-d

give 1 and 2 to add


## Works, like it SHOULD
machine add wants a and b
 machine sub wants c and d
  say c-d
 give a and b to sub

give 1 and 2 to add



## Skip/stop/keywords

put 5 into VAR
repeat 5 times
 change VAR by 1
 if VAR % 2 is 0
  skip
 say "WOW"