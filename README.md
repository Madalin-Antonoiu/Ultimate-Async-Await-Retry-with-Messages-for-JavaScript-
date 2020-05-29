# Ultimate-Async-Await-Retry-with-Messages-for-JavaScript-

* Tested on https://servicedesk.csiltd.co.uk with Selenium integration, on Assigned To collumn (7th) containing Unassigned or not
```
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

// Helper functions
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
    row.simulateClick = function(item) {
        item.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        item.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        item.dispatchEvent(new Event('change', {bubbles: true}));

        return true;
    }
    

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
        
        row.simulateClick(row.assign);

        return  x = { 'message':'Clicked to open dialog.'}

    }

    throw new Error('Fail - AssignedTo does not contain "Unassigned" for this row.')

}

async function assignTicket (elem) {//converted
    let x = {};

    if (elem.message.includes('Clicked to open dialog')){

        var group = await document.queryXPath("//div[@id='s2id_assignGroup']")[0]; 

        if(group !== null){
            group.style.outline='2px solid orange';
            
            return x = { 'message' : 'Success - Reached the end.',
                         'element' : group }
        }
    
        throw new Error('Fail - Could not target "Group"')

    }

    throw new Error('Fail - Previous did not return : Dialog is open ')

};

//Main function
async function main() {

    try{                 
        const safe1 = await retry (getElement(row_to_try), 1, null); // get element will return the element from within, dont put try 0 times lol
        console.log(await safe1); 

        const safe2 = await retry (gotChildren(safe1), 1, null);
        console.log(await safe2); 

        const safe3 = await retry (openDialog(safe2), 5, 1000);// retry 5 times, a try each second
        console.log(await safe3); 

        const safe4 = await retry (assignTicket(safe3), 5, 500);
        console.log(await safe4); 
        
    } catch(error){
        console.log(error);
    }


}   

var row_to_try = 6;
main();


//try catch is for calls only
```
