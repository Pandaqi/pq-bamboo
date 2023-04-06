import Value from "../value"
import Bag from "../dataTypes/bag"

export default class BambooKeyword {
    constructor(l, k1, k2)
    {
        this.lexer = l;
        this.keyword1 = k1;
        this.keyword2 = k2;
    }

    toString()
    {
        return "<span class='bamboo-keyword'>"
                + this.keyword1.toString()
                + this.keyword2.toString()
                + "</span>";
    }

    toResult()
    {
        const key = this.keyword2.toString();
        
        if(key == "random") { return new Value(Math.random(), "number"); }

        if(key == "time") {
            const newBag = new Bag("time");
            const date = new Date();
            const settings = { 
                year: "getFullYear",
                month: "getMonth",
                day: "getDate",
                hours: "getHours",
                minutes: "getMinutes",
                seconds: "getSeconds",
                milliseconds: "getMilliseconds"
            };
            for(const [key,func] of Object.entries(settings))
            {
                const val = new Value(date[func](), "number");
                val.setLabel(key);
                newBag.addValue(val);
            }

            return newBag;
        }
        
        const val = this.getBambooMemory(key);
        if(!val) { return new Value("There's no **Bamboo** global with the name **" + key + "**", "error"); }
        return val;
    }
    
    getBambooMemory(key)
    {
        return this.lexer.getBambooMemory(key);
    }
}