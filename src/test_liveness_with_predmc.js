import { hashset_predicate_mc_simple } from "./model-checkers/z_hashset_predicate_mc.js";

//create the model semantics
let g = {
    1: [3, 2],
    2: [3, 4],
    3: [],
    4: [1, 5],
    5: []
}
let tr = {
    initial: () => [1],
    next: (c) => g[c],
    isAccepting: (c) => c === 2,
    configurationHashFn: (c) => c,
    configurationEqFn: (a, b) => a === b
};

function PreInitializedProxyHandler(initialFn) {
    return {
        get: function(target, prop, receiver) {
            if (prop === "initial") {
                return initialFn;
            }
            return Reflect.get(...arguments);
        }
    };
}

let suffix = [];
let acceptanceCyclePredicate = (c) => {
    //if not a buchi accepting-state return false
    if (!tr.isAccepting(c)) {
        return false;
    }
    //if a buchi accepting state, look for a cycle
    const iop = new Proxy(tr, PreInitializedProxyHandler(() => tr.next(c)));  

    const predicate = (x) => x === c;
    const result = hashset_predicate_mc_simple(iop, predicate, Number.MAX_SAFE_INTEGER);
    suffix = result.trace;
    //TODO: understand why it does not work with result.verified ?
    return result.trace.length > 0;
};

let {verified, trace: prefix, configuration_count} = hashset_predicate_mc_simple(tr, acceptanceCyclePredicate, Number.MAX_SAFE_INTEGER);
console.log(verified);
console.log(JSON.stringify(prefix.reverse()) + " -- " + JSON.stringify(suffix.reverse()));