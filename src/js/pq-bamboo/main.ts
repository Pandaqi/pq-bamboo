import CodeBlock from "./codeblock"
import Lexer from "./lexer"

// @ts-ignore
if(!self.PQ_BAMBOO) { self.PQ_BAMBOO = {}; }
// @ts-ignore
self.PQ_BAMBOO.Lexer = Lexer;

// @SOURCE (very old version): original code inspired by https://codepen.io/brianmearns/pen/YVjZWw
self.addEventListener("load", () => {
    // @ts-ignore
    const insideWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    if(insideWebWorker) { return; }

    const bambooBlockNodes = Array.from(document.getElementsByClassName("pq-bamboo")) as HTMLElement[];
    const bambooBlocks : CodeBlock[] = [];

    for(const blockNode of bambooBlockNodes)
    {
        const block = new CodeBlock(blockNode);
        bambooBlocks.push(block);
    }

    // @ts-ignore => @DEBUGGING
    self.PQ_BAMBOO.codeBlocks = bambooBlocks;
})