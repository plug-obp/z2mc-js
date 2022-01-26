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

import lodash from 'lodash';
const { isEqual } = lodash;
import hash from 'object-hash';


import {LinearScanHashSet} from './datastructures/linear_scan_set.js'
import xxhash32 from "./typeHasher.js";

let theSet = new LinearScanHashSet(5, xxhash32, 2, (a, b)=> a === b, false);
theSet.add(1);
theSet.add(2);
theSet.add(1);
theSet.add([1, 2]);
theSet.add([1, 2]);
let x = [2, 3];
theSet.add(x);
theSet.add(x);
theSet.add({x:2});
console.log(`The set:${theSet}`);
console.log(`The size is : ${theSet.size()} contains [1,2]: ${theSet.contains([1,2])}`);

console.log(`---------------------------------------------------------`)

let dirtyHash = (e, seed) => {return Number(BigInt.asUintN(32, BigInt("0x"+hash(e))));};
theSet = new LinearScanHashSet(5, dirtyHash, 2, isEqual, false);

console.log(`The set:${theSet}`);

theSet.add(1);
theSet.add(2);
theSet.add(1);
theSet.add([1, 2]);
theSet.add([1, 2]);
theSet.add(x);
theSet.add(x);
theSet.add({x:2});
console.log(`The set:${theSet}`);
console.log(`The size is : ${theSet.size()} contains [1,2]: ${theSet.contains([1,2])}`);


console.log(`---------------------------------------------------------`);


theSet = new Set();
theSet.add(1);
theSet.add(2);
theSet.add(1);
theSet.add([1, 2]);
theSet.add([1, 2]);
theSet.add(x);
theSet.add(x);
theSet.add({x:2});
console.log(theSet);
console.log(`The size is : ${theSet.size} contains [1,2]: ${theSet.has([1,2])}`);



