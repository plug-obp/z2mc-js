
/**
 * non-dependent guards: {1: [{ guard: (i, c) => true, target: 2 }], 2: []}
 * dependent guards: {1: [{ guard: (i, c) => true, target: 2 }], 2: []}
 * @param {*} initial is an array of initial configurations
 * @param {*} delta is a dictionary of fanout with transitions labeled by guards
 * @param {*} accepting is a predicate on configurations defining the accepting configurations (c) => predicate
 * @param {*} isBuchi is a boolean specifying if the NA should be interpreted as a NBA or a NFA 
 */
function NASyntax(initial, delta, accepting, isBuchi) {
    this.initial    = initial;  //should be an array
    this.delta      = delta;    // {1: {guard: (c) => true, target: 2 }}
    this.accepting  = accepting;
    this.isBuchi    = isBuchi;
}

function NASemantics(automata) {
    this.automata = automata;
    function initial() {
        return this.automata.initial;
    }
    function actions(source) {
        return this.automata.delta[source].filter( (gt) => gt.guard(source) );
    }
    function execute(action, configuration) {
        let {guard, target} = action;
        return target;
    }
    function isAccepting(configuration) {
        return this.automata.isAccepting;
    }
}

function DependentNASemantics(automata) {
    this.automata = automata;

    function initial() {
        return this.automata.initial;
    }
    function actions(input, source) {
        return this.automata.delta[source].filter( (gt) => gt.guard(input, source) );
    }
    function execute(action, input, configuration) {
        let {guard, target} = action;
        return target;
    }
    function isAccepting(configuration) {
        return this.automata.isAccepting;
    }
}