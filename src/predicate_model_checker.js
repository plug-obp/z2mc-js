import { generic_bfs } from "./generic_bfs.js";
import { LinearScanHashSet } from "./linear_scan_set";

export { predicateModelChecker }

/**
 * Build a trace from the witness to an initial state.
 * @param {*} witness, the starting node
 * @param {LinearScanHashSet} parents, a map with a parent for each node, except the initial
 */
function getTrace(witness, parents) {

    let initial = [witness];
    let next = (n) => parents.get(n);
    let on_node = (s,n,cn,l,a) => { a.push(n); return false; };
    let o = {
        on_entry: on_node,
        memory: [],
    }

    let witnessTrace = generic_bfs(initial, next, o);
    return witnessTrace;
}

function predicateModelChecker(tr, acceptingPredicate, bound=Number.MAX_SAFE_INTEGER, abstractionFn = (n)=> n) {
    let initial = tr.initial;
    let next    = tr.next;
    function on_node(s,n,cn,l,mem) {
        mem.holds = acceptingPredicate(n);
        mem.witness = a.holds ? n : null;
        mem.parents.add(n, s);
        return a.holds;
    }
    let memory = {
        holds:   true,
        witness: null,
        parents: new LinearScanHashSet(1024, {isMap: true})
    }            
    let o = {
        on_entry: on_node,
        memory: memory,
        bound: bound,
        canonize: abstractionFn,
    }
    let {holds, witness, parents} = generic_bfs(initial, next, o);
    if (holds) {
        let witnessTrace = getTrace(witness, parents);
        return {verified: false, trace: witnessTrace};
    }
    return {verified: true, trace: []};
}