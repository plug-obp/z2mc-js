export {STR2TR}

class STR2TR {
    constructor(aSTR) {
        this.operand = aSTR;
    }
    initial() {
        return this.operand.initial();
    }
    next(source) {
        let tr_targets = [];
        let actions = this.operand.actions(source);
        for (let action of actions) {
            let targets = this.operand.execute(action, source);
            tr_targets.push(...targets);
        }
        return tr_targets;
    }
    isAccepting(c) {
        return this.operand.isAccepting(c);
    }
    configurationHashFn(c) {
        return this.operand.configurationHashFn(c);
    }
    configurationEqFn(a, b){
        return this.operand.configurationEqFn(a, b);
    }
}
