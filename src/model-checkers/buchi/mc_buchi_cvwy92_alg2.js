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

import { dataless_dfs_traversal } from "../algorithms/z_dataless_dfs.js";

/**
 * CVWY92_Algorithm2 is the algorithm 2 from [1]. The recursive pseudocode seems to be:
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

function CVWY92_Algorithm2(initial, next, acceptingPredicate, hashFn, equalityFn, canonize) {
    let known1      = new LinearScanHashSet(1024, hashFn, equalityFn, false);
    let stack1      = new UnboundedStack(1024, 2);
    let known2      = new LinearScanHashSet(1024, hashFn, equalityFn, false);
    let stack2      = new UnboundedStack(1024, 2);
    return CVWY92_Algorithm2_dfs1(initial, next, acceptingPredicate, known1, stack1, known2, stack2, canonize);
}

//the first DFS checks the accepting predicate in postorder (on_exit)
function CVWY92_Algorithm2_dfs1(initial, next, acceptingPredicate, known1, stack1, known2, stack2, canonize) {
    function on_exit_dfs1(n,k,stack,mem) {
        if (acceptingPredicate(n)) {
            let {holds, _, cc, trace} = CVWY92_Algorithm2_dfs2([n], next, (c)=> tr.next(c).find((e) => e === n), known2, stack2, canonize);
            mem.holds = holds;
            mem.witness = mem.holds ? n : null;
            mem.configuration_count += cc;
            mem.trace = mem.holds ? stack.map(e => e.configuration).slice(1).push(n) + trace : [];
            return mem.holds;
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
    let stack1    = new UnboundedStack(1024, 2);
    let {holds, witness, configuration_count, trace} = dataless_dfs_traversal(
        initial, next, 
        (s,n,cn,k,st,m)=>false, (s,n,cn,k,st,m) => false, on_exit_dfs1, memory, 
        known1, stack1, 
        canonize);
    return {verified: !holds, trace: trace, configuration_count};
}

//the second DFS checks the accepting predicate in preorder (on_entry)
function CVWY92_Algorithm2_dfs2(initial, next, acceptingPredicate, known, stack, canonize) {
    function on_entry_dfs2(s,n,cn,stack,mem) {
        if (acceptingPredicate(n)) {
            mem.holds = true;
            mem.witness = n;
            mem.configuration_count += 1;
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
    return dataless_dfs_traversal(
        initial, next, 
        on_entry_dfs2, (s,n,cn,k,st,m) => false, (n,k,st,m)=>false, memory, 
        known, stack, 
        canonize);
}