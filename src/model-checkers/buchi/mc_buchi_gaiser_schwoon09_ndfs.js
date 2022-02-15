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

function GaiserSchwoon_ndfs(initial, next, acceptingPredicate, hashFn, equalityFn, canonize) {
    //we need a map to store the colors
    // - configuration is white ⟺ never touched by dfs_blue 
    // - configuration is cyan ⟺ if its invocation of dfs_blue is still running (in on the stack_blue) and every cyan 
    // config can reach s, for the currently active instance of dfs_blue(s)
    // - configuration is blue ⟺ it is non-accepting and its invocation of dfs_blue has terminated (it was popped from the stack_blue)
    // - configuration is red ⟺ its invocation of dfs_blue has terminated (is was popped from the stack_blue, and is not part of any counterexample)
    // possible transitions: (white ⟶ cyan), (cyan ⟶ blue), (blue ⟶ red), (cyan ⟶ red)
    let known      = new LinearScanHashSet(1024, hashFn, equalityFn, true);
    known.addIfAbsent=(k) => this.add(k, Symbol('cyan'));
    let stack_blue = new UnboundedStack(1024, 2);
    let stack_red  = new UnboundedStack(1024, 2);
    return GaiserSchwoon_dfs_blue(initial, next, acceptingPredicate, known, stack_blue, stack_red, canonize);
}

function GaiserSchwoon_dfs_blue(initial, next, acceptingPredicate, known, stack_blue, stack_red, canonize) {
    function on_entry(s,n,cn,k,st,m) {
        //add an allRed field to the current frame
        const frame = st.peek();
        frame.allRed = true;
        frame.canonical = cn;
        m.cc++;
    }

    function on_node(isNeighbour, s, n, cn, k, st, m) {
        if (isNeighbour) {
            //on neighbour
            if (
                k.get(cn) === Symbol('cyan') 
            && (acceptingPredicate(s) || acceptingPredicate(n))) {
                m.holds = false;
                m.witness = n;
                m.trace = stack_blue.map(e => e.configuration).slice(1).push(n);
                return true;
            }
            return false;
        }
        //on known_neighbour
        if (k.get(cn) !== Symbol('red')) {
            st.peek().allRed = false;
        }
        return false;
    }

    function on_exit(n, k, st, m) {
        const frame = st.peek();
        if (frame.allRed === true) {
            k.add(frame.canonical, Symbol('red'));
            return false;
        }
        //if n is an accepting state dfs_red
        if (acceptingPredicate(n)) {
            const result = GaiserSchwoon_dfs_red([n], next, known, stack_red, canonize);
            k.add(frame.canonical, Symbol('red'));
            return result;
        }
        k.add(frame.canonical, Symbol('blue'));
        return false;
    }
    let memory = {
        holds: true,
        witness: null,
        trace: [],
        cc: 0,
    }
    let {holds, witness, trace, cc} = dataless_dfs_traversal(
        initial, next,
        on_entry, on_node, on_exit, memory,
        known, stack_blue,
        canonize 
    );
    return {verified: !holds, trace: trace, configuration_count: cc}
}

function GaiserSchwoon_dfs_red(initial, next, known, stack, canonize) {

    const parentAddIfAbsent = known.addIfAbsent;
    known.addIfAbsent = (n) => { 
        if (known.get(n) === Symbol('blue')) {
            known.add(n, Symbol('red'));
            return true;
        }
        return false;
    };
    let memory = {
        holds: true,
        witness: null,
        trace: [],
        cc: 0,
    }

    function on_node(isNeighbour, s,n,cn,k,st,m) {
        if (!isNeighbour) return false;
        const color = known.get(cn);
        if (color === Symbol('cyan')) {
            m.holds = false;
            m.witness = n;
            m.trace = stack.map(e => e.configuration);
            return true;
        }
        return false;
    }
    memory = dataless_dfs_traversal(
        initial, next,
        (s,n,cn,k,st,m) => false, on_node, (n,k,st,m)=>false,
        known, stack,
        canonize
    );

    //restore the addIfAbsent for dfs_blue
    known.addIfAbsent = parentAddIfAbsent;
    return memory;
}