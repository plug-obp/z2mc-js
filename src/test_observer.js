import { traffic_light_na
    , traffic_light_observer_false
    , traffic_light_observer_true
    , se_traffic_light_observer_false
    , se_traffic_light_observer_true
    , test_true } from "./models/na/german_traffic_light.js"
import { DependentNASemantics, NASemantics } from "./nondeterministic-automata/nondeterministic_automata_semantics.js";
import { STR2TR } from "./operators/str2tr.js";
import { KripkeBuchiAsymmetricSynchronousProductSemantics, StateEventAsymmetricSynchronousProductSemantics } from "./operators/synchronous_product_semantics.js";
import { hashset_predicate_mc_simple } from "./model-checkers/z_hashset_predicate_mc.js";

//create the model semantics
let model = traffic_light_na();
let modelSemantics = new NASemantics(model);

let property = test_true();
let propertySemantics = new DependentNASemantics(property);
let productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
let tr = new STR2TR(productSemantics);
let result = hashset_predicate_mc_simple(tr, (c)=>false, Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));


//create the property semantics
property = traffic_light_observer_false();
propertySemantics = new DependentNASemantics(property);
productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);

//no accepting state -- explore the whole statespace
result = hashset_predicate_mc_simple(tr, (c)=>false, Number.MAX_SAFE_INTEGER);
console.log("no accepting" + JSON.stringify(result));

result = hashset_predicate_mc_simple(tr, (c)=>tr.isAccepting(c), Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));

property = traffic_light_observer_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new KripkeBuchiAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = hashset_predicate_mc_simple(tr, (c)=>tr.isAccepting(c), Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));

//State-event verification
property = test_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c), Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));

property = se_traffic_light_observer_false();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c), Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));

//no accepting state -- explore the whole statespace
result = hashset_predicate_mc_simple(tr, (c)=>false, Number.MAX_SAFE_INTEGER);
console.log("no accepting" + JSON.stringify(result));

property = se_traffic_light_observer_true();
propertySemantics = new DependentNASemantics(property);
productSemantics = new StateEventAsymmetricSynchronousProductSemantics(modelSemantics, propertySemantics);
tr = new STR2TR(productSemantics);
result = hashset_predicate_mc_simple(tr, (c) => tr.isAccepting(c), Number.MAX_SAFE_INTEGER);
console.log(JSON.stringify(result));