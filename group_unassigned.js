/* Utility functions */
/*1*/async function until(condition, n, ms) {
    let i = 0;

    const poll = resolve => {
      i++; 

      if(condition()) resolve();
      else
        setTimeout(_ => {
          if(i<n){
            poll(resolve)
          }
          else{
            throw new Error('Out of tries.')
          }
          
        }, ms);
        console.log(`${i} waiting...${ms}ms timeout`)
    }
    
    return new Promise(poll)

}
/*2*/async function simulateClick(item){
    item.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    item.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    item.dispatchEvent(new Event('change', {bubbles: true}));

    return 'Clicked';
}


/* Main execution */
async function main(nr){
/*1*/document.getElementById(`RequestsView_r_${nr}_7`).children[0].children[0].children[0].click() // open Assigned To popup of requested row
/*2*/await until(_ => document.getElementById("_DIALOG_LAYER").style.visibility == 'visible', 35, 150); // wait until dialog layer is visible
/*3*/simulateClick(document.getElementById("s2id_assignGroup").children[0]) // Open group after after dialog layer is visible
/*4*/let groupsLi = document.getElementById("select2-drop").children[1].children; // find Service Desk group and assign it
/*4*/for ( i=0; i < groupsLi.length; i ++){
        let currentAgent = document.getElementById(`RequestsView_r_${nr}_7`).children[0].children[0].textContent.trim()
        if(currentAgent == "Unassigned"){
            // Goes to ServiceDesk
            if(groupsLi[i].children[0].textContent == "Service Desk"){
            
                await simulateClick(groupsLi[i]);
                //assign it
                
            }  
            // if (!groupsLi[i].children[0].textContent == "Service Desk"){
            //    console.log("Service Desk not found")
            //  }
        }
        else if (currentAgent == "Richard West"){
            // Goes to ServiceDesk
            if(groupsLi[i].children[0].textContent == "Service Desk"){
            
                await simulateClick(groupsLi[i]);
                //assign it
                
            }            
            //  if (!groupsLi[i].children[0].textContent == "Service Desk"){
            //     console.log("Service Desk not found - Richard West")
            //   }
    
        }

    }
}

await main(0)