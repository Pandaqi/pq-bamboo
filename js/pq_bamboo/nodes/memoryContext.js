import FunctionStatement from "./statements/functionStatement"

// @NOTE: _Nothing_ interfaces directly with this, they always use the main memory object
export default class MemoryContext {
    constructor(block = null, data = {})
    {
        this.block = block;
        this.data = data;
    }

    has(key)
    {
        return key in this.data;
    }

    get(key)
    {
        return this.data[key];
    }

    set(key, val)
    {
        this.data[key] = val;
        return val;
    }

    delete(key)
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