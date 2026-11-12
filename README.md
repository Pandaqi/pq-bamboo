## PQ Bamboo

Bamboo was made to introduce people to programming. It has a limited set of features and terrible performance (if you want to do anything serious with it).

The language aims to read like simple English at all times.

* **Each line is one statement.** (Empty lines are just ignored)
* **Everything uses _words_ as operators.** (Symbols are supported too, though.)
* **Grouping happens with spacing/indentation.** (Similar to Python.)
* **It tries to be very dynamic, yet opinionated.** (It coerces data types, allows shenanigans, but makes it unlikely you actually do that.)
* **It aims to be incredibly consistent.** Almost all statements use this structure: `keyword value (keyword value)`.

All of these were more important than performance or power, because the language was always meant as a great _teaching tool_!

## Why?

I built this for my tutorials on [Pandaqi Tutorials](https://pandaqi.com/tutorials/programming/learn-to-code). 

Here's what Bamboo looks like on my website.

![Visual of a highlighted Bamboo code block](pq-bamboo-header.webp)

The parser is, therefore, **three things in one**:

* **An interpreter**
* **An executer**
* **A syntax highlighter**

All of that on the spot. That's why its performance will tank if you write even moderately long code.

This project has two parts:

* A JavaScript library to edit, parse and highlight this on a webpage
* The actual language syntax and grammar.

Having created this language, though, I know have a much better understanding of how to do it _well_. So I might build on this language and create a proper (fast, robust) parser in the future.

## Getting Started

How to add this framework to your own website / teaching tool?

### Load files

**Load the CSS** at `dist/styles.css`. You can edit it to create your own styling rules or highlighting theme.

**Load the JS files.** 

* One is a _web worker_ (`dist/pqBamboo-parser.js`).
* The other has all nodes and functionality (`dist/lib-pqBamboo.min.js`).

Both can be located anywhere, but you need to tell them where the other is.

* Within the Web Worker, set the path to the other JS file at the top (`importScripts` function). 
* After loading the main library, set your path to the web worker with ...

```
PQ_BAMBOO.config.webWorkerUrl = "your/path/towards/it.js"
```

The Hugo shortcode is **optional**. You can use it to get started more quickly, if you happen to be using the Hugo website generator.

### Create code blocks

Any element with the class `pq-bamboo` is converted to a code block automatically. 

All code blocks on a page are saved in a global variable `BAMBOO` (an array). 

You can also create code blocks manually instead with this snippet:

```
const newBlock = new PQ_BAMBOO.CodeBlock({ parent: someParentNode });
```

Once created, you have an empty textarea in which to type. On change, it parses the result, highlights it, _and_ executes to give you the result.

### Alternative: Direct Usage

Of course, you can also put the TypeScript source directly into your project and only import what you need.

And you can use `sass/_bamboo.scss`, modify it, and compile it yourself.

## Documentation

Check the [Documentation](DOCS.md) about syntax, the Bamboo grammar, and more information.

## Roadmap

Check the [Roadmap](ROADMAP.md) for any outstanding to-dos.