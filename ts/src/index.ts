//import typ = require('taskobject/ts/src/types/index');
import events = require('events');
import stream = require('stream');
import util = require('util');
import clone = require('clone');
import utils = require('util');
import taskLib = require('taskobject/types');
import streams = require('stream');
import logger = require('winston');
//import cType = require('ms-jobManager');

/*

    FUNCTIONAL TASK CORE

*/
/*
function isOptIterType(opt:any): opt is optIterType {
    
    if (!opt && typeof opt === 'object')
        for (let k in opt) {
            if k
        }
       
}
*/
interface managementOpt {
    jobProfile?:string;
    jobManager:any
} 


/* THIS FUNCTION SHOULD BE IMPORTED FROM MS-JOBMANAGER TYPES !!!!
    but can't use d.ts properly yet
type optKeys =
    "modules"
    | "exportVar"
    | "logLevel";
*/
function isOptIterType(opt:any): opt is optIterType {
    if (typeof opt !== 'object')
        return false;
    return opt.hasOwnProperty('modules') || opt.hasOwnProperty('exportVar') || opt.hasOwnProperty('logLevel')
}

interface optIterType {
    modules?:string[],
    exportVar?:{},
    logLevel?:string,
   // inputs?: any, // additional inputs.
    //jobProfie?:string // changing profiles
}

function mergeSymbol(taskC:any, littInputs:{}) {
    new Set();
}

/* Check all  litt objects have identical keys and return them*/
function hasIdenticalKeys(opt:{}[]):Set<string> {
    if (!opt) return new Set([]);

    let refSet:Set<string> = new Set( Object.keys(opt[0]) ); 
    for (let stuff of opt) {
        let curSet = new Set( Object.keys(stuff) ); 
        let difference = new Set( [...refSet].filter( (x => !curSet.has(x)) ) );

        if(difference.size != 0)
            throw("Uneven parameters");
    } 
    return refSet;
}

// Merge the results and the newly provided data to create a list of litterals w/ all keys matching
// downstream task slots
function coherceInputs(refereeTask:any, upStreamInputs:{}[], optInputs?:{}[]):{}[] {
    let taskSlots:Set<string> = new Set(refereeTask.slotSymbols); // The set of available slot symbols
    let optInputSlot:Set<string> = optInputs ? hasIdenticalKeys(optInputs): new Set([]); // The set of input symbol present in all input litterals
   
    if(taskSlots.size - optInputSlot.size != 1) // There must be a diff of one b/w set sizes, ie: one left for the upstream output
        throw ("Inconsistent task Slots");

    let availableSymbol:string|string[] = [...new Set(
        [...taskSlots].filter(x => !optInputSlot.has(x)) )];
    if (availableSymbol.length != 1)
        throw (`uncorrect slot symbol left (${availableSymbol.length}:${utils.format(availableSymbol)})`);
    logger.debug(`${availableSymbol}`);
        //return [...availableSymbol];
    
        let upStreamSlot:string = availableSymbol[0];
    return upStreamInputs.map((e, i) => { 
        let d:{} = optInputs ?  optInputs[i] : {};
        d[ upStreamSlot ] = e['out'].toString();
        return d;
    });
}

// Object returned by the map function
class functionalShell extends events.EventEmitter {
    jobManager:any;
    //taskArray:Promise<String>[] = [];
    taskArray:{ (data: string): Promise<string>; } [] = [];
    
    resolveProm?:Promise<string[]>;

    constructor(jobManager) {
        super();
        this.jobManager = jobManager;
    }

