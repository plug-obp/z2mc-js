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

import { bfs_hashset_predicate_mc_full } from "../z_hashset_predicate_mc.js";

export {nbfs_naive}



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

async function nbfs_naive(initial, next, canonize, acceptingPredicate, hashFn, equalityFn) {
    const tr = {
        initial: ()=>initial, 
        next: next
    }
    let suffix = [];
    async function acceptanceCyclePredicate(c) {
        //if not a buchi accepting-state return false
        if (! await acceptingPredicate(c)) {
            return false;
        }
        //if a buchi accepting state, look for a cycle
        const iop = new Proxy(tr, PreInitializedProxyHandler(() => tr.next(c)));  

        const predicate = (x) => x === c;
        const result = await bfs_hashset_predicate_mc_full(iop, canonize, predicate, hashFn, equalityFn);
        suffix = result.trace;
        //TODO: understand why it does not work with result.verified ?
        return result.trace.length > 0;
    };
    let {verified, trace: prefix, configuration_count} = await bfs_hashset_predicate_mc_full(tr, canonize, acceptanceCyclePredicate, hashFn, equalityFn);

    prefix.reverse();
    suffix.reverse();
    prefix.push(...suffix);
    return {verified, trace: prefix, configuration_count}
}