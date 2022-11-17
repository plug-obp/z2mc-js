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

function on_entry(source, neighbour, canonical_neighbour, memory) {
    console.log(
        `${source}->${neighbour}[${canonical_neighbour}]`
    );
    v.size++;
    return false;
}
let v = {size: 0}; 
let known = new LinearScanHashSet(5, (n,s)=>n, (a,b)=>a===b, false);
let frontier = new PingPongCircularBuffer(5);
let r = await dataless_bfs_traversal([1], (n) => g[n], (n)=>n, on_entry, (s,n,cn,m)=>false, (s,m)=>false, v, (n,cn) => known.add(cn), frontier)

console.log("r="+ JSON.stringify(r));

v = {size: 0}; 
known = new LinearScanHashSet(5, (n,s)=>n, (a,b)=>a===b, false);
frontier = new PingPongCircularBuffer(5);
r = await dataless_bfs_traversal([1], (n) => g[n], (n)=>n, on_entry, (s,n,cn,m)=>false, (s,m)=>false, v, (n,cn) => known.add(cn), frontier);

console.log("r="+ JSON.stringify(r));