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



