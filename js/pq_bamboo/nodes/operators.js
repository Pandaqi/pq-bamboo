import HelpersGeneral from "../helpers/general"
import TypeCoercer from "../helpers/typeCoercer"

export default {

    Identity: {
        toResult(a, _b, val)
        {
            return val.set(a.toResult(), a.type);
        }
    },

    Add: {
        toResult(a,b,val)
        {
            if(a.isBool()) { TypeCoercer.toNumber(a); }
            if(b.isBool()) { TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber()) { 
                return val.set(a.toResult() + b.toResult(), "number");
            }

            return val.set(a.toString() + b.toString(), "string");
        }
    },

    Sub: {
        toResult(a,b,val)
        {
            if(a.isBool()) { TypeCoercer.toNumber(a); }
            if(b.isBool()) { TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() - b.toResult(), "number");
            }

            if(a.isString() && b.isNumber())
            {
                const aVal = a.toResult();
                const bVal = b.toResult();
                return val.set(aVal.slice(0, aVal.length - bVal), "string");
            }

            if(a.isNumber() && b.isString())
            {
                return val.set(b.toResult().slice(a.toResult()), "string");
            }

            if(a.isString() && b.isString())
            {
                let aVal = a.toResult();
                const bVal = b.toResult();
                if(aVal.includes(bVal)) { aVal = aVal.replace(bVal, ""); }
                return val.set(aVal, "string");
            }
        }
    },

    Mult: {
        toResult(a, b, val)
        {
            if(a.isBool()) { TypeCoercer.toNumber(a); }
            if(b.isBool()) { TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() * b.toResult(), "number");
            }

            // the same two things, just reversed
            if(a.isString() && b.isNumber())
            {
                const res = HelpersGeneral.repeatString(a.toResult(), b.toResult());
                return val.set(res, "string");
            }

            if(a.isNumber() && b.isString())
            {
                const res = HelpersGeneral.repeatString(b.toResult(), a.toResult());
                return val.set(res, "string");
            }

            if(a.isString() && b.isString())
            {
                // TODO: define string times string multiplication
            }
        }
    },

    Div: {
        toResult(a, b, val)
        {
            if(a.isBool()) { TypeCoercer.toNumber(a); }
            if(b.isBool()) { TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                if(b.toResult() == 0) { return val.set("Can't divide by zero!", "error"); }
                return val.set(parseFloat(a.toResult()) / parseFloat(b.toResult()), "number");
            }

            // 5 / "cat" = 5/3
            if(a.isNumber() && b.isString())
            {
                const divLength = b.toResult().length;
                return val.set(a.toResult() / divLength, "number");
            }

            // "cat" / 5 = 3/5 (inverse of above)
            // => @TODO: might want this a "string" output as well?
            if(a.isString() && b.isNumber())
            {
                const divLength = a.toResult().length;
                return val.set(b.toResult() / divLength, "number");
            }

            // "fat rat" / "fr" = "at at"
            if(a.isString() && b.isString())
            {
                const res = HelpersGeneral.divideString(a.toResult(), b.toResult());
                return val.set(res, "string");
            }
        }
    },

    Mod: {
        toResult(a, b, val)
        {
            if(a.isBool()) { TypeCoercer.toNumber(a); }
            if(b.isBool()) { TypeCoercer.toNumber(b); }

            if(a.isNumber() && b.isNumber())
            {
                return val.set(a.toResult() % b.toResult(), "number");
            }

            // "hello" % 2 = "h"
            if(a.isString() && b.isNumber())
            {
                const modLength = Math.round(a.toResult().length % b.toResult());
                return val.set(a.toResult().slice(0, modLength), "string");
            }

            // 5 % "hey" = 2
            if(a.isNumber() && b.isString())
            {
                const modLength = b.toResult().length;
                return val.set(a.toResult() % modLength, "number");
            }

            // "fat rat" % "at" = "f r"
            if(a.isString() && b.isString())
            {
                const result = a.toResult().replaceAll(b.toResult(), "");
                return val.set(result, "string");
            }
        }
    },

    Exp: {
        toResult(a, b, val)
        {
            if(a.isNumber() && b.isNumber())
            {
                const res = Math.pow(a.toResult(), b.toResult());
                return val.set(res, "number");
            }

            // @TODO: define it for other types.
        }
    },

    Equals: {
        toResult(a, b, val)
        {
            const coerc = TypeCoercer;
            if(a.isNumber() && b.isString()) { coerc.toNumber(b); }
            if(a.isString() && b.isNumber()) { coerc.toString(b); }
            if(a.isBool()) { coerc.toBool(b); }
            if(b.isBool()) { coerc.toBool(a); }

            return val.set(a.toResult() == b.toResult(), "bool");
        }
    },

    LogicalAnd: {
        toResult(a, b, val)
        {
            TypeCoercer.toBool(a); 
            TypeCoercer.toBool(b); 

            return val.set(a.toResult() && b.toResult(), "bool");
        }
    },

    LogicalOr: {
        toResult(a, b, val)
        {
            TypeCoercer.toBool(a); 
            TypeCoercer.toBool(b); 

            return val.set(a.toResult() || b.toResult(), "bool");
        }
    },

    LogicalNot: {
        toResult(a, b, val)
        {
            TypeCoercer.toBool(a); 
            TypeCoercer.toBool(b); 

            return val.set(!a.toResult(), "bool");
        }
    },

    // @IMPROV: I might allow coercing a string to a number, by giving its LENGTH
    Above: {
        toResult(a, b, val)
        {
            TypeCoercer.toNumber(a); 
            TypeCoercer.toNumber(b); 

            return val.set(a.toResult() > b.toResult(), "bool");
        }
    },

    Below: {
        toResult(a, b, val)
        {
            TypeCoercer.toNumber(a); 
            TypeCoercer.toNumber(b); 

            return val.set(a.toResult() < b.toResult(), "bool");
        }
    },

    Round: {
        toResult(a, val)
        {
            TypeCoercer.toNumber(a);
            return val.set(Math.round(a.toResult()), "number");
        }
    },

    Floor: {
        toResult(a, val)
        {
            TypeCoercer.toNumber(a);
            return val.set(Math.floor(a.toResult()), "number");
        }
    },

    Ceiling: {
        toResult(a, val)
        {
            TypeCoercer.toNumber(a);
            return val.set(Math.ceil(a.toResult()), "number");
        }
    },

    Absolute: {
        toResult(a, val)
        {
            TypeCoercer.toNumber(a);
            return val.set(Math.abs(a.toResult()), "number");
        }
    },

    Number: {
        toResult(a, val)
        {
            TypeCoercer.toNumber(a);
            return val.set(a.toResult(), "number");
        }
    },

    String: {
        toResult(a, val)
        {
            TypeCoercer.toString(a);
            return val.set(a.toResult(), "string");
        }
    },

    UpperCase: {
        toResult(a, val)
        {
            TypeCoercer.toString(a);
            return val.set(a.toResult().toUpperCase(), "string");
        }
    },

    LowerCase: {
        toResult(a, val)
        {
            TypeCoercer.toString(a);
            return val.set(a.toResult().toLowerCase(), "string");
        }
    }
}