import { LinearScanHashSet      } from "../datastructures/linear_scan_set.js"
import { PingPongCircularBuffer } from "../datastructures/pingpong_unbounded_circular_buffer.js";
import { dataless_predicate_mc  } from "./z_dataless_predicate_mc.js"

export {hashset_predicate_mc}

function hashset_predicate_mc(tr, acceptingPredicate, hashFn, hashSeed, equalityFn, bound, canonize) {

    let known       = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, false);
    let frontier    = new PingPongCircularBuffer(1024);
    let parentTree  = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, true); 

    return dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound, canonize);
}

//TODO: implement a real bloom-filter
function bloom_predicate_mc(tr, acceptingPredicate, hashFn, hashSeed, bound, canonize) {

    let known       = new BloomFilter(1024);
    let frontier    = new PingPongCircularBuffer(1024);
    let parentTree  = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, true); 

    return dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound, canonize);
}

//TODO: implement a real BDD
// marshaller should be something that transforms a configuration in a boolean array (maybe the SLI marshaller and we handle it here ?)
function bdd_predicate_mc(tr, acceptingPredicate, marshaller, bound, canonize) {

    let known       = new BDD(1024);
    let frontier    = new PingPongCircularBuffer(1024);
    let parentTree  = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, true); 
    let bdd_canonize = (c) => project(canonize(c))
    return dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound, bdd_canonize);
}

//TODO: implement a real minimal DFA
// marshaller should be something that can iterate over the configuration contents to produce an array of letters for the DFA.
function dfa_predicate_mc(tr, acceptingPredicate, configuration_iterator, bound, canonize) {

    let known       = new MinimalDFA(1024);
    let frontier    = new PingPongCircularBuffer(1024);
    let parentTree  = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, true); 
    let dfa_canonize = (c) => configuration_iterator(canonize(c))
    return dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound, canonize);
}