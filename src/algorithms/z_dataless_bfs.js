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


export { dataless_bfs_traversal }

/**
 * @param {*} initial               - a list C // it can be an iterable (atEnd : bool, next: C) 
 * @param {*} next                  - the next : C → set C
 * @param {*} on_entry              - the callback : C → C → α → ℕ → γ → γ
 * @param {*} memory                - the memory γ
 * @{The known should guarantee set-like behavior}
        @function {*} addIfAbsent             - a function that adds an element and return true if it was added : α → 𝔹
 * @{The frontier object should ensure FIFO discipline}
 * @param {FIFO} frontier 
        * @function {*} enqueue               - a function : C → Unit
        * @function {*} dequeue               - a function producing a C
        * @function {*} isEmpty               - a function testing the emptiness
        * @function {*} layerChanged          - a function that detects layer boundary crossing : 𝔹
        * @function {*} markLayer             - a function that mark the layer boundary
 * 
 * @param {*} bound 
 * @param {*} canonize 
 * @returns {γ} memory
 */
async function dataless_bfs_traversal
(
    initial, next, canonize,
    on_entry, on_known, on_exit, memory,
    addIfAbsent,
    frontier,
)
{
    let atStart  = true;
    
    while (!frontier.isEmpty() || atStart) {
        let source = null;
        let neighbours = null;
        if (atStart) {
            neighbours = initial;
            atStart = false;
        } else {
            source = frontier.dequeue();
            neighbours = await next(source);
        }
        for (let neighbour of neighbours) {
            let canonical_neighbour = await canonize(neighbour);
            if (await addIfAbsent(neighbour, canonical_neighbour)) {
                frontier.enqueue(neighbour);

                //on unknown
                const terminate = await on_entry(source, neighbour, canonical_neighbour, memory);
                if (terminate) return memory;
                continue
            }
            //on_known - is called on sharing-links and back-loops
            const terminate = await on_known(source, neighbour, canonical_neighbour, memory);
            if (terminate) return memory;
            continue;
        }
        //on_exit it is called after all node children are in the frontier
        const terminate = await on_exit(source, memory);
        if (terminate) return memory;
    }
    return memory;
}
