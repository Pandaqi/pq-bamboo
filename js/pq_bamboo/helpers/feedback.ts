import Value from "../nodes/value";

interface FeedbackPrintParams
{
    header?: string
    class?: string
}

export { Feedback, FeedbackPrintParams }
export default class Feedback 
{
    value: string;
    type: string;
    lineNumber: number;

    constructor(valueNode:Value, lineNumber:number)
    {
        this.value = valueNode.value.toString();
        this.type = valueNode.type;
        this.lineNumber = lineNumber;
    }

    printPretty(text:string)
    {
        text = text.replace(/\_(.*?)\_/g, "<em>$1</em>");
        text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return text;
    }

    capitalize(text:string)
    {
        return text.slice(0,1).toUpperCase() + text.slice(1);
    }

    print(params:FeedbackPrintParams = {})
    {
        let str = this.printPretty(this.value);
        let lineNum = "<span class='line-num'>" + this.lineNumber + "</span>"
        if(!this.lineNumber) { lineNum = ""; }

        let header = params.header || this.capitalize(this.type)
        header += " > ";

        let cssClass = "bamboo-feedback-" + this.type;
        if(params.class) { cssClass += " " + params.class; }

        return "<div class='bamboo-feedback'>"
                + "<div class='" + cssClass + "'>"
                + lineNum
                + header
                + str
                + "</div>"
                + "</div>"
    }

    is(type:string)
    {
        return this.type == type;
    }

    isLiteral()
    {
        return this.type == "bool" || this.type == "number" || this.type == "string"
    }

    isBag()
    {
        return this.type == "bag"
    }
}
