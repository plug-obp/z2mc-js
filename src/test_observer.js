import {traffic_light_na, traffic_light_observer} from "./models/na/german_traffic_light.js"
import { DependentNASemantics, NASemantics } from "./nondeterministic-automata/nondeterministic_automata_semantics.js";
import { STR2TR } from "./operators/str2tr.js";
import { KripkeBuchiAsymmetricSynchronousProductSemantics } from "./operators/synchronous_product_semantics.js";
import { hashset_predicate_mc } from "./model-checkers/z_hashset_predicate_mc.js";

//create the model semantics
let model = traffic_light_na();
let modelSemantics = new NASemantics(model);

console.log(modelSemantics.initial());

//create the property semantics
let property = traffic_light_observer();
let propertySemantics = new DependentNASemantics(property);

let productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);

let tr = new STR2TR(productSemantics);


let result = hashset_predicate_mc(tr, tr.isAccepting, tr.configurationHashFn, tr.configurationEqFn, Number.MAX_SAFE_INTEGER, (c) => c);
console.log(JSON.stringify(result));