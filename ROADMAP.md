# Roadmap / To-Do

These are to-dos or ideas for the future. Or optional alternative syntaxes I might implement.

_I am unlike to implement these, as Bamboo was my first programming language and I'd rather build a new one from scratch than continue with the incompatible structure of this one._

## TypeScript

After conversion to TypeScript, many of the different classes accept parameters of type `any`. Why? Because those values could be a number of different objects (Factor, Term, Value, ...), but I currently don't have one super class from which they all inherit.

So, make that superclass, have everything else extend that.

## General

* Fix and complete the testing suite 
* Allow "exp" and "mod" operations between non-numbers? Or at least give a meaningful error message then?
* Find cleaner implementation for converting something that might be a variable, name or evaluation into a key
  * Saving labels on values ("named literals") actually feels very powerful?
  * Maybe I should streamline that: any literal is automatically saved as a named literal/variable? So we know the exact object we're getting and can just call one function on that.
* Include `bamboo profile` (or something) to actually test how fast code runs, for the "programming principles" course.

## Statements

* Allow multiline statements on a single line?
  * Use `then` for statements => `if 5 is 5 then dothis` 
  * But what to do for other things? Like bags? Double colon? `bag BAG holds: elem1 elem2 ...`

## Operators

* I play around with the idea of only supporting addition and multiplication. You can simply invert any value by typing `invert` => `5 - 5` = `5 plus invert 5`; `2 / 4` = `2 times invert 4`
* I couldn't find a word alternative for grouping. It's just too verbose and inefficient. `group a b c d group`?

## Variables

* `put VAL into VAR`
* `set VAR to VAL`
* `make VAR VAL`
* `call VAL VAR`
* `label VAR as VAL`
* `add VAL to VAR`
* `update VAR by VAL`

## Conditionals

Drop the if entirely? Just add a question mark at the end? => `5 is 5?`

## Loops

* `repeat A to B`: loops between the two values
* Add `skip X` to skip ahead that number of loops?
* I considered using "rummage" or "comb" for the bag loops. They are great words ... unless you're not that familiar with their meaning.

## Bags

* Allow initializing _empty bags_ with simply `bag BAGNAME`?

## Machines

* Allow saving a reference to a _machine_ inside a variable or bag
* Perhaps shorthand syntax for this:
  * `use FUNC from BAG with PARAMS`
  * `give PARAMS to NAME and output to VAR`

## Bamboo

Use the `bamboo <something>` more. I considered some (very rudimentary) 

* Built-in drawing,
* Update loop (for games)
* Asynchronous stuff
* Access to file system, alerts, keyboard/mouse input, etcetera. 


