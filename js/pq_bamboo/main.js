if(!self.PQ_BAMBOO) { self.PQ_BAMBOO = {}; }

// @SOURCE: original code inspired by https://codepen.io/brianmearns/pen/YVjZWw
self.addEventListener("load", () => {
    const insideWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    if(insideWebWorker) { return; }

    const bambooBlockNodes = Array.from(document.getElementsByClassName("pq-bamboo"));
    const bambooBlocks = [];

    for(const blockNode of bambooBlockNodes)
    {
        const block = new PQ_BAMBOO.CodeBlock({ node: blockNode });
        bambooBlocks.push(block);
    }

    self.BAMBOO = bambooBlocks; // DEBUGGING
})