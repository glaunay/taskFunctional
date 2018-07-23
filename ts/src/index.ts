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
        throw (`Inconsistent task Slots 
(downstream nSlot:${taskSlots.size} additional slot number ${optInputSlot.size})`);

    let availableSymbol:string|string[] = [...new Set(
        [...taskSlots].filter(x => !optInputSlot.has(x)) )];
    if (availableSymbol.length != 1)
        throw (`uncorrect slot symbol left (${availableSymbol.length}:${utils.format(availableSymbol)})`);
    logger.debug(`${availableSymbol}`);
        //return [...availableSymbol];
    
    let upStreamSlot:string = availableSymbol[0];
    logger.debug(`Crushing this input array${utils.format(upStreamInputs)}`);
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
        logger.debug("Invoking fShell");
    }

    _push(inputLitt:{}, task:any/*taskLib.taskObject*/) {
        logger.debug("fShell._pushing");
        this.taskArray.push(
            () => {
            return new Promise( (resolve, reject)=> {
                task.on("processed", (taskOutput:string)=>{
                    logger.info(`taskOutput:\n${ util.inspect(taskOutput, {showHidden: false, depth: null}) }`);
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
        logger.debug("fShell._resolve");
        this.resolveProm = Promise.all( this.taskArray.map(t => t('x')) );
        this.resolveProm.then( (r)=> this.emit('resolved', r) );
    }
    join(callback) {
        this.on('resolved', (r) => {callback(r);});
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
     
        //invoke the blue print task
        let refereeTask = new taskC({jobManager : this.jobManager});
        
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
                    logger.debug(`About to blend::\n${utils.format(results)}\n${utils.format(tmpArray)}`);
            
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
                map({ 'jobManager' : this.jobManager, 'jobProfile': jobProfile }, newInputs, taskC, newOptions, newShell);      
                newShell.emit('ready');               
            });
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
        array.push(clone(opt));
    }
    return array;
}

//Should do the same for inputs
function coherceOptions(inputsIter:any[], optInputs?:{}[]|{}):optIterType[] {

    let optIterTypeFmt:optIterType[] = [];
    if(!optInputs)
        return inputsIter.map( (x) => { return {logLevel : 'info'}; });


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
export function map(managmentBean:managementOpt, inputs:any[]|any, taskC:any[]|any, optIteree?:optIterType|optIterType[], staticShell?:functionalShell):functionalShell {

    if (inputs instanceof Array && taskC instanceof Array) 
        throw ('Cannot decipher iteree and application, both being list')

    let iteree:any[];
    let application:any;
    let iTask:boolean = false;
    if (inputs instanceof Array) { //MAPPING TASK FUNCTION ON INPUT ITEREE
        iteree = inputs;
        application = taskC;
    } else {                       //MAPPING INPUT FUNCTION ON TASK ITEREE
        iteree = taskC;
        application = inputs;
        iTask = true;
    }
   

// OPTIONS ITERATOR

    // We have no optional iterator, create a defaut one
    let optIterTypeFmt:optIterType[] = coherceOptions(iteree, optIteree);

// TASKS ITERATOR, fed w/ OPTIONS ITERATOR
    let taskArray:any[] = iteree.map((e, i)=>{
        if (iTask)
            return new e(managmentBean, optIterTypeFmt[i])
        return new taskC(managmentBean, optIterTypeFmt[i]);
    });

   
    

    if (!iTask) {
        let inputSymbols:string[] = taskArray[0].slotSymbols;
        logger.debug(`Mapping ${utils.format(inputs)} vs ${inputSymbols}`)

        for (let x of inputSymbols) 
            for (let y of inputs) 
                if (! y.hasOwnProperty(x))
                    throw `Property ${x} missing in inputs iteree`;
    } else {
        // Getting union set of all task symbols
        let neededSymbolSet = new Set();
        for (let task of iteree) 
            for (let slotSymbol of task.slotSymbols)
                neededSymbolSet.add(slotSymbol);
        
        logger.debug(`Mapping ${utils.format(inputs)} vs ${neededSymbolSet}`)

        let _inter = new Set();
        for (let k in inputs) {  // inputs is a litteral which keys could match a slot symbol
            if (neededSymbolSet.has(k)) {
                _inter.add(k);
            }
        }
        if (_inter.size != neededSymbolSet.size) {
            let missSym = new Set();
            for (let k of neededSymbolSet)
                if (!_inter.has(k))
                    missSym.add(k);
            
            throw(`Missing ${missSym.size} slot(s) --symbol based-- among ${neededSymbolSet.size} required\n${missSym}`)
        }
    }
    
    if (!staticShell)
        logger.debug("map basic check Ok, invoking functional shell");
    else 
        logger.debug("map basic check Ok, updating passed functional shell");


    let jmClient = taskArray[0].jobManager;
    let jProfile = managmentBean.jobProfile ? managmentBean.jobProfile : undefined;
        
    let obj:functionalShell = staticShell ? staticShell : new functionalShell(jmClient);
    // BIND BOTH TASK ITERATORS AND INPUT INTERATOR
    taskArray.forEach((t, i)=>{
        let _input = iTask ? inputs : inputs[i];
        obj._push(_input, t);
    })

    obj.on('ready',() => {obj._resolve()});
    if (!staticShell)
        obj.emit('ready');
    return obj;
}
 
