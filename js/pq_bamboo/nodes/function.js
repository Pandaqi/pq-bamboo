export default class Function {
    constructor(n, b, m)
    {
        this.name = n;
        this.block = b;
        this.memory = m;
    }

    call(paramsList)
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