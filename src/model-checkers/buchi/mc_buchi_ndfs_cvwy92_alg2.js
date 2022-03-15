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

import { dataless_dfs_traversal } from "../../algorithms/z_dataless_dfs.js";
import { LinearScanHashSet      } from "../../datastructures/linear_scan_set.js"
import { UnboundedStack         } from "../../datastructures/unbounded_stack.js";

export {ndfs_cvwy92_alg2}

/**
 * CVWY92_Algorithm2 is the algorithm 2 from [1]. 
 * The recursive pseudocode seems to be:
```
dfs₁(s, k₁ = ∅, k₂ = ∅)
    k₁ = k₁ ∪ { s }
    for t ∈ next(s) do
        if t ∉ k₁ then
            dfs₁(t, k₁, k₂)
        end if
    end for
    if s ∈ accepting then
        dfs₂(s, s, k₂)
    end if

dfs₂(s, seed, k₂)
    k₂ = k₂ ∪ { s }
    if seed ∈ next(s) then
        report violation
    end if
    for t ∈ next(s) do 
        if t ∉ k₂ then 
            dfs₂ (t, k₂)
        end if 
    end for
```
 * [1] Courcoubetis, Costas, Moshe Vardi, Pierre Wolper, and Mihalis Yannakakis. 
 * "Memory-efficient algorithms for the verification of temporal properties." 
 * Formal methods in system design 1, no. 2 (1992): 275-288.
 */

async function ndfs_cvwy92_alg2(initial, next, canonize, acceptingPredicate, hashFn, equalityFn) {
    let known1      = new LinearScanHashSet(1024, hashFn, equalityFn, false);
    let stack1      = new UnboundedStack(1024, 2);
    let known2      = new LinearScanHashSet(1024, hashFn, equalityFn, false);
    let stack2      = new UnboundedStack(1024, 2);
    return dfs1(initial, next, canonize, acceptingPredicate, known1, stack1, known2, stack2);
}

//the first DFS checks the accepting predicate in postorder (on_exit)
async function dfs1(initial, next, canonize, acceptingPredicate, known1, stack1, known2, stack2) {
    function addIfAbsent(n, nc) {
        return known1.add(nc);
    }
    async function on_entry(s,n,nc,m) {
        m.cc++;
        return false;
    }
    async function on_exit(n, frame, mem) {
        if (await acceptingPredicate(n)) {
            let result = await dfs2(n, next, canonize, known2, stack2);
            if (result.holds) {
                return false;
            }
            mem.holds = false;
            mem.witness = n;
            mem.trace = stack1.map(e => e.configuration).slice(1);
            mem.trace.push(...result.trace);
            return true;
        }
        return false;
    };
    let memory = {
        holds:   true,
        witness: null,
        trace: [],
        cc: 0, 
    };
    let {holds, witness, trace, cc} = await dataless_dfs_traversal(
        initial, next, canonize,
        on_entry, (s,n,cn,m) => false, on_exit, memory, 
        addIfAbsent, stack1);
    return {verified: holds, trace: trace, configuration_count: cc};
}

//the second DFS checks the accepting predicate in preorder (on_entry)
async function dfs2(seed, next, canonize, known, stack) {
    function addIfAbsent(n, nc) {
        return known.add(nc);
    }
    async function on_entry(s,n,cn,mem) {
        //if seed ∈ next(s) then report violation
        if (await next(n).find((e) => e === seed)) {
            mem.holds = false;
            mem.witness = seed;
            mem.trace = stack.map(e => e.configuration).slice(1);
            mem.trace.push(seed);
            return true;
        }
        return false;
    };
    let memory = {
        holds:   true,
        witness: null,
        trace: [],
    };     
    return dataless_dfs_traversal(
        [seed], next, canonize,
        on_entry, (s,n,cn,m) => false, (n,frame,m)=>false, memory, 
        addIfAbsent, stack);
}