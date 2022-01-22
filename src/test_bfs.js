import { dataless_bfs_traversal } from "./algorithms/z_dataless_bfs.js"
import { LinearScanHashSet } from "./datastructures/linear_scan_set.js";
import { PingPongCircularBuffer } from "./datastructures/pingpong_unbounded_circular_buffer.js";

let g = {
    1: [3, 2],
    2: [3, 4],
    3: [],
    4: [1, 5],
    5: []
}

function on_entry(source, neighbour, canonical_neighbour, layer, memory) {
    console.log(
        `${source}->${neighbour}[${canonical_neighbour}] @ layer ${layer}`
    );
    v.size++;
    return false;
}
let v = {size: 0}; 
let known = new LinearScanHashSet(5, (n,s)=>n, 0, (a,b)=>a===b, false);
let frontier = new PingPongCircularBuffer(5);
let r = dataless_bfs_traversal([1], (n) => g[n], on_entry, v, known, frontier, Number.MAX_SAFE_INTEGER, (n)=>n)

console.log("r="+ JSON.stringify(r));

v = {size: 0}; 
known = new LinearScanHashSet(5, (n,s)=>n, 0, (a,b)=>a===b, false);
frontier = new PingPongCircularBuffer(5);
r = dataless_bfs_traversal([1], (n) => g[n], on_entry, v, known, frontier, 3, (n)=>n);

console.log("r="+ JSON.stringify(r));