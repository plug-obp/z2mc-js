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

import { NASyntax } from "../../nondeterministic-automata/nondeterministic_automata_semantics.js";
export {test_true, traffic_light_na, traffic_light_observer_false, traffic_light_observer_true, se_traffic_light_observer_false, se_traffic_light_observer_true};

/**
 * This is an example from "Principles of model-checking" book. Figure 4.6, page 166 (185 in the pdf)
 */

const GREEN = 0;
const YELLOW = 1;
const RED = 2;
const REDYELLOW = 3;

function traffic_light_na() {
    return new NASyntax(
        [GREEN],
        {
            0: [{guard: (c)=>true, target: YELLOW}],    //green
            1: [{guard: (c)=>true, target: RED}],       //yellow
            2: [{guard: (c)=>true, target: REDYELLOW}], //red
            3: [{guard: (c)=>true, target: GREEN}]      //red/yellow
        },
        (c) => true,
        false
    );
}

function traffic_light_observer_false() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ 
                {guard: (i,c) => i!==RED && i!==YELLOW, target: q0}, 
                {guard: (i,c) => i===RED,               target: q1}, 
                {guard: (i,c) => i===YELLOW && i!==RED, target: qF} ],
        /*q1*/1:[ 
                {guard: (i,c) => i===YELLOW,            target: q1}, 
                {guard: (i,c) => i!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}

function traffic_light_observer_true() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ 
                {guard: (i,c) => i!==RED && i!==YELLOW, target: q0}, 
                {guard: (i,c) => i===RED,               target: qF}, 
                {guard: (i,c) => i===YELLOW && i!==RED, target: q1} ],
        /*q1*/1:[ 
                {guard: (i,c) => i===YELLOW,            target: q1}, 
                {guard: (i,c) => i!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}

function se_traffic_light_observer_false() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ // i.s === i.t+1 
                {guard: (i,c) => i.s!==RED && i.s!==YELLOW, target: q0}, 
                {guard: (i,c) => i.s===RED,               target: q1}, 
                {guard: (i,c) => i.s===YELLOW && i.s!==RED, target: qF} ],
        /*q1*/1:[ 
                {guard: (i,c) => i.s===YELLOW,            target: q1}, 
                {guard: (i,c) => i.s!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}

function se_traffic_light_observer_true() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ 
                {guard: (i,c) => i.s!==RED && i.s!==YELLOW, target: q0}, 
                {guard: (i,c) => i.s===RED,               target: qF}, 
                {guard: (i,c) => i.s===YELLOW && i.s!==RED, target: q1} ],
        /*q1*/1:[ 
                {guard: (i,c) => i.s===YELLOW,            target: q1}, 
                {guard: (i,c) => i.s!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}

function test_true() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[{guard: (i,c) => { console.log(`i=${JSON.stringify(i)}, ${JSON.stringify(c)}`); return true}, target: q0}]
        },
        (c) => false,   //no accepting state
        false
    );
}