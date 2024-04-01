import FunctionStatement from "./statements/functionStatement"
import Block from "./structure/block";

// @NOTE: _Nothing_ interfaces directly with this, they always use the main memory object
export default class MemoryContext 
{
    block: Block;
    data: Record<string,any>;

    constructor(block = null, data = {})
    {
        this.block = block;
        this.data = data;
    }

    has(key:string)
    {
        return key in this.data;
    }

    get(key:string)
    {
        return this.data[key];
    }

    set(key:string, val:any)
    {
        this.data[key] = val;
        return val;
    }

    delete(key:string)
    {
        delete this.data[key];
    }

    getData()
    {
        return this.data;
    }

    blocksScope()
    {
        if(!this.block) { return false; }
        if(!this.block.header) { return false; }
        return this.block.header.isDefinition(FunctionStatement);
    }
}