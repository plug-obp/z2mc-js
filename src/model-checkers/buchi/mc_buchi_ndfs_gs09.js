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

export {ndfs_gs09}

/**
 * The improved nested DFS algorithm from [1], Figure 1.
 * [1] Gaiser, Andreas, and Stefan Schwoon. 
 * "Comparison of algorithms for checking emptiness on Büchi automata." 
 * arXiv preprint arXiv:0910.3766 (2009).
 * https://arxiv.org/pdf/0910.3766.pdf 
 * 
 * the pseudocode:
dfs₁(s, k = ∅)
    k = k ∪ { s→cyan }
    allRed = true
    for t ∈ next(s) do
        t.color = k @ t
        if t.color = cyan ∧ (s ∈ A ∨ t ∈ A) then
            report cycle
        end if
        if t ∉ k then
            dfs₁(t, k)
        end if
        if t.color ≠ red then
            allRed = false
        end if
    end for
    if allRed then
        k = k ∪ { s→red}
    else if s ∈ A then
        dfs₂(s, k)
        k = k ∪ { s→red}
    else
        k = k ∪ { s→blue}
    end if

dfs₂(s, k)
    for t ∈ next(s) do 
        t.color = k @ t
        if t.color = cyan then
            report cycle
        if t.color = blue then 
            k = k ∪ { t→red}
            dfs₂ (t, k)
        end if 
    end for
 */

async function ndfs_gs09(initial, next, canonize, acceptingPredicate, hashFn, equalityFn) {
    //we need a map to store the colors
    // - configuration is white ⟺ never touched by dfs_blue 
    // - configuration is cyan ⟺ if its invocation of dfs_blue is still running (in on the stack_blue) and every cyan 
    // config can reach s, for the currently active instance of dfs_blue(s)
    // - configuration is blue ⟺ it is non-accepting and its invocation of dfs_blue has terminated (it was popped from the stack_blue)
    // - configuration is red ⟺ its invocation of dfs_blue has terminated (is was popped from the stack_blue, and is not part of any counterexample)
    // possible transitions: (white ⟶ cyan), (cyan ⟶ blue), (blue ⟶ red), (cyan ⟶ red)
    let known      = new LinearScanHashSet(1024, hashFn, equalityFn, true);
    let stack_blue = new UnboundedStack(1024, 2);
    let stack_red  = new UnboundedStack(1024, 2);
    return dfs_blue(initial, next, canonize, acceptingPredicate, known, stack_blue, stack_red);
}

async function dfs_blue(initial, next, canonize, acceptingPredicate, known, stack_blue, stack_red) {
    //we recurse only if the color is white
    function addIfAbsent(n, nc) {
        if (known.get(nc) === null) {
            known.add(nc, Symbol.for('cyan'));
            return true;
        }
        return false;
    }

    async function hasLoop(s, n, cn, m) {
        if (known.get(cn) === Symbol.for('cyan')
        && (await acceptingPredicate(s) || await acceptingPredicate(n))) {
            m.holds = false;
            m.witness = n;
            m.trace = stack_blue.map(e => e.configuration).slice(1);
            m.trace.push(n);
            return true;
        }
        return false;
    }

    function on_entry(s,n,cn,m) {
        //add an allRed field to the current frame
        const frame = stack_blue.peek();
        frame.allRed = true;
        frame.canonical = cn;
        m.cc++;
        return false;
    }

    async function on_known(s, n, cn, m) {
        if (await hasLoop(s, n, cn, m)) return true;
        //if (n) is not red,
        //the tell its parent (s) it has at least one non red child
        if (known.get(cn) !== Symbol.for('red')) {
            stack_blue.peek().allRed = false;
        }
        return false;
    }

    async function on_exit(n, frame, m) {
        //if all my children are red, make myself red
        if (frame.allRed === true) {
            known.add(frame.canonical, Symbol.for('red'));
            return false;
        }
        //if n is an accepting state dfs_red
        if (await acceptingPredicate(n)) {
            const result = await dfs_red(next(n), next, canonize, known, stack_red);
            if (result.holds) {
                known.add(frame.canonical, Symbol.for('red'));
                return false;
            }
            //i have a counter example
            m.holds = false;
            m.witness = n;
            m.trace = stack_blue.map(e => e.configuration).slice(1);
            m.trace.push(n);
            m.trace.push(...result.trace);
            return true;
        }
        known.add(frame.canonical, Symbol.for('blue'));
        //if i'm not red, tell my parent that i'm not
        if (stack_blue.isEmpty()) return false;
        const parentFrame = stack_blue.peek();
        parentFrame.allRed = false;
        return false;
    }
    let memory = {
        holds: true,
        witness: null,
        trace: [],
        cc: 0,
    }
    let {holds, witness, trace, cc} = await dataless_dfs_traversal(
        initial, next, canonize,
        on_entry, on_known, on_exit, memory,
        addIfAbsent,
        stack_blue
    );
    return {verified: holds, trace: trace, configuration_count: cc}
}

async function dfs_red(initial, next, canonize, known, stack) {
    //we recurse only if the color is blue
    function addIfAbsent(n, nc) {
        if (known.get(nc) === Symbol.for('blue')) {
            known.add(nc, Symbol.for('red'));
            return true;
        }
        return false;
    }
    
    let memory = {
        holds: true,
        witness: null,
        trace: [],
    }

    function on_known(s,n,cn,m) {
        if (known.get(cn) === Symbol.for('cyan')) {
            m.holds = false;
            m.witness = n;
            m.trace = stack.map(e => e.configuration).slice(1);
            m.trace.push(n);
            return true;
        }
        return false;
    }
    return dataless_dfs_traversal(
        initial, next, canonize,
        (s,n,cn,m) => false, on_known, (n,frame,m)=>false, memory,
        addIfAbsent, 
        stack
    );
}