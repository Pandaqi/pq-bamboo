export default class SyntaxHighlighter {
    constructor(bb, codeInput, codeDisplay)
    {
        this.bambooBlock = bb;
        this.codeInput = codeInput;
        this.codeDisplay = codeDisplay;
        this.codeInput.addEventListener("keydown", this.handleCustomKeys.bind(this));
        this.enabled = true;
        this.selection;
        this.content;
        this.method = "textarea"; // textarea or editable
        
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    SelectionResult = class {
        constructor(aI, fI, cI)
        {
            this.anchorIndex = aI;
            this.focusIndex = fI;
            this.currentIndex = cI;
        }
    }

    updateDimensions()
    {
        if(this.method != "textarea") { return; }

        const finalHeight = this.codeDisplay.getBoundingClientRect().height + "px";
        this.codeDisplay.parentNode.style.height = finalHeight;
        this.codeInput.style.height = finalHeight;
    }

    setEnabled(val)
    {
        this.enabled = val;
    }

    handleTab(ev)
    {
        const isTab = (ev.key == "Tab");
        if(!isTab) { return; }
        
        ev.preventDefault(); 
        ev.stopPropagation();

        const n = this.codeInput;
        const code = n.value;
        let beforeTab = code.slice(0, n.selectionStart);
        let afterTab = code.slice(n.selectionEnd, n.value.length);
        let cursorPos = n.selectionEnd + 1;

        // @NOTE: we could add "\t" character here, but for some reason the spacing of that is
        // inconsistent between textarea and div, so I chose the safe option and just use one non-breaking space
        n.value = beforeTab + "\u00a0" + afterTab;

        n.selectionStart = cursorPos;
        n.selectionEnd = cursorPos;

        n.focus();
        this.bambooBlock.onInput();
        
        /*
        
        const sel = window.getSelection();
        const range = sel.rangeCount ? sel.getRangeAt(0) : null;
        if(!range) { return true; }

        let updateSelection = false;
        let newNode;

        const isTabKey = (ev.key == "Tab");
        if(isTabKey) {
            const tabString = Config.tabCharacter.repeat(Config.tabSize);
            newNode = document.createTextNode(tabString);
            range.insertNode(newNode);
            updateSelection = true;
            ev.handled = true;
        }

        
        if(updateSelection)
        {
            ev.preventDefault();
            ev.stopPropagation();

            range.setEndAfter(newNode); 
            range.setStartAfter(newNode);
            sel.removeAllRanges();
            sel.addRange(range);

            this.node.focus();
            this.bambooBlock.onInput();
            return false;
        }

        */
    }

    handleEnter(ev)
    {
        return false;

        /*

        const isEnterKey = (ev.key == "Enter" && !ev.shiftKey) // SHIFT+ENTER does what's below by default, so this would double do it!
        if(isEnterKey)
        {
            //const insertionNode = range.commonAncestorContainer.parentNode;
            newNode = document.createTextNode("\n");            
            range.insertNode(newNode);

            console.log(range);
            updateSelection = true;
            ev.handled = true; // somehow, it fires twice otherwise?!?!
        }

        */
    }

    handleCustomKeys(ev)
    {
        if(!ev) { return true; }
        if(ev.handled) { return true; }

        this.handleTab(ev);
        this.handleEnter(ev);
    }

    getTextareaWithoutStyling()
    {
        let original = this.codeInput.value; 
        let lines = original.split("\n");
        for(let i = 0; i < lines.length; i++)
        {
            lines[i] = "<span class='single-line-container'><span class='single-line'>"
                        + "<span class='line-number'>" + (i+1) + "</span>"
                        + "<span class='statement'>" 
                        + lines[i] + 
                        "</span></span></span>";
        }
        return lines.join("\n");
    }

    prepareStyling()
    {
        if(this.method == "textarea") { 
            this.codeDisplay.innerHTML = this.getTextareaWithoutStyling();
            return this.codeInput.value 
        };

        if(this.method == "editable") {
            const {selection, content} = this.getSelectionAndContent();
            this.selection = selection;
            this.content = content;
            return content;
        }
    }

    finishStyling(parsedText)
    {
        if(!this.enabled) { return; }
        if(this.method == "textarea") { this.renderParsedText(parsedText); }
        if(this.method == "editable" && parsedText) { 
            this.renderParsedTextContentEditable(parsedText);
            this.restoreSelection(this.selection); 
        }
    }

    getSelectionAndContent()
    {
        const sel = window.getSelection();
        const textSegments = this.getTextSegments();
        
        let anchorIndex = null;
        let focusIndex = null;
        let currentIndex = 0;

        textSegments.forEach(({text, node}) => {
            if (node === sel.anchorNode) { anchorIndex = currentIndex + sel.anchorOffset; }
            if (node === sel.focusNode) { focusIndex = currentIndex + sel.focusOffset; }
            currentIndex += text.length;
        });

        // if no selection found, we must be at the end of the full selection!
        if(anchorIndex == null) { anchorIndex = currentIndex; }
        if(focusIndex == null) { focusIndex = currentIndex; }

        const selection = new this.SelectionResult(anchorIndex, focusIndex, currentIndex);
        const content = textSegments.map(({text}) => text).join('');

        return {selection, content};
    }

    restoreSelection(selection)
    {
        const absoluteAnchorIndex = selection.anchorIndex;
        const absoluteFocusIndex = selection.focusIndex;

        const sel = window.getSelection();
        const textSegments = this.getTextSegments();
        
        let anchorNode = this.node;
        let focusNode = this.node;
        let anchorIndex = 0;
        let focusIndex = 0;
        let currentIndex = 0;

        textSegments.forEach(({text, node}) => {
            const startIndexOfNode = currentIndex;
            const endIndexOfNode = startIndexOfNode + text.length;
            
            if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
                anchorNode = node;
                anchorIndex = absoluteAnchorIndex - startIndexOfNode;
            }
            
            if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
                focusNode = node;
                focusIndex = absoluteFocusIndex - startIndexOfNode;
            }
            
            currentIndex += text.length;
            lastText = text;
            lastNode = node;
        });
        
        sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
        this.node.focus();
    }

    getTextSegments(parentNode = this.node)
    {
        const textSegments = [];
        const childNodes = Array.from(parentNode.childNodes);

        childNodes.forEach((node) => {
            switch(node.nodeType) {
                case Node.TEXT_NODE:
                    textSegments.push({ text: node.nodeValue, node });
                    break;
                    
                case Node.ELEMENT_NODE:
                    textSegments.splice(textSegments.length, 0, ...(this.getTextSegments(node)));
                    break;
                    
                default:
                    throw new Error(`Unexpected node type: ${node.nodeType}`);
            }
        });

        return textSegments;
    }
    
    renderParsedText(parsedText)
    {
        this.updateDimensions();
        if(!parsedText || parsedText == "") { return; }
        this.codeDisplay.innerHTML = parsedText;
    }

    renderParsedTextContentEditable(parsedText) 
    {
        if(!parsedText || parsedText == "") { return; }
        this.node.innerHTML = parsedText;
        this.node.innerHTML += "<br/><br/>";

        // for some goddamn reason, browsers need this, otherwise it ALL GOES WRONG
        // @SOURCE: https://www.artificialworlds.net/blog/2022/09/13/tips-for-contenteditables/
        // @NOTE: block was first: this.node.getElementsByClassName("block")[0]
    }

}