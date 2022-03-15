// MIT License

// Copyright (c) 2022 Ciprian Teodorov

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { bfs_hashset_predicate_mc_simple } from "./model-checkers/z_hashset_predicate_mc.js";

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
let acceptanceCyclePredicate = async (c) => {
    //if not a buchi accepting-state return false
    if (!tr.isAccepting(c)) {
        return false;
    }
    //if a buchi accepting state, look for a cycle
    const iop = new Proxy(tr, PreInitializedProxyHandler(() => tr.next(c)));  

    const predicate = (x) => x === c;
    const result = await bfs_hashset_predicate_mc_simple(iop, predicate);
    suffix = result.trace;
    //TODO: understand why it does not work with result.verified ?
    return result.trace.length > 0;
};

let {verified, trace: prefix, configuration_count} = await bfs_hashset_predicate_mc_simple(tr, acceptanceCyclePredicate);
console.log(verified);
console.log(JSON.stringify(prefix.reverse()) + " -- " + JSON.stringify(suffix.reverse()));