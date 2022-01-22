import { LinearScanHashSet      } from "./linear_scan_set.js"
import { PingPongCircularBuffer } from "./pingpong_unbounded_circular_buffer.js";
import { dataless_predicate_mc  } from "./z_dataless_predicate_mc.js"

export {hashset_predicate_mc}

function hashset_predicate_mc(tr, acceptingPredicate, hashFn, hashSeed, equalityFn, bound, canonize) {

    known       = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, false);
    frontier    = new PingPongCircularBuffer(1024);
    parentTree  = new LinearScanHashSet(1024, hashFn, hashSeed, equalityFn, true); 

    return dataless_predicate_mc(tr, acceptingPredicate, known, frontier, parentTree, bound, canonize);
}