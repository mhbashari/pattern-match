## pattern-match

A pattern matching DSL for JavaScript. The module is a function that
takes an arbitrary JavaScript value and tests it against a
*pattern*. If the match succeeds, the result is a *sub-match object*,
which consists of the sub-components of the value that matched named
sub-patterns (using the `var` pattern). If the match fails, a
`MatchError` is thrown.

## Usage

Here's a simple example of using pattern matching to analyze an AST
for a hypothetical language:

```javascript
var match = require('pattern-match');

match(ast).cases(function(when) {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, function(vars) {
        analyzeFunctionCall(vars.callee, vars.args);
    });

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, function(vars) {
        analyzeAssignment(vars.lhs, vars.rhs);
    });

    when({
        type: 'Return',
        arg: match.var('arg')
    }, function(vars) {
        analyzeReturn(vars.arg);
    });
});
```

This will get even sweeter in ES6 with destructuring:

```javascript
var match = require('pattern-match');

match(ast).cases(function(when) {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, function({ callee, args }) {
        analyzeFunctionCall(callee, args);
    });

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, function({ lhs, rhs }) {
        analyzeAssignment(lhs, rhs);
    });

    when({
        type: 'Return',
        arg: match.var('arg')
    }, function({ arg }) {
        analyzeReturn(arg);
    });
});
```

And sweeter still with arrow-functions:

```javascript
var match = require('pattern-match');

match(ast).cases(function(when) {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, ({ callee, args }) => {
        analyzeFunctionCall(callee, args);
    });

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, ({ lhs, rhs }) => {
        analyzeAssignment(lhs, rhs);
    });

    when({
        type: 'Return',
        arg: match.var('arg')
    }, ({ arg }) => {
        analyzeReturn(arg);
    });
});
```


## API

### Entry points

  * **match(x).as(pattern[, template[, thisArg]])**

Match `x` against a single pattern. Returns the result of calling
`template` on the sub-match object with `thisArg` (or the global
object by default) as the binding of `this`. If `template` is not
provided, returns the sub-match object.

  * **match(x).cases(body)**

Match `x` against a sequence of patterns, returning the result of the
first successful match. The cases are provided by the `body` function:

  ** **body(when)**

Provides the cases by calling `when` in the order the cases should be
tried.

  *** **when(pattern[, template[, thisArg]])**

Provides the next case, consisting of a pattern an optional
template. If matching the pattern succeeds, the result is passed to
`template` with `thisArg` bound to `this` (defaults to the global
object). If `template` is not provided, this case produces the
sub-match object.

### Patterns

  * **match.any** - matches any value.
  * **match.primitive** - matches any primitive (non-object) value.
  * **match.object** - matches any non-null object.
  * **match.array** - matches anything `Array.isArray` matches.
  * **match.function** - assumes the pattern is a boolean-valued function and matches any value for which the function returns true.
  * **match.null** - matches the `null` value.
  * **match.undefined** - matches the `undefined` value.
  * **match.boolean** - matches any boolean value.
  * **match.number** - matches any number value.
  * **match.string** - matches any string value.
  * **match.var(name[, pattern])** - matches the `pattern` (defaults to `any`) and saves the value in the sub-match object with property name `name`.
  * **pred(testValue)** - matches any value for which `pred` returns a truthy value.
  * **{ x1: pattern1, ..., xn: patternn }** - matches any object with property names `x1` to `xn` matching patterns `pattern1` to `patternn`, respectively. Only the own properties of the pattern are used.
  * **[ pattern0, ..., patternn ]** - matches any object with property names 0 to n matching patterns `pattern0` to `patternn`, respectively.

### Match errors

  * **match.MatchError** - an object extending `Error` that represents a failed pattern-match.
  ** **e.expected** - the expected pattern.
  ** **e.actual** - the actual value tested.