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



// Helper functions - Each function should do only one thing!
async function inGroupUnassigned(){ //Step1
    var my_location = document.getElementById('listview_btn');

    if(my_location !== null && my_location.textContent.includes("Group = Unassigned")){
        return {'Step 1':'Service Desk - Group Unassigned detected. Carrying on...'}
    }

    if(my_location == null){
        throw new Error('You are not on Service Desk - Requests. Aborting.') //sau cu throw, cred ca opreste codul automat, si nu mai trebuie sa verific la urmatoarea ce vine de la prima
    }

    if(my_location !== null && !my_location.textContent.includes("Group = Unassigned")){
        throw new Error('You are on Service Desk - Requests page, but NOT in Group Unassigned. Aborting.');
    }

    throw new Error('Exception fail - check me')
}

async function closeLeftover(){//Step2

        var dialog = document.getElementById('_DIALOG_LAYER');

        //Does one thing, check wether should run following or skip entirely

        if (dialog == null || dialog.style.visibility == 'hidden'){ // if dialog is null or hidden, skip !
            return {'Step2 - Skip': 'No previous popup open, skipping...'}
        } 
        if(dialog !== null && dialog.style.visibility == 'visible'){ // close things only if dialog not null AND is visible
            var technician = document.getElementById('s2id_selectTechnician');
            var group = document.getElementById('s2id_assignGroup');

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
            
                
                        throw new Error('Exception, check my execution body')
                
            }

            //Calling them
            const safe1 = await  retry (closeAssignedPopup(technician), 1, null);// call
            const safe2 = await  retry (closeAssignedPopup(group), 1, null);// call
            const safe3 = await  retry (closeAssignedDialog(dialog), 1, null);// call
      
            
            return {'Step2': `Summary: ${safe1} , ${safe2} and ${safe3}`}
        }
        
        throw new Error('Fail  - 8dsjdks')


}

async function getElement (row_num) { //converted
    
    const element = await document.queryXPath(`//*[@id='RequestsView_TABLE']/tbody/tr[${row_num}]`)[0];

    if(element !== null){ // if element not null, return with success, else go on and return failed
      
        return {'Step 3': 'Got row element',
                'element': element
                }
    }

    throw new Error('fail - 049349394')
}

// am ramas aici
async function makeItObject (message){ //converted

    var row = {};

    row.element = message.element
    row.id = message.element.cells[5].textContent.trim()
    row.agent = message.element.cells[7].children[0]
    row.mode = message.element.cells[17].textContent.trim()
    row.assign = message.element.cells[7].children[0].children[0].children[0]

    if(row.element !== null ){ // if element not null, return with success, else go on and return failed
        return row
    }

    throw new Error('fail')

    //}
}

async function openDialog (row) {

    if (row.agent.textContent.trim().includes('Unassigned')){
        row.agent.parentElement.style.outline = "2px solid red";
        row.element.classList.add("rowHiliten");// highlight firstRow
        // Highlight action and click

       var openHandle = await retry ( simulateClick(row.assign) , 10, 300);// await to open the popup

       row.agent.parentElement.style.outline = "2px solid gray";

        return { 
                    'ticketId': row.id,
                    'openHandle': openHandle,
                    'message':'Clicked to open dialog.',
                    }

    }

    throw new Error('Fail - AssignedTo does not contain "Unassigned" for this row.')

}

async function getDialogDivs (elem) {//this and getElement, might be good to combine
    let x = {};

    if (elem.message.includes('Clicked to open dialog')){

        var AssignTechnicianPopup = await document.queryXPath("//div[@id='_DIALOG_LAYER']")[0]; 
        var table = await document.queryXPath("//table[@id='Monthlyscan']")[0]; 
        var group = await document.queryXPath("//div[@id='s2id_assignGroup']")[0]; //s2id_
        var technician = await document.queryXPath("//div[@id='s2id_selectTechnician']")[0]; 

        //we open the popup in the previous function

        if(AssignTechnicianPopup.style.visibility === 'visible' && AssignTechnicianPopup !== null && group !== null && technician !== null){

            table.style.outline='2px solid gray';
            group.style.outline='2px solid orange';
            technician.style.outline='2px solid violet';

            let currentTechnician = technician.children[0].children[0].textContent;
            //simulateClick(technician.children[0])

            return x = { 
                         'group_div' : group,
                         'technician_div': technician,
                         'currentTechnician': currentTechnician,
                         'ticketId': elem.ticketId,
                         'AssignTechnicianPopup': AssignTechnicianPopup
                        }
        }
    
        throw new Error('Fail - Could not target "Group"')

    }

    throw new Error('Fail - Previous did not return : Dialog is open ')

};

