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

export {NASyntax, NASemantics, DependentNASemantics}

/**
 * non-dependent guards: {1: [{ guard: (i, c) => true, target: 2 }], 2: []}
 * dependent guards: {1: [{ guard: (i, c) => true, target: 2 }], 2: []}
 * @param {*} initial is an array of initial configurations
 * @param {*} delta is a dictionary of fanout with transitions labeled by guards
 * @param {*} accepting is a predicate on configurations defining the accepting configurations (c) => predicate
 * @param {*} isBuchi is a boolean specifying if the NA should be interpreted as a NBA or a NFA (if NFA only predicate verification is enough)
 */
class NASyntax {
    constructor(initial, delta, accepting, isBuchi) {
        this.initial = initial; //should be an array
        this.delta = delta; // {1: {guard: (c) => true, target: 2 }}
        this.accepting = accepting;
        this.isBuchi = isBuchi;
    }
}

class NASemantics {
    constructor(automata) {
        this.automata = automata;
        this.configurationHashFn = configurationHashFn;
        this.configurationEqFn = configurationEqFn;
    }
    initial() {
        return this.automata.initial;
    };
    actions(source) {
        return this.automata.delta[source].filter((gt) => gt.guard(source));
    }
    execute(action, configuration) {
        let { guard, target } = action;
        return [target];
    }
    isAccepting(configuration) {
        return this.automata.accepting(configuration);
    }
}

class DependentNASemantics {
    constructor(automata) {
        this.automata = automata;
        this.configurationHashFn = configurationHashFn;
        this.configurationEqFn = configurationEqFn;
    }
    initial() {
        return this.automata.initial;
    }
    actions(input, source) {
        return this.automata.delta[source].filter((gt) => gt.guard(input, source));
    }
    execute(action, input, configuration) {
        let { guard, target } = action;
        return [target];
    }
    isAccepting(configuration) {
        return this.automata.accepting(configuration);
    }
}

function configurationHashFn(configuration) {
    //the configuration is an integer x ∈ ([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER] ∪ {null})
    return configuration == null ? -1 : configuration;  
}
function configurationEqFn(a, b) {
    return a === b;
}
