import { dataless_bfs_traversal } from "../algorithms/z_dataless_bfs.js";

export { dataless_predicate_mc }

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

function dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound=Number.MAX_SAFE_INTEGER, canonize = (n)=> n) {
    let initial = tr.initial;
    let next    = tr.next;
    function on_node(s,n,cn,l,mem) {
        mem.holds = acceptingPredicate(n);
        mem.witness = mem.holds ? n : null;
        if (!mem.parents.contains(n)) { mem.parents.add(n, s); }
        return mem.holds;
    }
    let memory = {
        holds:   true,
        witness: null,
        parents: parentTree
    }            
    let {holds, witness, parents} = dataless_bfs_traversal(initial, next, on_node, memory, known, frontier, bound, canonize)
    if (holds) {
        let witnessTrace = getTrace(witness, parents);
        return {verified: false, trace: witnessTrace};
    }
    return {verified: true, trace: []};
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