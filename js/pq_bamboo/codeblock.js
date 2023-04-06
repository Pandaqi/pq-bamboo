import SyntaxHighlighter from "./highlighter"
import Config from "./config"

export default class CodeBlock {
    constructor(params)
    {
        this.node = params.node;

        this.setupHTML();

        this.parseResult = this.node.getElementsByClassName("parse-result")[0];
        this.feedback = this.parseResult.getElementsByClassName("parse-result-content")[0];
        this.debug = this.node.getElementsByClassName("bamboo-debug")[0];
        this.configForm = this.node.getElementsByClassName("bamboo-config-container")[0];

        const that = this;

        this.foldNode = this.node.getElementsByClassName("bamboo-fold")[0];
        if(this.isFolded()) {
            this.codeContainer.style.display = 'none';
            this.parseResult.style.display = 'none';
            this.foldNode.addEventListener('click', this.unfold.bind(this));
        } else {
            this.foldNode.style.display = 'none';
        }

        this.configButton = this.node.getElementsByClassName("bamboo-config-btn")[0];
        this.configButton.addEventListener("click", (ev) => {
            const isVisible = that.configForm.style.display == "block";
            
            if(isVisible) { that.configForm.style.display = "none"; }
            else { that.configForm.style.display = "block"; }

            ev.preventDefault();
            ev.stopPropagation();
            return false;
        })

        this.highlighter = new SyntaxHighlighter(this, this.codeInput, this.codeDisplay);
        this.codeInput.addEventListener("input", this.onInput.bind(this));

        const executeAtInit = !this.isFolded();
        if(executeAtInit) { this.onInput(); }
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
        
        this.thread = new Worker(Config.workerURL);
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

    setupHTML()
    {
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
        this.codeInput.setAttribute("spellcheck", false)

        this.setConfigInputs();
        this.removeEmptyLinesAtStart();
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
