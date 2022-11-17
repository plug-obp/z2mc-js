import { dataless_dfs_traversal } from "./algorithms/z_dataless_dfs.js";
import { LinearScanHashSet      } from "./datastructures/linear_scan_set.js"
import { UnboundedStack         } from "./datastructures/unbounded_stack.js";


//0. define the syntax

class BinaryOperation {
    constructor(a, b) {
        this.lhs = a;
        this.rhs = b;
    }
    toString() {
        return `(${this.lhs} ${this.operator()} ${this.rhs})`
    }
    next() {
        return [this.lhs, this.rhs];
    }
}
class Addition extends BinaryOperation {
    operator() {
        return "+";
    }
}

class Substraction extends BinaryOperation {
    operator() {
        return "-";
    }
}
const ast = new Addition(2, new Substraction(3, 2));
console.log(ast.toString());
console.log(ast.next());

// 1. define the next on the AST -- maps the ast to a graph
const initial = [ast];
function next( n ) {
    if (typeof n === 'object') {
        return n.next();
    }
    return [];
}
const hashFn     = (n) => 1;
const equalityFn = (a,b) => a === b;

// 2. define the evaluation semantics

function evalAddition(stack, object) {
    stack.push( stack.pop() + stack.pop() );
}

function evalSubstraction(stack, object) {
    stack.push(- stack.pop() + stack.pop() );
}

function evalNumber(stack, object) {
    stack.push(object);
}

// 3. create the type-based dispatch function
function dispatch(stack, object) {
    if (object === null) {
        return;
    }
    if (typeof object === 'number') {
        return evalNumber(stack, object);
    } else if (typeof object === 'object') {
        switch (true) {
            case object instanceof Addition:
                return evalAddition(stack, object);
                break;
            case object instanceof Substraction:
                return evalSubstraction(stack, object);
                break;
            default:
                console.log("UNEXPECTED ERROR dispatch");
                break;
        }
    } else {
        console.log("UNEXPECTED ERROR dispatch");
    }
}


// 3. instanciate the traversal with the evaluation semantics
async function interpreter(initial, next, hashFn, equalityFn) {
    let known1      = new LinearScanHashSet(1024, hashFn, equalityFn, false);
    let stack1      = new UnboundedStack(1024, 2);
    return dfs(initial, next, known1, stack1);
}

async function dfs(initial, next, known1, stack1) {
    function addIfAbsent(n, nc) {
        return known1.add(nc);
    }
    function on_entry(s,n,nc,m) {
        m.cc++;
        return false;
    }
    function on_exit(n, frame, mem) {
        dispatch(mem.stack, n);
        return false;
    };

    function on_known(s,n,nc, mem) {
        dispatch(mem.stack, n);
        return false;
    };

    let memory = {
        stack:   [],
        cc: 0, 
    };
    let {stack, cc} = await dataless_dfs_traversal(
        initial, next, (c)=>c,
        on_entry, on_known, on_exit, memory, 
        addIfAbsent, stack1);
    return memory;
}

let re = await interpreter(initial, next, hashFn, equalityFn);
console.log(re.stack);

//TODO: comment attacher l'evaluation comme fanout de l'etat de l'interpreteur... pour construire une STR
// il me faut un curseur ?... qui simule le pc 
// l'etat du dfs peut etre ?
// le DFS sur l'AST induit un ordre total qui maps sur le PC ?