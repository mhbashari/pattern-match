var global = this;

function match(actual) {
    return {
        as: function(pattern, template, thisArg) {
            return match1(actual, pattern, template, thisArg);
        },
        cases: function(body) {
            var cases = [];
            body(function(pattern, template, thisArg) {
                cases.push({
                    pattern: pattern,
                    template: template,
                    thisArg: thisArg
                });
            });
            for (var i = 0, n = cases.length; i < n; i++) {
                var c = cases[i];
                try {
                    return match1(actual, c.pattern, c.template, c.thisArg);
                } catch (e) {
                    if (e instanceof MatchError)
                        continue;
                    throw e;
                }
            }
            throw new MatchError(cases, actual, "no more cases");
        }
    };
}

function MatchError(expected, actual, message) {
    Error.call(this, message);
    if (!('stack' in this))
        this.stack = (new Error).stack;
    this.expected = expected;
    this.actual = actual;
}

MatchError.prototype = Object.create(Error.prototype);

function match1(actual, pattern, template, thisArg) {
    var matches = {};
    matchPattern(pattern, actual, matches);
    return template
         ? template.call(typeof thisArg === 'undefined' ? global : thisArg, matches)
         : matches;
}
    
function matchPattern(pattern, actual, matches) {
    if (pattern instanceof Pattern) {
        pattern.match(actual, matches);
    } else if (Array.isArray(pattern)) {
        matchArray(pattern, actual, matches);
    } else if (typeof pattern === 'object') {
        if (!pattern)
            matchNull(actual);
        else if (pattern instanceof RegExp)
            matchRegExp(pattern, actual);
        else
            matchObject(pattern, actual, matches);
    } else if (typeof pattern === 'string') {
        matchString(pattern, actual);
    } else if (typeof pattern === 'number') {
        if (pattern !== pattern)
            matchNaN(actual);
        else
            matchNumber(pattern, actual);
    } else if (typeof pattern === 'boolean') {
        matchBoolean(pattern, actual);
    } else if (typeof pattern === 'function') {
        matchPredicate(pattern, actual);
    } else if (typeof pattern === 'undefined') {
        matchUndefined(actual);
    }
}

function matchNull(actual, matches) {
    if (actual !== null)
        throw new MatchError(null, actual, "not null");
}

function matchArray(arr, actual, matches) {
    if (typeof actual !== 'object')
        throw new MatchError(arr, actual, "not an object");
    if (!actual)
        throw new MatchError(arr, actual, "null");
    var n = arr.length;
    for (var i = 0; i < n; i++) {
        if (!(i in actual))
            throw new MatchError(arr, actual, "no element at index " + i);
        matchPattern(arr[i], actual[i], matches);
    }
}

var hasOwn = {}.hasOwnProperty;

function matchObject(obj, actual, matches) {
    if (typeof actual !== 'object')
        throw new MatchError(obj, actual, "not an object");
    if (!actual)
        throw new MatchError(obj, actual, "null");
    for (var key in obj) {
        if (!hasOwn.call(obj, key))
            continue;
        if (!(key in actual))
            throw new MatchError(obj, actual, "no property " + key);
        matchPattern(obj[key], actual[key], matches);
    }
}

function matchString(str, actual) {
    if (typeof actual !== 'string')
        throw new MatchError(str, actual, "not a string");
    if (actual !== str)
        throw new MatchError(str, actual, "wrong string value");
}

function matchRegExp(re, actual) {
    if (typeof actual !== 'string')
        throw new MatchError(re, actual, "not a string");
    if (!re.test(actual))
        throw new MatchError(re, actual, "regexp pattern match failed");
}

function matchNumber(num, actual) {
    if (typeof actual !== 'number')
        throw new MatchError(num, actual, "not a number");
    if (actual !== num)
        throw new MatchError(num, actual, "wrong number value");
}

function matchNaN(actual) {
    if (typeof actual !== 'number' || actual === actual)
        throw new MatchError(NaN, actual, "not NaN");
}

function matchPredicate(pred, actual) {
    if (!pred(actual))
        throw new MatchError(pred, actual, "predicate failed");
}

function matchBoolean(bool, actual) {
    if (typeof actual !== 'boolean')
        throw new MatchError(bool, actual, "not a boolean");
    if (actual !== bool)
        throw new MatchError(bool, actual, "wrong boolean value");
}

function matchUndefined(actual) {
    if (typeof actual !== 'undefined')
        throw new MatchError(undefined, actual, "not undefined");
}

function Pattern() {
}

function Var(name, pattern) {
    this._name = name;
    this._pattern = typeof pattern === 'undefined' ? Any : pattern;
}

Var.prototype = Object.create(Pattern.prototype);

Var.prototype.match = function Var_match(actual, matches) {
    matchPattern(this._pattern, actual, matches);
    matches[this._name] = actual;
};

var Any = Object.create(Pattern.prototype);

Any.match = function Any_match(actual) {
    return actual;
};

match.var = function(name, pattern) {
    return new Var(name, pattern);
};

match.any = Any;

match.object = function(x) {
    return typeof x === 'object' && x;
}

match.array = Array.isArray;

match.primitive = function(x) {
    return x === null || typeof x !== 'object';
};

match.number = function(x) {
    return typeof x === 'number';
};

match.string = function(x) {
    return typeof x === 'string';
};

match.boolean = function(x) {
    return typeof x === 'boolean';
};

match.null = function(x) {
    return x === null;
};

match.undefined = function(x) {
    return typeof x === 'undefined';
};

match.function = function(x) {
    return typeof x === 'function';
};

match.MatchError = MatchError;

module.exports = match;