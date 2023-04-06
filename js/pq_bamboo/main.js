import CodeBlock from "./codeblock"
import Lexer from "./lexer"

if(!self.PQ_BAMBOO) { self.PQ_BAMBOO = {}; }
self.PQ_BAMBOO.Lexer = Lexer;

// @SOURCE (very old version): original code inspired by https://codepen.io/brianmearns/pen/YVjZWw
self.addEventListener("load", () => {
    const insideWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    if(insideWebWorker) { return; }

    const bambooBlockNodes = Array.from(document.getElementsByClassName("pq-bamboo"));
    const bambooBlocks = [];

    for(const blockNode of bambooBlockNodes)
    {
        const block = new CodeBlock({ node: blockNode });
        bambooBlocks.push(block);
    }

    self.PQ_BAMBOO.codeBlocks = bambooBlocks; // DEBUGGING
})