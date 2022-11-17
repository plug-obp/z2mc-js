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

export {scc_se05}

/**
 * implements the "translation of Couvreur's algorithm" presented in [1] (Fig. 5)
 * [1] Schwoon, Stefan, and Javier Esparza. 
 * "A note on on-the-fly verification algorithms." 
 * In International Conference on Tools and Algorithms for 
 * the Construction and Analysis of Systems, pp. 174-190. 
 * Springer, Berlin, Heidelberg, 2005.
 */

async function scc_se05(initial, next, canonize, acceptingPredicate, hashFn, equalityFn) {
    const known  = new LinearScanHashSet(1024, hashFn, equalityFn, true);
    const stack  = new UnboundedStack(1024, 2);
    const roots  = new UnboundedStack(1024, 2);
    return couv_dfs(initial, next, canonize, acceptingPredicate, known, stack, roots);
}

async function couv_dfs(initial, next, canonize, acceptingPredicate, known, stack, roots) {
    const memory = {
        count: 0,
        holds: true,
        witness: null,
        trace: [],
        cc: 0
    }

    function addIfAbsent(n, nc) {
        if (known.get(nc) === null) {
            memory.count++;
            known.add(nc, {dfsnum: memory.count, current: true});
            return true;
        }
        return false;
    }

    function on_entry(s, n, nc, m) {
        stack.peek().canonical = nc;
        roots.push({n, nc});
        m.cc++;
        return false;
    }

    async function on_known(s, t, tc, m) {
        const value = known.get(tc);
        if (value.current === true) {
            let u;
            let uc;
            do {
                const pair = roots.pop();
                u = pair.n;
                uc = pair.nc;
                if (await acceptingPredicate(u)) {
                    m.holds = false
                    m.witness = u;
                    //the callstack has a path ```s₀ ⟶* u ⟶* s → t```
                    m.trace = stack.map(e => e.configuration).slice(1);
                    m.trace.push(t);
                    //TODO: to complete the cycle we need a path ```t ⟶* u```
                    //solution 1: simple DFS within the non-removed states starting at u 
                        //(the current bit can be used to mark the visited states)
                    //solution 2: search for any state on the call stack whose number is at most t.dfsnum
                        //this may lead to smaller counter examples but requires marking the states that are on the stack
                    return true;
                }
            } while (known.get(uc).dfsnum <= value.dfsnum);
            roots.push({n: u, nc: uc});
        }
        return false;
    }

    async function on_exit(n, frame, m) {
        if (n === null) return false;
        memory.count--;
        if (roots.isEmpty()) return false;
        if (roots.peek().n === n) {
            roots.pop();

            //TODO: the algorithm in [1] has a bug. we need to understand how to fix it.
            //
            console.log("-->"+ n);
            if (await acceptingPredicate(n)) {
                m.holds = false
                m.witness = n;
                //the callstack has a path ```s₀ ⟶* u ⟶* s → t```
                m.trace = stack.map(e => e.configuration).slice(1);
                m.trace.push(n);
                //TODO: to complete the cycle we need a path ```t ⟶* u```
                //solution 1: simple DFS within the non-removed states starting at u 
                    //(the current bit can be used to mark the visited states)
                //solution 2: search for any state on the call stack whose number is at most t.dfsnum
                    //this may lead to smaller counter examples but requires marking the states that are on the stack
                return true;
            }


            await remove(n, frame.canonical);
        }
        return false;
    }

    //TODO: the remove function could use the dfs instead of recursivity
    async function remove(s, sc) {
        const value = known.get(sc);
        if (value === null || value.current !== true) return;
        value.current = false;
        for (const t of next(s)) {
            remove(t, await canonize(t));
        }

    }

    let {count, holds, witness, trace, cc} = await dataless_dfs_traversal(
        initial, next, canonize,
        on_entry, on_known, on_exit, memory,
        addIfAbsent, stack
    );
    return {verified: holds, trace: trace, configuration_count: cc};
}