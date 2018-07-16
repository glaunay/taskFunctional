//import typ = require('taskobject/ts/src/types/index');

import stream = require('stream');
import util = require('util');
import clone = require('clone');
import utils = require('util');
import taskLib = require('taskobject/types');
import streams = require('stream');

/*
    FUNCTIONAL TASK CORE


*/

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
                    someStream.push(JSON.stringify({symbol : inputLitt[symbol] } ));
                    someStream.push(null);
                    someStream.pipe(task[symbol]);
                }
            })
        );
    }
    _join() {
        Promise.all(this.taskArray).then((results:string[])=>{                
           // this.prepareResults(results);
           console.dir(`***${utils.format(results)}`);
        });

    }
    pipe(target:any) {


    }
    reduce(callback) {

    }

}



/*
    Input: iter_, packageRef
    returns an Array of results streams
*/

function processIteree(input:any[], taskObjectList:any[], jmClient:any, jobProfile?:string) {
    jobProfile = jobProfile ? jobProfile : "default"
    taskObjectList.forEach((t) => {
        let o = new t({ "jobManager" : jmClient, "jobProfile" : jobProfile });
        if (o.slotSymbols.length > 1)
            console.error("Multiple slot names, TO DO");
    });
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
export function map(inputs:any[], taskObject:any, taskC:any, invert?:boolean) {
    let taskArray:any[] = [taskObject];
    let inputSymbols:string[] = taskObject.slotSymbols;

    let jmClient = taskObject.jobManager;
    
    
    console.log(`Mapping ${utils.format(inputs)} vs ${inputSymbols}`)
//    if (inputSymbols.length > 1) {
 //       throw 'TO DO';
        /*
            check inpu type; it must be literral.
            Its keys must match inputsymbols
        */

    for (let x of inputSymbols) 
        for (let y of inputs) 
            if (! y.hasOwnProperty(x))
                throw `Property ${x} missing in inputs iteree`;
    console.log("YEAHHHH");

    let obj:functionalShell = new functionalShell(jmClient);
    
    let tOptions = taskObject.getOptions();

    for (let iTask = 0; iTask < inputs.length; iTask++) {
        console.log(`---->${iTask}`);
        if(iTask > 0) {
            let myManagement = {
                'jobManager' : jmClient,
                'jobProfile' : tOptions.jobProfile
            }
            let myOptions = {
                'logLevel': tOptions.logLevel,
                'modules' : tOptions.modules,
                'exportVar' : tOptions.exportVar
            };
            let dTask = new taskC(myManagement, myOptions);
            taskArray.push(dTask);
            //break;
         //   taskArray.push(clone(taskObject));        
        }
        let _task:any = taskArray[iTask];
        let _inputs:any = inputs[iTask];
        obj._push(_inputs, _task);         
    }
    obj._join();

    return;
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
