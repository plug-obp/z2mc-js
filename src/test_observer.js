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

import { traffic_light_na
    , traffic_light_observer_false
    , traffic_light_observer_true
    , se_traffic_light_observer_false
    , se_traffic_light_observer_true
    , test_true } from "./models/na/german_traffic_light.js"
import { DependentNASemantics, NASemantics } from "./nondeterministic-automata/nondeterministic_automata_semantics.js";
import { STR2TR } from "./operators/str/str2tr.js";
import { KripkeBuchiAsymmetricSynchronousProductSemantics, StateEventAsymmetricSynchronousProductSemantics } from "./operators/str/synchronous_product_semantics.js";
import { bfs_hashset_predicate_mc_simple } from "./model-checkers/z_hashset_predicate_mc.js";

//create the model semantics
let model = traffic_light_na();
let modelSemantics = new NASemantics(model);

let property = test_true();
let propertySemantics = new DependentNASemantics(property);
let productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
let tr = new STR2TR(productSemantics);
let result = await bfs_hashset_predicate_mc_simple(tr, (c)=>false);
console.log(JSON.stringify(result));


//create the property semantics
property = traffic_light_observer_false();
propertySemantics = new DependentNASemantics(property);
productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);

//no accepting state -- explore the whole statespace
result = await bfs_hashset_predicate_mc_simple(tr, (c)=>false);
console.log("no accepting" + JSON.stringify(result));

result = await bfs_hashset_predicate_mc_simple(tr, (c)=>tr.isAccepting(c));
console.log(JSON.stringify(result));

property = traffic_light_observer_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = await bfs_hashset_predicate_mc_simple(tr, (c)=>tr.isAccepting(c));
console.log(JSON.stringify(result));

//State-event verification
property = test_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = await bfs_hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c));
console.log(JSON.stringify(result));

property = se_traffic_light_observer_false();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = await bfs_hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c));
console.log(JSON.stringify(result));

//no accepting state -- explore the whole statespace
result = await bfs_hashset_predicate_mc_simple(tr, (c)=>false);
console.log("no accepting" + JSON.stringify(result));

property = se_traffic_light_observer_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = await bfs_hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c));
console.log(JSON.stringify(result));