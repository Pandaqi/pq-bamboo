import Value from "./value"
import MemoryContext from "./memoryContext"

export default class Memory {
    constructor(cfg)
    {
        this.contexts = [];
        this.config = cfg;
    }

    pushContext(block = undefined, data = undefined)
    {
        const ctx = new MemoryContext(block, data);
        this.contexts.push(ctx);
        return ctx.getData();
    }

    popContext()
    {
        return this.contexts.pop();
    }

    getLastContext()
    {
        return this.contexts[this.contexts.length - 1];
    }

    scopeBlockingEnabled()
    {
        return !this.config.disabled.includes("scopeBlock");
    }

    // @IMPROV: just make proper Error classes?
    error(key)
    {
        return new Value("Name **" + key + "** doesn't exist in memory!", "error"); 
    }

    has(key)
    {
        for(let i = this.contexts.length - 1; i >= 0; i--)
        {
            const ctx = this.contexts[i];
            if(ctx.has(key)) { return true; }
            if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
        }
        return false;
    }

    get(key)
    {
        for(let i = this.contexts.length - 1; i >= 0; i--)
        {
            const ctx = this.contexts[i];
            if(ctx.has(key)) { return ctx.get(key); }
            if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
        }
        return this.error(key);
    }

    set(key, val)
    {
        for(let i = this.contexts.length - 1; i >= 0; i--)
        {
            const ctx = this.contexts[i];
            if(ctx.has(key)) { return ctx.set(key, val); }
            if(this.scopeBlockingEnabled() && ctx.blocksScope()) { break; }
        }

        // if we reached here, the value isn't anywhere else yet, so just set it locally
        return this.getLastContext().set(key, val);
    }

    delete(key)
    {
        for(let i = this.contexts.length - 1; i >= 0; i--)
        {
            const ctx = this.contexts[i];
            if(ctx.has(key)) { return ctx.delete(key); }
            if(ctx.blocksScope()) { break; }
        }
        return this.error(key);
    }
}