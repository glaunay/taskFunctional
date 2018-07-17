//import typ = require('taskobject/ts/src/types/index');

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


/*
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

// Object returned by the map function
class functionalShell {
    jobManager:any;
    taskArray:Promise<String>[] = [];
    
    constructor(jobManager) {
        this.jobManager= jobManager;
    }

    _push(inputLitt:{}, task:any/*taskLib.taskObject*/) {
        this.taskArray.push(
            new Promise( (resolve, reject)=> {
                task.on("processed", (taskOutput:string)=>{
                    console.log(`OOOO=======\n${ util.inspect(taskOutput, {showHidden: false, depth: null}) }`);
                    resolve(taskOutput);
                });
                for (let symbol of task.slotSymbols) {
                    let someStream = new streams.Readable();
                    let x = {};
                    x[symbol] = inputLitt[symbol];
                    logger.debug(`content : ${utils.format(x)}`);
                    someStream.push(JSON.stringify(x));
                    someStream.push(null);
                    logger.debug(`sSym : ${symbol} \n ${utils.format(task[symbol])}`);
                    someStream.pipe(task[symbol]);
                }
            })
        );
    }
    _join() {
        /*Promise.all(this.taskArray).then((results:string[])=>{                
           // this.prepareResults(results);
           console.dir(`***${utils.format(results)}`);
        });*/
        return Promise.all(this.taskArray);

    }
    join(callback) {
        this._join().then((r)=>{
            callback(r);
        })
    }
    // pipe into another map
    // Domain size is the results of the previous map
    // Option inputs can be provided 
    map(taskC:any, ...optParam:any[]) { 
        /*
         We check slot symbols of the downstream map function
            if there is more than one -> error and no optInput
         */
        
        /*let managmentBean = {
            jobProfile : optInput.hasOwnProperty('jobProfile') ? optInput.jobProfile : undefined,
            jobManager : this.jobManager
         }*/
        
        let refereeTask = new taskC(this.jobManager);
        this._join().then(
            (results) => {
                let newInputs;
                let jobProfile = undefined;
                for (let opt of optParam) {
                    if (typeof opt === 'string') {
                        jobProfile = opt;
                        continue;
                    }

                if(opt instanceof Array) {
                    if (opt.length != results.length)
                        throw('iterable rest parameters has wrong length');
                    if( isOptIterType(opt[0]) ) {
                        
                        let newInputs = coherceInputOpt(refereeTask, results, opt);


                    }


            }
        }



            if(undefined)
                map(managmentBean, newInputs, taskC)
            } 
        )

    }
    reduce(callback) {

    }

}

/*
    Depending on input : if a list, returns it
                         if a litteral duplicate it
*/
function mayDuplicate(opt:any, n:number) {
    if(opt instanceof Array) {
        if (opt.length != n)
            throw('iterable mayDuplicate parameters has wrong length');
        return opt;
    let array = [];
    for (let i = 0 ; i < n ; i++) {
        array.push(opt);
    }
    return array;
}

function hasIdenticalKeys(opt:{}[]):Set {
    if (!opt) return new Set([]);

    let refSet = new Set( Object.keys(opt[0]) ); 
    for (let stuff:{} of opt) {
        let curSet = new Set( Object.keys(stuff) ); 
        let difference = new Set(
            [...refSet].filter(x => !curSet.has(x)) );

        if(difference.size != 0)
            throw("Uneven parameters");
    } 
    return refSet;
}

// Merge the results and the newly provided data to create a list of litterals w/ all keys matching
// downstream task slots
function coherceInputs(refereeTask:any, inputs:{}[], optInputs:{}[]):{}[] {

    let taskSlots = new Set(refereeTask.slotSymbol);
    let inputSlot:Set = hasIdenticalKeys(inputs);
   
    if(taskSlots.size - inputSlot.size != 1)
        throw ("Inconsistent task Slots");

    let availableSymbol = new Set(
        [...taskSlots].filter(x => !inputSlot.has(x)) );
    return [{}]
}


//Should do the same for inputs
function coherceOptions(inputsIter:any[], optInputs?:{}[]|{}):optIterType[] {

    let optIterTypeFmt:optIterType[] = [];
    if(!optInputs)
        optIterTypeFmt = inputsIter.map(()=>{
            return {
                logLevel : 'debug'
            };
        });

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
export function map(managmentBean:managementOpt, inputs:any[], taskC:any, optIteree?:optIterType|optIterType[]):functionalShell {


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
//    if (inputSymbols.length > 1) {
 //       throw 'TO DO';
        /*
            check inpu type; it must be literral.
            Its keys must match inputsymbols
        */

        // SET OPERATIONS ES7
        //set(inputSymbols) - set(itereeOpt.keys) == 

    for (let x of inputSymbols) 
        for (let y of inputs) 
            if (! y.hasOwnProperty(x))
                throw `Property ${x} missing in inputs iteree`;
    console.log("YEAHHHH");

    let obj:functionalShell = new functionalShell(jmClient);


    // BIND BOTH TASK ITERATORS AND INPUT INTERATOR
    taskArray.forEach((t, i)=>{
        obj._push(inputs[i], t);

    })
    obj._join();

    return obj;
/*
    for (let i = 0 ; i < inputs.length -1 ; i++)
        taskArray.push(clone(taskObject));

    let tasksInputs = inputs.map((e)=> {
        let rs = new stream.Readable();
        rs.push( JSON.stringify({ inputTaf:aFirstInput }) ); // JSON format
        rs.push(null); 
    });
        let rs = new stream.Readable();
        rs.push( JSON.stringify({ "dummyInput":aFirstInput }) ); // JSON format
        rs.push(null);        
*/

}
    // invert true means we return something of the size of the list of task
    // invert false means we return something of the size of the list of input
 /*   processIteree(inputs, taskConstructors, jmClient);
    if (invert) {  // [taskObject] -- f--> [results]
    }
    // Check input key w/ slot name
    for (let iSlot of inputs) { // inputs = [{slotSymbol: inputValueAsContainer|String }, ...., {}]
        if( !iSlot.hasOwnProperty('inputMFasta') ) continue;
        let value = iSlot.inputMFasta; // Value is a data container
        console.dir(value);
        console.log('**' + typeof(value));
*/
    // Instantiate one task -> access to its slot list
    /*
1/ Async resolution of mutliple task creation (Promise.all)
2/ upon completion => 
    this.goReading = true;
    STUFF = {[this.outKey] : realSTUFF }
    this.push(JSON.stringify(STUFF))  => Stream to next task
    this.emit("processed", STUFF)  => show STUFF 
    taskobject index.tx:289 is the call
    */
/*
    let taskArray:Promise<String>[] = [];
    for (let key in value) {
        let d:any = value[key];
        let p:Promise<string> = new Promise( (resolve, reject)=> {
            let task = new taskConstructor({ "jobManager" : this.jobManager, "jobProfile" : "default" }, {} );
            task.on("processed", (taskOutput:string)=>{
                console.log(`OOOO=======\n${ util.inspect(taskOutput, {showHidden: false, depth: null}) }`);
                resolve(taskOutput);
            });
            console.log(`passing ${d.toString()} to atomic blast task`);
            let container = { "inputF": d.toString() };
            let fastaStream = new streams.Readable();
            fastaStream.push(JSON.stringify(container));
            fastaStream.push(null);
            //console.dir(util.inspect(task));
            fastaStream.pipe(task.inputF);
        });
        taskArray.push(p);
    }
    Promise.all(taskArray).then((results:string[])=>{                
        this.prepareResults(results);
    });


}
}
*/
