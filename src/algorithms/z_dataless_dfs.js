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

export {dataless_dfs_traversal}

//TODO: do we need a on_node, see green dot in https://upload.wikimedia.org/wikipedia/commons/7/75/Sorted_binary_tree_ALL_RGB.svg 
/**
 * @param {Array C}         initial - a list C 
 * @param {C → set C}       next
 * @param {C → C → α → γ}   on_entry, a callback called the first time the node is discovered
 * @param {C → C → α → γ}   on_node, a callback called for each neighbour of a source node
 * @param {C → γ}           on_exit, a callback called when exiting a node during backtracking
 * @param {γ}               memory, a datastructure passed to the callback, the traversal doesn't touch it
 * @param {Set α}           known, it should implement the addIfAbsent, which has to guarantee a set-like behavior 
 *                              ∀ x ∈ α, known = ∅             → addIfAbsent(known, x) = true  ∧ x ∈ known' 
 *                              ∀ x ∈ α, known ≠ ∅ → x ∉ known → addIfAbsent(known, x) = true  ∧ x ∈ known'
 *                              ∀ x ∈ α, known ≠ ∅ → x ∈ known → addIfAbsent(known, x) = false ∧ x ∈ known'
 * @param {Stack C}         stack, it should implement a stack-like behavior (push, pop, peek, isEmpty)
 * @param {C → α}           canonize
 * @returns {γ}             the memory
 */
async function dataless_dfs_traversal (
    initial, next, canonize,            // graph related
    on_entry, on_known, on_exit, memory,// algorithm related
    addIfAbsent,
    stack
) {
    stack.push( { configuration: null, neighbours: initial, index: 0 } );
    while ( !stack.isEmpty() ) {
        const frame = stack.peek();
        if ( frame.index < frame.neighbours.length ) {
            const neighbour = frame.neighbours[frame.index++];
            const canonical_neighbour = await canonize(neighbour);

            if (await addIfAbsent(neighbour, canonical_neighbour)) {
                stack.push( { configuration: neighbour, neighbours: await next(neighbour), index: 0} );
                //on unknown
                const terminate = await on_entry(frame.configuration, neighbour, canonical_neighbour, memory);
                if (terminate) return memory;
                continue;
            }

            //on known - is called on sharing-links and back-loops
            const terminate = await on_known(frame.configuration, neighbour, canonical_neighbour, memory);
            if (terminate) return memory;
            continue;
        } 
        
        stack.pop();

        const terminate = await on_exit(frame.configuration, frame, memory);
        if (terminate) return memory;
    }
    return memory;
}
