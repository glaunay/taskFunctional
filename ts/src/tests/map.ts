/*
    Use non-default job profile
    Take a task constructor
    Take a list as inputs
    map task on list
*/

import jobManager = require('ms-jobmanager');
import dummyTask = require('./dummyTask');
import stream = require('stream');
import {logger, setLogLevel} from '../logger.js';


import {map} from '../index';


logger.info("\t\tStarting map test");


let inputs:String|{}[] = ["5", "10", "4", "2"];
inputs = inputs.map((e) => {return { "dummyInput":e };});
/*

*/
jobManager.start({ "TCPip": "localhost", "port": "2323" })
    .on("ready", () => {
    let myManagement = {
        'jobManager' : jobManager,
        'jobProfile' : 'dummy'
    }
    let myOptions = {
        'logLevel': 'debug'/*,
        'modules' : ['myModule1', 'myModule2'],
        'exportVar' : { 'myVar1' : '/an/awesome/path/to/a/file.exe',*/
    };
    let dTask = new dummyTask.Task(myManagement, myOptions);

    map(<any[]>inputs, dTask, dummyTask.Task);

    /*
    let aFirstInput = "2";
    let rs = new stream.Readable();
    rs.push( JSON.stringify({ "dummyInput":aFirstInput }) ); // JSON format
    rs.push(null);

    rs.pipe(dTask.dummyInput);

    dTask.on('processed', res => {
	    console.log("I have my results :");
	    console.log(res);
    })
    */

});