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

import { dataless_bfs_traversal } from "../algorithms/z_dataless_bfs.js";
import { dataless_dfs_traversal } from "../algorithms/z_dataless_dfs.js";

export { bfs_dataless_predicate_mc, dfs_dataless_predicate_mc }

/**
 * 
 * @param {*} tr                    - implements initial : C and next: C → set C 
 * @param {*} acceptingPredicate    - implements C → 𝔹
 * @{The known should guarantee set-like behavior}
        @function {*} addIfAbsent             - a function that adds an element and return true if it was added : α → 𝔹
 * @{The frontier object should ensure FIFO discipline}
 * @param {FIFO} frontier 
        * @function {*} enqueue               - a function : C → Unit
        * @function {*} dequeue               - a function producing a C
        * @function {*} isEmpty               - a function testing the emptiness : 𝔹
 * @{The parentTree should enables build the tree of parents using add(node, parent)}
        * @function {*} add: C → C → Unit
        * @function {*} get: C → C
 * @param {*} bound                 - the bound in term of layers ℕ
 * @param {*} canonize              - the canonicalization/abstraction function C → α
 * @returns {(𝔹,Maybe(list C))}     (true, Nothing), (false, Some(list C))
 */

async function bfs_dataless_predicate_mc(tr, canonize = (n)=> n, acceptingPredicate, known, frontier, parentTree) {
    let initial = await tr.initial();
    let next    = (c) => tr.next(c);

    async function on_node(s,n,cn,mem) {
        mem.holds = await acceptingPredicate(n);
        mem.witness = mem.holds ? n : null;
        mem.configuration_count++;
        if (!mem.parents.contains(n)) { mem.parents.add(n, s); }
        return mem.holds;
    }
    let memory = {
        holds:   true,
        witness: null,
        configuration_count: 0, 
        parents: parentTree
    }            
    let {holds, witness, configuration_count, parents} = await dataless_bfs_traversal(
        initial, next, canonize, 
        on_node, (s,n,cn,m) => false, (s,m) => false, memory,
        (n, cn) => known.add(cn), frontier)
    if (holds) {
        let witnessTrace = getTrace(witness, parents);
        return {verified: false, trace: witnessTrace, configuration_count};
    }
    return {verified: true, trace: [], configuration_count};
}

/**
 * Build a trace from the witness to an initial state.
 * @param witness, the starting node
 * @param parents, a map with a parent for each node, except the initial
 * @{The parentTree should enables build the tree of parents using add(node, parent)}
    * @function {*} add: C → C → Unit
    * @function {*} get: C → C
 */
 function getTrace(witness, parents) {
    let trace = [];
    let parent = witness;
    while (parent != null) {
        trace.push(parent);
        parent = parents.get(parent);
    }
    return trace;
}

async function dfs_dataless_predicate_mc(tr, canonize = (n)=> n, acceptingPredicate, known, stack) {
    let initial = tr.initial();
    let next    = (c) => tr.next(c);

    async function on_entry(s,n,cn,mem) {
        const status = await acceptingPredicate(n);
        if (status) {
            mem.holds = false;
            mem.witness = n;
            mem.trace = stack.map(e => e.configuration).slice(1);
            return true;
        }
        mem.configuration_count++;
        return false;
    };
    let memory = {
        holds:   true,
        witness: null,
        configuration_count: 0, 
        trace: [],
    };     
    let {holds, witness, configuration_count, trace} = await dataless_dfs_traversal(
        initial, next, canonize,
        on_entry, (s,n,cn,m) => false, (s,frame,m) => false, memory, 
        (n, cn) => known.add(cn), stack);
    
    return {verified: holds, trace: trace, configuration_count};
}
