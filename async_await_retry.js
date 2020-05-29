"use strict";
//Declare functions
function setup(){
    Document.prototype.queryXPath = function (path) {

    var list = new Array();

    var xpath = document.evaluate(
        path,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    for (var i=0; i<xpath.snapshotLength; i++) {

        list.push(xpath.snapshotItem(i));

    };

    return list

    }
 




} setup();
// Packages

//Nice retry function
let _track = 0;
const delay = (ms) => new Promise(res => setTimeout(res, ms));
async function retry(fn, n, ms) {
    let lastError;

    for (let i = 0; i < n; i++) {
        try {
            if(i>0){
                console.log(`Retrying...(${i})...[every ${ms}]`)
            }
            await delay (ms); // Not only await the given time in main function, but also console log it
            return await fn;
        }
        catch (e) {
            lastError = e;
            
        }
    }
    throw lastError;
}


async function simulateClick(item){
    item.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    item.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    item.dispatchEvent(new Event('change', {bubbles: true}));

    return true;
}



// Helper functions

async function closeLeftover(){

    try {

        //Global variables to this function
        var technician = document.getElementById('s2id_selectTechnician');
        var group = document.getElementById('s2id_assignGroup');
        var dialog = document.getElementById('_DIALOG_LAYER');
    
        // Does one thing, deals with the technician/group popup
        async function closeAssignedPopup(x){
            var name;

            if(x.id == 's2id_selectTechnician'){
                name = 'technician'
            }
            if(x.id == 's2id_assignGroup'){
                name = 'group'
            }

            if(x !== null ) {
                
        
                if(x.classList.contains('select2-dropdown-open')){

                    simulateClick(x.children[0]);
    
                    return `${name} closed`
                }
            
    
            }

            return `${name} not open`
        }
        //Does one thing, deals with open dialog
        async function closeAssignedDialog(y){

                //if Dialog not null
                if (y !== null && y.style.visibility == 'visible'){
                        //  shut it down!
                        y.style.visibility = 'hidden';
                        
                        return 'dialog closed'
                       
                }
        
            
                    return 'Exception, check my execution body'
            
        }

        //Does one thing, check wether should run following or skip entirely
        async function initialCheck(){
            if (dialog == null || dialog.style.visibility == 'hidden'){
                return 'Skipping...'
            }
        }


        var check = await initialCheck();

        if(check !== 'Skipping...'){

            const safe1 = await  retry (closeAssignedPopup(technician), 1, null);// call
            const safe2 = await  retry (closeAssignedPopup(group), 1, null);// call
            const safe3 = await  retry (closeAssignedDialog(dialog), 1, null);// call
      
            
            return `Summary: ${safe1} , ${safe2} and ${safe3}`;


        }
  
        return check

    } 
    catch (e) {
        console.log("error" + e);
    }

}

async function getElement (row_num) { //converted
    
    const element = await document.queryXPath(`//*[@id='RequestsView_TABLE']/tbody/tr[${row_num}]`)[0];

    if(element !== null){ // if element not null, return with success, else go on and return failed
      return element
    }

    throw new Error('fail')
}

async function  gotChildren (element){ //converted

    var row = {};

    row.element = element
    row.id = element.cells[5].textContent.trim()
    row.agent = element.cells[7].children[0]
    row.mode = element.cells[17].textContent.trim()
    row.assign = element.cells[7].children[0].children[0].children[0]

    if(row.element !== null ){ // if element not null, return with success, else go on and return failed
        return row
    }

    throw new Error('fail')

    //}
}

async function openDialog (row) {//converted
    let x = {};

    if (row.agent.textContent.trim().includes('Unassigned')){
        row.agent.parentElement.style.outline = "2px solid red";
        row.element.classList.add("rowHiliten");// highlight firstRow
        // Highlight action and click

       var openHandle = await retry ( simulateClick(row.assign) , 10, 300);// await to open the popup

       row.agent.parentElement.style.outline = "2px solid gray";

        return  x = { 
                    'ticketId': row.id,
                    'openHandle': openHandle,
                    'message':'Clicked to open dialog.'
                    }

    }

    throw new Error('Fail - AssignedTo does not contain "Unassigned" for this row.')

}

async function assignTicket (elem) {//converted
    let x = {};

    if (elem.message.includes('Clicked to open dialog')){

        var popupRoot = await document.queryXPath("//div[@id='_DIALOG_LAYER']")[0]; 
        var table = await document.queryXPath("//table[@id='Monthlyscan']")[0]; 
        var group = await document.queryXPath("//div[@id='s2id_assignGroup']")[0]; //s2id_
        var technician = await document.queryXPath("//div[@id='s2id_selectTechnician']")[0]; 

        //we open the popup in the previous function

        if(popupRoot.style.visibility === 'visible' && popupRoot !== null && group !== null && technician !== null){

            table.style.outline='2px solid gray';
            group.style.outline='2px solid orange';
            technician.style.outline='2px solid violet';

            simulateClick(technician.children[0])
 
            let currentTechnician = technician.children[0].children[0].textContent;

            // closing popup

            //let doCloseTechnician = await simulateClick(technician.children[0]);

            //let closePopup = await document.queryXPath("//button[@class='closeButton']")[0]; 
            //let doClosePopup = await simulateClick(closePopup);

            return x = { 
                         'message' : 'Success - Reached the end.',
                         'group_div' : group,
                         'technician_div': technician,
                         'currentTechnician': currentTechnician,
                         'ticketId': elem.ticketId
                        }
        }
    
        throw new Error('Fail - Could not target "Group"')

    }

    throw new Error('Fail - Previous did not return : Dialog is open ')

};


//Main function
async function main(row_to_try) {

    try{                 

        //enforce a refresh nd reinject of all code except the call main function (from selenium)
        const safe0 = await retry (closeLeftover(), 2, 200); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe0); 

        const safe1 = await retry (getElement(row_to_try), 5, 200); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe1); 

        const safe2 = await retry (gotChildren(safe1), 2, 500);
        console.log(await safe2); 

        const safe3 = await retry (openDialog(safe2), 2, 1000);// retry 5 times, a try each second
        console.log(await safe3); 

        const safe4 = await retry (assignTicket(safe3), 5, 500);
        console.log(await safe4);
        storage = await safe4; 

        executed += `Ticket ID ${storage.ticketId} is assigned to : ${storage.currentTechnician}` + '\n' ;
        console.log(executed)
        
    } catch(error){
        console.log(error);
    }


}     

var storage = {}; // this stores safe4 to be used globally
var executed = [];
//var row_to_try = 6;

main(4);

//try catch is for calls only

// //div[@id='_DIALOG_LAYER'] display!= none