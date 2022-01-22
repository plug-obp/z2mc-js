import { alicebob0 } from "./models/graph/graph_alicebob.js";
import { hashset_predicate_mc } from "./model-checkers/z_hashset_predicate_mc.js";


let model = new alicebob0();
let tr = {
    initial: model.initial,
    next: (c) => model.ss[c],
};
console.log(model.initial);

let result = hashset_predicate_mc(tr, model.exclusion, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log(JSON.stringify(result));