    _push(inputLitt:{}, task:any/*taskLib.taskObject*/) {
        this.taskArray.push(
            () => {
            return new Promise( (resolve, reject)=> {
                task.on("processed", (taskOutput:string)=>{
                    console.log(`OOOO=======\n${ util.inspect(taskOutput, {showHidden: false, depth: null}) }`);
                    resolve(taskOutput);
                });
                for (let symbol of task.slotSymbols) {
                    let someStream = new streams.Readable();
                    let x = {};
                    x[symbol] = inputLitt[symbol];
                    //logger.debug(`content : ${utils.format(x)}`);
                    someStream.push(JSON.stringify(x));
                    someStream.push(null);
                    //logger.debug(`sSym : ${symbol} \n ${utils.format(task[symbol])}`);
                    someStream.pipe(task[symbol]);
                }
            })
        });
    }
    _resolve() {
        this.resolveProm = Promise.all( this.taskArray.map(t => t('x')) );
        this.resolveProm.then( (r)=> this.emit('resolved', r) );
        //tasks.map(t => t())
        //return Promise.all(this.taskArray);
    }
   /* _join() {
        return Promise.all(this.taskArray);

    }*/
    join(callback) {
        //if we do single stage map, it needs to be resolve first
        /*if (!this.resolveProm)
            this._resolve();*/
        // if it is a downstream map, its resolve was already bound to upstream resolve...
        
        this.on('resolved', (r) => {callback(r);});

        /*this.resolveProm.then((r)=>{
            callback(r);
        });*/

        /*this._resolve().then((r)=>{
            callback(r);
        })*/
    }
    // pipe into another map
    // Domain size is the results of the previous map
    // Option inputs can be provided 
    map(taskC:any, ...optParam:any[]):functionalShell { 

        /*
        We create the downstream fShell and return is synchronously 
        to provide declarative interface
        */
        let newShell = new functionalShell(this.jobManager);
        //return map({ 'jobManager' : this.jobManager, 'jobProfile': jobProfile }, newInputs, taskC, newInputs);

        /*let managmentBean = {
            jobProfile : optInput.hasOwnProperty('jobProfile') ? optInput.jobProfile : undefined,
            jobManager : this.jobManager
         }*/
        //invoke the blue print task
        let refereeTask = new taskC({jobManager : this.jobManager});
        // Register this._resolve Promise
        //this._resolve();
        // Bind Downstream map feedint and resolving to 
        // this resolve
        this.on('resolved', (results) => {
                let nTask = results.length;
                let newInputs;
                let newOptions;
                let jobProfile = undefined;
                /* Parsing trailing arguments policy
                    jobProfile:string
                    jobOPtions:{TemplateJobOpt}|[{jobOpt},..]
                    jobInputs:{TemplateJobInp}|[{jobInp},..]
                */
                // Optional args is a string -> jobProfile
                for (let opt of optParam) {
                    if (typeof opt === 'string') {
                        jobProfile = opt;
                        continue;
                    }
                
                // Optional args is a list -> list of inputs (slotSymbol, value)
                // OR list of options 
                    let tmpArray:any[] = normalize(opt, nTask);
                    if( isOptIterType(tmpArray[0]) )
                        newOptions = coherceOptions(results, tmpArray);
                    else
                        newInputs = coherceInputs(refereeTask, results, tmpArray);
                }
                // We prepare stuff
                if (!newInputs)
                    newInputs = coherceInputs(refereeTask, results);
                if (!newOptions)
                    newOptions = coherceOptions(results);
                // We update the downstream shell by reusing the top-level map function
                // Then resolve it
                logger.debug(`About to map downstream::\n${utils.format(newInputs)}\n${utils.format(newOptions)}`);
                map({ 'jobManager' : this.jobManager, 'jobProfile': jobProfile }, newInputs, taskC, newInputs, newShell);      
                newShell._resolve();          
               // newShell._resolve();
            });
        // Resolve current map
        //this._resolve();
        // Return downstream map interface
        return newShell;
    }
    reduce(callback) {

    }

}

/*
    Depending on input : if a list, returns it
                         if a litteral duplicate it
*/
function normalize(opt:any, n:number):any[] {
    if(opt instanceof Array) {
        if (opt.length != n)
            throw('iterable normalize parameters has wrong length');
        return opt;
    }
    let array = [];
    for (let i = 0 ; i < n ; i++) {
        array.push(opt);
    }
    return array;
}

//Should do the same for inputs
function coherceOptions(inputsIter:any[], optInputs?:{}[]|{}):optIterType[] {

    let optIterTypeFmt:optIterType[] = [];
    if(!optInputs)
        return inputsIter.map( (x) => { return {logLevel : 'debug'}; });


    if(optInputs instanceof Array) {
        if(optInputs.length != inputsIter.length)
            throw("missmatching size in inputs and options")
        optIterTypeFmt =  <optIterType[]>optInputs;
    } else {
        optIterTypeFmt = inputsIter.map(()=>{
            return <optIterType>optInputs;
        });

    }
    return optIterTypeFmt;
}
// map(task_iteree, dataAtom)
// map(inputs_iteree, task_X).reduce(goTreeTask) 
// goTreeTask is being called inputs.length times and gives access to current results and rest of the results
// 
// The real task is is to compare each results to one best.
/*
map(task_iteree, dataAtom).map((result)=> {
    goTreeTask(result, oneBest)
 });
*/

// Return something which provides map and reduce
/*
2 calling contexts:
no staticShell is passed
a staticShell is passed
*/
export function map(managmentBean:managementOpt, inputs:any[], taskC:any, optIteree?:optIterType|optIterType[], staticShell?:functionalShell):functionalShell {


// OPTIONS ITERATOR

    // We have no optional iterator, create a defaut one
    let optIterTypeFmt:optIterType[] = coherceOptions(inputs, optIteree);

// TASKS ITERATOR, fed w/ OPTIONS ITERATOR
    let taskArray:any[] = inputs.map((e, i)=>{
        return new taskC(managmentBean, optIterTypeFmt[i]);
    });
    let inputSymbols:string[] = taskArray[0].slotSymbols;
    let jmClient = taskArray[0].jobManager;
    let jProfile = managmentBean.jobProfile ? managmentBean.jobProfile : undefined;
    console.log(`Mapping ${utils.format(inputs)} vs ${inputSymbols}`)


    for (let x of inputSymbols) 
        for (let y of inputs) 
            if (! y.hasOwnProperty(x))
                throw `Property ${x} missing in inputs iteree`;
    if (!staticShell)
        logger.debug("map basic check Ok, invoking functional shell");
    else 
        logger.debug("map basic check Ok, updating passed functional shell");
    
    let obj:functionalShell = staticShell ? staticShell : new functionalShell(jmClient);
    // BIND BOTH TASK ITERATORS AND INPUT INTERATOR
    taskArray.forEach((t, i)=>{
        obj._push(inputs[i], t);
    })

    obj._resolve();
    return obj;
}
 