async function openGroupPopup(popup) {

    if(popup.currentTechnician == 'NONE'){ // third safety measure for current ticket to be assigned to NONE, Unassigned

        //if group is already open
        if (popup.group_div.classList.contains('select2-dropdown-open')){
            return 'Group is already open. Skipping...'
        }

         //if group is not already open
        if(!popup.group_div.classList.contains('select2-dropdown-open')){
            let x = {};
                // open it
            simulateClick(popup.group_div.children[0]); //popup.group_div.children[0] is the <a> tag to open the group popup
            //popup.group_div.children[1] is the UL list only available if above is true, opened

            return x = { 'message': 'Opened Group Popup.',
                         'div':   popup.group_div.children[0]
                        }
        
        }


                

    }

    throw new Error('Current technician is not NONE');
}

async function selectSDGroup(){

    // i could probably get rid of these 2 and target groupsList directly
    let groupsDiv = await document.queryXPath("//div[@id='select2-drop']")[0]; // 
    let groupsUl= groupsDiv.children[1];
    let groupsLi = groupsUl.children;

    
    // Safer to do with with a for loop in case they add other groups later on

    for ( i=0; i < groupsLi.length; i ++){
        
        if(groupsLi[i].children[0].textContent == "Service Desk"){

            simulateClick(groupsLi[i]);

            return {'message':'Service Desk group selected'}
            
        }
    }

    throw new Error('Failed to find SD group')

}   
        
async function assign(safe4){
    let currentSelectedGroupText = document.queryXPath("//div[@id='s2id_assignGroup']//a[@class='select2-choice']")[0].children[0].textContent;
    //if Assign technician dialog popup still open & group currently holds service desk
    
    if(!safe4.AssignTechnicianPopup.style.visibility == "visible"){ // if not visible, abort
        return 'ABORT. Assign Technician Popup is not open.'
    }

    if(safe4.AssignTechnicianPopup.style.visibility == "visible" && currentSelectedGroupText == 'Service Desk' ){ 
        //yet another check, form submit has a hidden woID value of ticket ID- verify it against the ticketId i grabbed in previous steps
        let formHiddenInputTicketId = document.queryXPath("//tr[@class='FormSubmitBG']")[0].children[0].children[0].value;

        return {'message' : 'A.T still open and you have Service Desk in current selected group.',
                'formHiddenWoID': formHiddenInputTicketId
                }
    }

    throw new Error('Faillll')
    
    //if step 1 contained an agent, you need to refactor this to account for its name and its group, and only then assign. For now, just Unassigned and SD

}

//Main function
async function main(row_to_try) {

    try{                 

        //enforce a refresh nd reinject of all code except the call main function (from selenium)
        const safe = await retry (inGroupUnassigned(), 3, 300); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe); 

        const safe0 = await retry (closeLeftover(), 2, 200); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe0); 

        const safe1 = await retry (getElement(row_to_try), 5, 200); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe1); 

        const safe2 = await retry (makeItObject(safe1), 2, 500);
        console.log(await safe2); 

        const safe3 = await retry (openDialog(safe2), 2, 1000);// retry 5 times, a try each second
        console.log(await safe3); 

        const safe4 = await retry (getDialogDivs(safe3), 5, 500);
        console.log(await safe4);

        storage = await safe4; 
        executed += `Ticket ID ${storage.ticketId} is currently assigned to : ${storage.currentTechnician}` + '\n' ;
        console.log(executed)

        const safe5 = await retry (openGroupPopup(safe4), 5, 500);
        console.log(await safe5);
        
        const safe6 = await retry (selectSDGroup(), 5, 500);
        console.log(await safe6);

        const safe7 = await retry (assign(safe4), 5, 500);
        console.log(await safe7);




        //pass last funcion a previous safe to alert ticket id and group

        // actions = await safe6; 
        // actions += `${actions.ticketId} assigned to to group: ${actions.changedGroup}` + '\n' ;
        // console.log(actions)

    } catch(error){
        console.log(error);

        if(error == "TypeError: Cannot read property 'cells' of undefined"){
            console.log('Go back to Group Unassigned stack!')
        }
        if(error == "ReferenceError: makeItObject is not defined"){
            console.log('You are in the wrong place. You should be in Group Unassigned stack!')
        }
        

       
    }


}     

var storage = {}; // this stores safe4 to be used globally
var executed = [];
var actions = [];
//var row_to_try = 6;

main(4);

//try catch is for calls only

// //div[@id='_DIALOG_LAYER'] display!= none