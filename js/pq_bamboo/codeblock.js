// @NOTE: ended up switching to another approach: an invisible <textarea> overlaying the actually styled div
// @SOURCE: https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
// Modified and extended _a lot_ for my purposes.
//
PQ_BAMBOO.CodeBlock = class {
    constructor(params)
    {
        this.setupHTML(params);
        this.setConfigInputs();
        this.removeEmptyLinesAtStart();
        this.setupFoldableBlock();
        this.setupConfigInteraction();

        this.highlighter = new PQ_BAMBOO.SyntaxHighlighter(this, this.codeInput, this.codeDisplay);
        this.codeInput.addEventListener("input", this.onInput.bind(this));

        const executeAtInit = !this.isFolded();
        if(executeAtInit) { this.onInput(); }
    }

    setupFoldableBlock()
    {
        if(!this.isFolded())
        {
            this.foldNode.style.display = 'none';
            return;
        }

        this.codeContainer.style.display = 'none';
        this.parseResult.style.display = 'none';
        this.foldNode.addEventListener('click', this.unfold.bind(this));
    }

    setupConfigInteraction()
    {
        this.configButton.addEventListener("click", this.onConfigClicked.bind(this));
    }

    onConfigClicked(ev)
    {
        const isVisible = this.configForm.style.display == "block";
        
        if(isVisible) { this.configForm.style.display = "none"; }
        else { this.configForm.style.display = "block"; }

        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }

    isFolded()
    {
        return this.node.dataset.folded == "true";
    }

    unfold()
    {
        this.node.dataset.folded = "false";
        this.codeContainer.style.display = 'block';
        this.parseResult.style.display = 'block';
        this.foldNode.style.display = 'none';
        this.onInput();
    }

    onInput()
    {
        this.startExecuting();
    }

    startExecuting()
    {
        const content = this.highlighter.prepareStyling();
        this.feedback.innerHTML = 'Executing ...';

        if(this.thread) { this.thread.terminate(); }
        
        this.thread = new Worker(PQ_BAMBOO.config.workerURL);
        this.thread.addEventListener('message', this.finishExecuting.bind(this));

        let message = { code: content, config: this.getConfig() };
        this.thread.postMessage(JSON.stringify(message));
    }

    finishExecuting(ev)
    {
        const msg = JSON.parse(ev.data);
        const noValidResult = Object.keys(msg).length <= 0;
        if(noValidResult) { 
            this.highlighter.finishStyling("");
            return; 
        }

        this.highlighter.finishStyling(msg.text);
        this.feedback.innerHTML = msg.feedback;
        this.parseResult.style.display = 'block';
        if(msg.feedback.length <= 0) { this.parseResult.style.display = 'none'; }
    }

    // @NOTE: This is only necessary for MY purposes (Hugo generator, code examples, stupid whitespace issues)
    removeEmptyLinesAtStart()
    {
        const n = this.codeInput;
        let txt = n.innerHTML;
        while(true)
        {
            const idx = txt.search(/\S/); // find index of first non-whitespace character
            if(idx <= 0) { break; } // if it's the next character (or none exists) we're done
            txt = txt.slice(1); // otherwise, chop it off and retry
        }

        n.innerHTML = txt;
    }

    // @IMPROV: this code is very repetitive, generalize
    // But I couldn't generalize easily while writing the first version, because each element needs
    //  - a different class
    //  - sometimes a different parent
    //  - sometimes even more properties set
    setupHTML(params)
    {
        this.node = params.node;
        if(!params.node)
        {
            this.node = document.createElement("figure");
            this.node.classList.add("pq-bamboo");
            params.parent.appendChild(this.node);
        }

        // code input (hidden textarea) and display (styled div)
        this.codeContainer = this.node.getElementsByClassName("code-block")[0];

        this.codeInput = this.node.getElementsByClassName("code-block-input");
        if(this.codeInput.length > 0) { this.codeInput = this.codeInput[0]; }
        else {
            this.codeInput = document.createElement("textarea");
            this.codeInput.classList.add("code-block-input");
            this.codeContainer.appendChild(this.codeInput);
        }

        this.codeDisplay = this.node.getElementsByClassName("code-block-display");
        if(this.codeDisplay.length > 0) { this.codeDisplay = this.codeDisplay[0]; }
        else {
            this.codeDisplay = document.createElement("div");
            this.codeDisplay.classList.add("code-block-display");
            this.codeContainer.appendChild(this.codeDisplay);
        }

        this.codeDisplay.setAttribute("spellcheck", false);
        this.codeInput.setAttribute("spellcheck", false);

        // node for folding/unfolding code block
        this.foldNode = this.node.getElementsByClassName("bamboo-fold");
        if(this.foldNode.length > 0) { this.foldNode = this.foldNode[0]; }
        else {
            this.foldNode = document.createElement("div");
            this.foldNode.classList.add("bamboo-fold");
            this.node.appendChild(this.foldNode);
        }

        // config form and button to toggle it
        this.configForm = this.node.getElementsByClassName("bamboo-config-container");
        if(this.configForm.length > 0) { this.configForm = this.configForm[0]; }
        else {
            this.configForm = document.createElement("div");
            this.configForm.classList.add("bamboo-config-container");
            this.node.appendChild(this.configForm)
        }

        this.configButton = this.configForm.getElementsByClassName("bamboo-config-btn");
        if(this.configButton.length > 0) { this.configButton = this.configButton[0]; }
        else {
            this.configButton = document.createElement("button");
            this.configButton.classList.add("bamboo-config-btn");
            this.configButton.title = "Configure";
            this.configButton.innerHTML = "⚙️";
            this.configForm.appendChild(this.configButton);
        }

        // parsing feedback and result
        this.parseResult = this.node.getElementsByClassName("parse-result");
        if(this.parseResult.length > 0) { this.parseResult = this.parseResult[0]; }
        else {
            this.parseResult = document.createElement("div");
            this.parseResult.classList.add("parse-result");
            this.node.appendChild(this.parseResult);
        }

        this.feedback = this.parseResult.getElementsByClassName("parse-result-content");
        if(this.feedback.length > 0) { this.feedback = this.feedback[0]; }
        else {
            this.feedback = document.createElement("div");
            this.feedback.classList.add("parse-result-content");
            this.parseResult.appendChild(this.feedback);
        }

        // debug (only for developing, nothing else)
        this.debug = this.node.getElementsByClassName("bamboo-debug");
        if(this.debug.length > 0) { this.debug = this.debug[0]; }
        else {
            this.debug = document.createElement("div");
            this.debug.classList.add("bamboo-debug");
            this.node.appendChild(this.debug);
        }
        
    }

    // set config form (the actual checkboxes) based on dataset values
    setConfigInputs()
    {            
        const n = this.node;
        let configForm = n.getElementsByClassName("bamboo-config-container")[0];
        const inputNodes = configForm.getElementsByTagName("input");
        for(const inputNode of inputNodes)
        {
            inputNode.checked = (n.dataset[inputNode.name] == "true");
        }
    }

    getConfig()
    {
        const configDefault = { 
            disabled: [], 
            fb: { 
                log: true, 
                result: true, 
                value: true, 
                keyword: true 
            }
        };

        const config = {};
        Object.assign(config, configDefault);

        // first, read what the config form is saying (and save that)
        const n = this.node;
        const inputNodes = this.configForm.getElementsByTagName("input");
        for(const inputNode of inputNodes)
        {
            n.dataset[inputNode.name] = inputNode.checked
        }

        // then fill the config with all data set on the codeblock owner ( = parent of code node)
        config.disabled = n.dataset.disabled.split(",");

        for(const key in config.fb)
        {
            config.fb[key] = (n.dataset["fb" + key] == "true");
        }

        return config;
    }
}
