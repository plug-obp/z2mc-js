import { aliceBob0, aliceBob1, aliceBob2, peterson } from "./models/graph/graph_alicebob.js";
import { hashset_predicate_mc } from "./model-checkers/z_hashset_predicate_mc.js";


let model = new aliceBob0();
let tr = {
    initial: model.initial,
    next: (c) => model.ss[c],
};

/**
 * ALICE && BOB 0
 */
console.log("--->ALICE && BOB 0")
// nothing
let result = hashset_predicate_mc(tr, (c) => false, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log(JSON.stringify(result));

//everything
result = hashset_predicate_mc(tr, (c) => true, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log(JSON.stringify(result));

//exclusion
result = hashset_predicate_mc(tr, model.exclusion, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("exclusion " + JSON.stringify(result));

//deadlock
let deadlockPred = (c) => tr.next(c).length == 0
result = hashset_predicate_mc(tr, deadlockPred, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("deadlock " + JSON.stringify(result));

/**
 * ALICE && BOB 1
 */
 console.log("--->ALICE && BOB 1")
 model = new aliceBob1();
 tr = {
     initial: model.initial,
     next: (c) => model.ss[c],
 };

//exclusion
result = hashset_predicate_mc(tr, model.exclusion, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = hashset_predicate_mc(tr, deadlockPred, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("deadlock " + JSON.stringify(result));

/**
 * ALICE && BOB 2
 */
 console.log("--->ALICE && BOB 2")
 model = new aliceBob2();
 tr = {
     initial: model.initial,
     next: (c) => model.ss[c],
 };


//exclusion
result = hashset_predicate_mc(tr, model.exclusion, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = hashset_predicate_mc(tr, deadlockPred, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("deadlock " + JSON.stringify(result));

/**
 * PETERSON
 */
 console.log("--->PETERSON")
 model = new peterson();
 tr = {
     initial: model.initial,
     next: (c) => model.ss[c],
 };
 

//exclusion
result = hashset_predicate_mc(tr, model.exclusion, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = hashset_predicate_mc(tr, deadlockPred, (c,s) => c, 0, (a, b) => a === b, Number.MAX_SAFE_INTEGER, (c) => c);
console.log("deadlock " + JSON.stringify(result));