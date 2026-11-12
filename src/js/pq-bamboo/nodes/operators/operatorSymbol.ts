import Delimiter from "../delimiter"
import { CodeBlockConfig } from "js/pq_bamboo/codeblock";

export default class OperatorSymbol 
{
    config: CodeBlockConfig;
    symbol: string;
    spaceBefore: Delimiter;
    spaceAfter: Delimiter;

    constructor(cfg:CodeBlockConfig = {}, s1 = "", c = "identity", s2 = "")
    {
        this.config = cfg;
        this.symbol = c;
        if(s1) { this.spaceBefore = new Delimiter(s1, "space"); }
        if(s2) { this.spaceAfter = new Delimiter(s2, "space"); }
    }

    toString()
    {
        if(this.symbol == "identity") { return ""; }
        return "<span class='operator'>"
                    + (this.spaceBefore ? this.spaceBefore.toString() : "")
                    + "<span class='operator-symbol'>" + this.symbol + "</span>" 
                    + (this.spaceAfter ? this.spaceAfter.toString() : "")
                    + "</span>";
    }

    toOriginalString()
    {
        return this.symbol;
    }

    getConfig()
    {
        return this.config;
    }
}