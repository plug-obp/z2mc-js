export {KripkeBuchiAsymmetricSynchronousProduct, StateEventAsymmetricSynchronousProduct, STUTTERING}

function KripkeBuchiAsymmetricSynchronousProduct(kripke, buchi) {
    this.kripke = kripke;
    this.buchi  = buchi;

    function initial() {
        return this.buchi.initial().map( (abc) => ({kc: null, bc: abc}) );
    }

    function actions(source) {
        let {kc:kripke_source, bc:buchi_source} = source;
        let synchronous_actions = [];
        //initial case: the kripke configuration is None -- the synthetic configuration introduced by the kripke2buchi
        if (kripke_source == null) {
            for (let kripke_target of this.kripke.initial()) {
                getSynchronousActions(kripke_target, buchi_source, synchronous_actions);
            }
            return synchronous_actions;
        }
        //the normal case: the kripke has a step, find the corresponding step in the buchi automaton
        let kripke_actions = this.kripke.actions(kripke_source);
        let number_of_actions = kripke_actions.length; //used to detect deadlock
        for (let kripke_action of kripke_actions) {
            let kripke_targets = this.kripke.execute(kripke_action, kripke_source);
            if (kripke_targets.length == 0) {
                number_of_actions -= 1;
                continue;
            }
            for (let kripke_target of kripke_targets) {
                getSynchronousActions(kripke_target, buchi_source, synchronous_actions);
            }
        }
        //the deadlock case: the kripke does not have a step, add stuttering
        if (number_of_actions == 0) {
            getSynchronousActions(kripke_source, buchi_source, synchronous_actions);
        }
        return synchronous_actions;
    }

    function execute(action, configuration) {
        let {ko:kripke_target, ba: buchi_action} = action;
        let {kc:_, bc:buchi_source} = configuration;
        let buchi_targets = this.buchi.execute(buchi_action, kripke_target, buchi_source);
        return buchi_targets.map( (abc) => ({kc: kripke_target, bc: abc}) )
    }
}

function getSynchronousActions(buchi_semantics, kripke_output, buchi_config, io_synchronous_actions) {
    let buchi_actions = buchi_semantics.actions(kripke_output, buchi_config);
    let synchronous_actions = buchi_actions.map( (buchi_action) => ({ko: kripke_output, ba: buchi_action}) );
    io_synchronous_actions.push(...synchronous_actions);
    return;
}
const STUTTERING = {};
function StateEventAsymmetricSynchronousProduct(kripke, buchi) {
    this.kripke = kripke;
    this.buchi  = buchi;

    function initial() {
        let initial_configurations = [];
        for (let kripke_config of this.kripke.initial()) {
            for (let buchi_config of this.buchi.initial()) {
                initial_configurations.push( { kc: kripke_config, bc: buchi_config } );
            }
        }
        return initial_configurations;
    }

    function actions(source) {
        let {kc:kripke_source, bc:buchi_source} = source;
        let synchronous_actions = [];
        //the normal case: the kripke has a step, find the corresponding step in the buchi automaton
        let kripke_actions = this.kripke.actions(kripke_source);
        let number_of_actions = kripke_actions.length; //used to detect deadlock
        for (let kripke_action of kripke_actions) {
            let kripke_targets = this.kripke.execute(kripke_action, kripke_source);
            if (kripke_targets.length == 0) {
                number_of_actions -= 1;
                continue;
            }
            for (let kripke_target of kripke_targets) {
                let kripke_step = {s: kripke_source, a: kripke.action, t: kripke_target};
                getSynchronousActions(kripke_step, buchi_source, synchronous_actions);
            }
        }
        //the deadlock case: the kripke does not have a step, add stuttering
        if (number_of_actions == 0) {
            let kripke_step = {s: kripke_source, a: STUTTERING, t: kripke_source};
            getSynchronousActions(kripke_step, buchi_source, synchronous_actions);
        }
        return synchronous_actions;
    }

    function execute(action, configuration) {
        let {ko: kripke_step, ba: buchi_action} = action;
        let {kc:_, bc:buchi_source} = configuration;
        let {s:_, a:_, t: kripke_target} = kripke_step;
        let buchi_targets = this.buchi.execute(buchi_action, kripke_step, buchi_source);
        return buchi_targets.map( (abc) => ({kc: kripke_target, bc: abc}) )
    }
}