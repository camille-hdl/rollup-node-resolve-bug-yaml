# rollup-plugin-node-resolve bug

* `npm install`
* `npm run build`
* `npm run serve`

Circular dependency warning:

```
(!) Circular dependency
node_modules/yaml/browser/dist/schema/Collection.js -> node_modules/yaml/browser/dist/schema/Pair.js -> node_modules/yaml/browser/dist/schema/Collection.js
```

Bug :

```js
// in rollup.config.js
{
    /** ... **/
    plugins: [
        resolve({
            mainFields: ["module", "main", "browser"],
        }),
        commonjs()
    ]
}

// in node_modules/yaml/browser/dist/index.js
export default {
  createNode: createNode,
  defaultOptions: defaultOptions,
  Document: Document,
  parse: parse,
  parseAllDocuments: parseAllDocuments,
  parseCST: parseCST,
  parseDocument: parseDocument,
  stringify: stringify
};

// in dist/main.js
var require$$0 = {
  createNode: createNode,
  defaultOptions: defaultOptions,
  Document: Document$2,
  parse: parse$1,
  parseAllDocuments: parseAllDocuments,
  parseCST: parse,
  parseDocument: parseDocument,
  stringify: stringify
};

var browser = require$$0.default; // ⚠️ require$$0.default is undefined !


// in src/main.js
import YAML from "yaml";
// YAML is undefined

YAML.stringify({ my: "input" }); // error

```


With a different node-resolve config, there is another bug (related to https://github.com/rollup/rollup/issues/3054 ):

Circular dependency warning:

```
(!) Circular dependencies
node_modules/yaml/dist/schema/Collection.js -> node_modules/yaml/dist/schema/Pair.js -> node_modules/yaml/dist/schema/Collection.js
node_modules/yaml/dist/schema/Collection.js -> node_modules/yaml/dist/schema/Pair.js -> /Users/camille/git/bug-rollup-yaml/node_modules/yaml/dist/schema/Collection.js?commonjs-proxy -> node_modules/yaml/dist/schema/Collection.js
```

```js
// in rollup.config.js
{
    /** ... **/
    plugins: [
        resolve({
            mainFields: ["module", "main"], // removed "browser"
        }),
        commonjs()
    ]
}

// in node_modules/yaml/dist/index.js
var _default = {
  createNode,
  defaultOptions,
  Document,
  parse,
  parseAllDocuments,
  parseCST: _parse.default,
  parseDocument,
  stringify
};
exports.default = _default;

// in dist/main.js

// Collection_1$1 is undefined
var _Collection = _interopRequireDefault(Collection_1$1);

// ...later ...
key instanceof _Collection.default; // throws, because _Collection.default is not an object

// ...

var _default = {
  createNode,
  defaultOptions,
  Document,
  parse,
  parseAllDocuments,
  parseCST: _parse.default,
  parseDocument,
  stringify
};
exports.default = _default; // ok


// in src/main.js
import YAML from "yaml";
// YAML is defined

return YAML.stringify(input); // Error, `Collection` isn't available in `Pair`

```