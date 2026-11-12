importScripts("/tutorials/js/lib-pqBamboo.min.js");

function displayFeedback(cfg, fb, res)
{

    let str = '';
    if(fb.length <= 0) { return str; }

    if(cfg.fb.result)
    {
        str += res.print().print({ header: "Result", class: "bamboo-final-result" });
    }

    for(const feedback of fb)
    {
        if(feedback.is("log") && !cfg.fb.log) { continue; }
        if(feedback.is("keyword") && !cfg.fb.keyword) { continue; }
        if(feedback.is("parser") && !cfg.fb.parser) { continue; }
        if(feedback.is("comment") && !cfg.fb.comment) { continue; }
        if((feedback.isLiteral() || feedback.isBag()) && !cfg.fb.value) { continue; }
        str += feedback.print();
    }

    return str;
}

self.addEventListener('message', (ev) => {
    let data = JSON.parse(ev.data);

    let code = data.code;
    let config = data.config;
    let lexer = new PQ_BAMBOO.Lexer(config);
    let tree = lexer.parse(code);
    if(lexer.isInvalid(tree)) { 
        self.postMessage(JSON.stringify({})); 
        return; 
    }

    let text = tree.toString();
    let res = tree.toResult(); 
    let fb = displayFeedback(config, tree.getFeedback(), res);
    
    const messageBack = { result: res, feedback: fb, text: text }
    self.postMessage(JSON.stringify(messageBack));
}, false);