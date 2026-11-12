import ParamList from "./functions/paramList";
import Memory from "./memory";
import Block from "./structure/block";

export default class Function 
{
    name: string;
    block: Block;
    memory: Record<string,any>;

    constructor(n:string, b:Block, m:Record<string,any> = {})
    {
        this.name = n;
        this.block = b;
        this.memory = m;
    }

    call(paramsList:ParamList)
    {
        const functionStatement = this.block.header.getDefinition();
        const paramNames = functionStatement.getParamsAsList(true);
        const paramValues = paramsList.getParamsAsList(false);

        const certainValues = Math.min(paramNames.length, paramValues.length);

        for(let i = 0; i < certainValues; i++)
        {
            const key = paramNames[i];
            const val = paramValues[i];
            this.memory[key] = val;
        }
        return this.block.toResult(true);
    }
}