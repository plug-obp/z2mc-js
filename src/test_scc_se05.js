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

import {scc_se05} from "./model-checkers/buchi/mc_buchi_scc_se05.js"

//create the model semantics
let g = {
    1: [2, 4],
    2: [3],
    3: [1],
    4: [5],
    5: [3]
}
let tr = {
    initial: () => [1],
    next: (c) => g[c],
    isAccepting: (c) => c === 4,
    configurationHashFn: (c) => c,
    configurationEqFn: (a, b) => a === b
};

let result = await scc_se05(
    tr.initial(), tr.next, (c)=>c, 
    tr.isAccepting, 
    tr.configurationHashFn, tr.configurationEqFn);
//trace = [1, 4, [5, 3, 1]]
let expected = '{"verified":false,"trace":[1,4,5,3,1],"configuration_count":5}';
let got = JSON.stringify(result);
console.log("test 1", expected == got);
console.log(result);
console.log(JSON.stringify(result));

tr.isAccepting = (c) => c === 2;

result = await scc_se05(
    tr.initial(), tr.next, (c)=>c, 
    tr.isAccepting, 
    tr.configurationHashFn, tr.configurationEqFn);

expected = '{"verified":false,"trace":[1,2,3,1],"configuration_count":3}';
got = JSON.stringify(result);
console.log("test 2", expected == got);
console.log(result);
console.log(JSON.stringify(result));

tr.isAccepting = (c) => c === 3;

result = await scc_se05(
    tr.initial(), tr.next, (c)=>c, 
    tr.isAccepting, 
    tr.configurationHashFn, tr.configurationEqFn);

expected = '{"verified":false,"trace":[1,2,3,1],"configuration_count":3}';
got = JSON.stringify(result);
console.log("test 3", expected == got);
console.log(result);
console.log(JSON.stringify(result));
