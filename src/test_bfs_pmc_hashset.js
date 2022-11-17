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

import { aliceBob0, aliceBob1, aliceBob2, peterson } from "./models/graph/graph_alicebob.js";
import { bfs_hashset_predicate_mc_full } from "./model-checkers/z_hashset_predicate_mc.js";


let model = new aliceBob0();
let tr = {
    initial: () => model.initial,
    next: (c) => model.ss[c],
};

/**
 * ALICE && BOB 0
 */
console.log("--->ALICE && BOB 0")
// nothing
let result = await bfs_hashset_predicate_mc_full(tr, (c) => c, (c) => false, (c,s) => c, (a, b) => a === b);
console.log(JSON.stringify(result));

//everything
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, (c) => true, (c,s) => c, (a, b) => a === b);
console.log(JSON.stringify(result));

//exclusion
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, model.exclusion, (c,s) => c, (a, b) => a === b);
console.log("exclusion " + JSON.stringify(result));

//deadlock
let deadlockPred = (c) => tr.next(c).length == 0
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("deadlock " + JSON.stringify(result));

/**
 * ALICE && BOB 1
 */
 console.log("--->ALICE && BOB 1")
 model = new aliceBob1();
 tr = {
     initial: () => model.initial,
     next: (c) => model.ss[c],
 };

//exclusion
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, model.exclusion, (c,s) => c, (a, b) => a === b);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("deadlock " + JSON.stringify(result));

/**
 * ALICE && BOB 2
 */
 console.log("--->ALICE && BOB 2")
 model = new aliceBob2();
 tr = {
     initial: () => model.initial,
     next: (c) => model.ss[c],
 };


//exclusion
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, model.exclusion, (c,s) => c, (a, b) => a === b);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("deadlock " + JSON.stringify(result));

/**
 * PETERSON
 */
 console.log("--->PETERSON")
 model = new peterson();
 tr = {
     initial: () => model.initial,
     next: (c) => model.ss[c],
 };

//exclusion
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, model.exclusion, (c,s) => c, (a, b) => a === b);
console.log("exclusion " + JSON.stringify(result));

//deadlock
deadlockPred = (c) => tr.next(c).length == 0
result = await bfs_hashset_predicate_mc_full(tr, (c) => c, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("deadlock " + JSON.stringify(result));

/**
 * bitstate hashing without a bloom-filter, looses a lot of space
 */
deadlockPred = (c) => tr.next(c).length == 0;
let hash = (c,s) => c%8;
let bloom_size = 3;
let abstraction = (c) => hash(c) % bloom_size;
result = await bfs_hashset_predicate_mc_full(tr, abstraction, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("bitstate deadlock " + JSON.stringify(result));

/**
 * hashcompaction, works perfectly with our implementation.
 */
abstraction = (c) => hash(c);
result = await bfs_hashset_predicate_mc_full(tr, abstraction, deadlockPred, (c,s) => c, (a, b) => a === b);
console.log("hashcompaction deadlock " + JSON.stringify(result));

/**
 * Predicate abstraction
 */
abstraction = (c) => [model.aCS, model.bCS];
result = await bfs_hashset_predicate_mc_full(tr, abstraction, deadlockPred, (c,s) => c[0]+c[1], (a, b) => a[0] === b[0] && a[1]===b[1]);
console.log("predicate under-approximation deadlock " + JSON.stringify(result));

/**
 * counter
 */

tr = {
    initial: () => [[0,0]],
    next: (c)=>(c[0] <= 200 && c[1] <= 200) ? [[c[0]+1, c[1]], [c[0], c[1]+1]] : [],
}

result = await bfs_hashset_predicate_mc_full(tr, (c) => c, (c)=>c[0]==100&&c[1]==50, (c,s) => c[0]+c[1], (a, b) => a[0] === b[0] && a[1]===b[1]);
console.log("two counters " + JSON.stringify(result));
