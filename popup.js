let privateIpCheckbox = document.getElementById("privateIpCheckbox");
let allowedIpList = document.getElementById("allowedIpList");
let newIpForm = document.getElementById("newIpForm");
let newIpInput = document.getElementById("newIpInput");
let errorMessage = document.getElementById("errorMessage");

let allowedIps = [];

const privateIpsArray = [ //array of private IP addresses
    "*://10.*.*.*",

    "*://192.168.*.*",

    "*://172.16.*.*",
    "*://172.17.*.*",
    "*://172.18.*.*",
    "*://172.19.*.*",
    "*://172.20.*.*",
    "*://172.21.*.*",
    "*://172.22.*.*",
    "*://172.23.*.*",
    "*://172.24.*.*",
    "*://172.25.*.*",
    "*://172.26.*.*",
    "*://172.27.*.*",
    "*://172.28.*.*",
    "*://172.29.*.*",
    "*://172.30.*.*",
    "*://172.31.*.*",

];

const errorMessages = [
    "Please enter a valid IP address",
    "This IP address is already on the allow list"
]

intialGetRules()
setPrivateIpCheckbox();




newIpForm.addEventListener("submit",(e) => {
    //event listener for input field that add new ips
    e.preventDefault();
    let uniqueIp = false;

    getRules().then((rules) =>{
        let allIps = [];
        

        rules.forEach(rule => {
            allIps.push(rule.condition.urlFilter);
        })

        if(!allIps.includes(newIpInput.value)){
            uniqueIp = true;
        }

        let validIp = isIpValid(newIpInput.value) 


        if (validIp && uniqueIp) {  
            
    
            //passing the value to the addNewAllowedIp function 
            addNewAllowedIp(newIpInput.value);
            
            newIpInput.value = "";
    

          } 
          else {
    
            if(!validIp) {
                errorMessage.innerHTML = errorMessages[0] //Please enter a valid IP address
            }
            else if (!uniqueIp) {
                errorMessage.innerHTML = errorMessages[1] //This IP address is already on the allow list
            }
            
    
            newIpInput.addEventListener("click", () => {
                errorMessage.innerHTML = null;
            })

            newIpInput.addEventListener("input", () => {
                errorMessage.innerHTML = null;
            })

          }

    })
})


//Event listener for when the checkbox is clicked
privateIpCheckbox.addEventListener('click', () => {
    
    if (privateIpCheckbox.checked === true){

        
        privateIpsArray.forEach((domain, index) => {
            let id = index + 1;
        
            chrome.declarativeNetRequest.updateDynamicRules(
               {addRules:[{
                  "id": id,
                  "priority": 2,
                  "action": { "type": "allowAllRequests" },
                  "condition": {"urlFilter": domain, "resourceTypes": ["main_frame"] }}
                 ],
                 removeRuleIds: [id]
               },
            )
          
        })
    }
    else {
        chrome.declarativeNetRequest.updateDynamicRules(
        {
            removeRuleIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
        })
    }
})



async function intialGetRules(){
    //Function to get the rules initially to then add to the HTML 
    const rules = await getRules();
    rules.forEach(rule => {
        if (rule.priority == 3) {
            //allowed IPs that the user has added have a priority of 3
            allowedIps.push(rule.condition.urlFilter)
        } 
    })

    allowedIps.forEach((ip, index) =>{
        //passing the IPs to the addAllowedIPsToHTML function which will render them in the html
        addAllowedIPsToHTML(ip, index)
    })
}



async function setPrivateIpCheckbox() {
    //function to see if there is already allow rules for the private IP ranges to then set the privateIpCheckbox.checked value
    let possiblePrivateIPs = [];
    const rules = await getRules();

    rules.forEach(rule => {
        if (rule.priority == 2) {
            possiblePrivateIPs.push(rule.condition.urlFilter)
        } 
    })

    if(privateIpsArray.every(ip => possiblePrivateIPs.includes(ip))) {
        privateIpCheckbox.checked = true;
    }
    else {
        privateIpCheckbox.checked = false;
    }
}



async function getRules() {
    //Funciton to get all of the rules
    try {
        return await chrome.declarativeNetRequest.getDynamicRules();
    } catch(error) {
        console.log(error);
    }
}



function isIpValid(ip) {
    //Function to check if an IP address is vaild
   return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)
   //^^^^ Regex to check to see if the input is a valid ip address
}




function addAllowedIPsToHTML(ip, index) {
    //Function to add the allowed IPs to the HTML
    let li = document.createElement("li");

    //Create the div that the IP address (in the input element) and the edit and delete btns will be in
    let AllowedIPAndBtnsDiv = document.createElement("div");
    AllowedIPAndBtnsDiv.classList.add("AllowedIPAndBtns")
    li.appendChild(AllowedIPAndBtnsDiv) //Add to the Li of the allowed IPs list


    let inputField = document.createElement("input")
    inputField.value = ip;
    inputField.readOnly = true;

    let deleteIpBtn = document.createElement("button")
    deleteIpBtn.innerText = "Delete"
    deleteIpBtn.classList.add("deleteBtn", "btn")

    deleteIpBtn.addEventListener("click", () => {
        deleteAllowedIp(index, li, ip)
    })

    let editIpBtn = document.createElement("button")
    editIpBtn.innerText = "Edit"
    editIpBtn.classList.add("editBtn", "btn")


    editIpBtn.addEventListener("click", () => {
        editAllowedIp(index, li, AllowedIPAndBtnsDiv, inputField, editIpBtn, inputField.value);
    })

    AllowedIPAndBtnsDiv.appendChild(inputField)    
    AllowedIPAndBtnsDiv.appendChild(deleteIpBtn)
    AllowedIPAndBtnsDiv.appendChild(editIpBtn)

    allowedIpList.appendChild(li)

}

async function addNewAllowedIp(ip) {
    //Function to add a new IP to the rule list

    //first pass the IP to the addAllowedIPsToHTML function to create the li for it and add it to the allowedIps array for local storage
    addAllowedIPsToHTML(ip);

    const rules = await getRules();
    

    rules.sort((a, b) => (a.id > b.id) ? 1 : -1) // sorting the rules by ID
        
    let ruleIds = [];
    let ruleId;

    rules.forEach(rule => {
        ruleIds.push(rule.id) //add the rule IDs to a new variable
    })
    
    let gapsInRuleIDs = [];

    for (let i in ruleIds) {
        //find gaps in the rules, as long as that ID number is greater than 28
        //28 because thats the number of rules for blocking the private and public IP ranges

        // get the size of the gap
        let x = ruleIds[i] - ruleIds[i - 1];

        // start filling in the gap with `1`
        let diff = 1;

        // while there's still a gap, push the correct numbers
        // into `gapsInRuleIDs`, calculated by the number + diff
        while (diff < x && (ruleIds[i - 1] + diff) > 28) {
          gapsInRuleIDs.push(ruleIds[i - 1] + diff);
          diff++;
        }
      }

    if(gapsInRuleIDs.length != 0) {
        ruleId = gapsInRuleIDs[0]; //If there is a gap, get the first gap from the array
    }
    else {
        let CurrentMaxId = Math.max.apply(Math, rules.map(rule => rule.id)); // finds the current largest ID number
        ruleId = CurrentMaxId + 1; // new highest ID
    }



    chrome.declarativeNetRequest.updateDynamicRules(
        {addRules:[{
            "id": ruleId,
            "priority": 3,
            "action": { "type": "allowAllRequests" },
            "condition": {"urlFilter": ip, "resourceTypes": ["main_frame"] }}
            ],
            removeRuleIds: [ruleId]
        },
        )
}




async function deleteAllowedIp(index, li, ip){
    // Function to delete an IP from the allow list

    allowedIps.splice(index, 1); //delete it from the local allowed IP array

    const rules = await getRules();

    li.remove();


    rules.forEach(rule => {
        if (rule.condition.urlFilter == ip && rule.priority == 3) {
            //if IP address of the rule and the one passed match and the prority is 3 then delete the rule
            chrome.declarativeNetRequest.updateDynamicRules(
                {
                    removeRuleIds: [rule.id]
                }
            )
        } 
    })

}



async function editAllowedIp (index, li, AllowedIPAndBtnsDiv, inputField, editIpBtn, ip) {
    //function that edits the allowed IP addresses

    //allows the user to edit the field and hide the edit btn
    inputField.readOnly = false;
    editIpBtn.classList.add("hidden");

    const rules = await getRules();

    //create a save IP btn
    let saveIpBtn = document.createElement("button")
    saveIpBtn.innerText = "Save"
    saveIpBtn.classList.add("btn","saveBtn")
    AllowedIPAndBtnsDiv.appendChild(saveIpBtn)

    saveIpBtn.addEventListener("click", () => {
        let ruleId;
        let uniqueIp = false;
        

        let allIps = [];
        

        rules.forEach(rule => {
            allIps.push(rule.condition.urlFilter); //push all of the IP addresses to a new variable
        })

        if (!allIps.includes(inputField.value) || inputField.value == ip){ 
            // If the new IP isn't already on the allowed or the IP address is the same as it already was
            uniqueIp = true;
        }


        rules.forEach(rule => {
            if(rule.condition.urlFilter == ip && rule.priority == 3){
                //finds the ID of the old IP address
                ruleId = rule.id
            }
        })


        let validIp = isIpValid(inputField.value) //check if the new IP is a vaild IP address

        if(validIp && uniqueIp) {
            

            allowedIps[index] = inputField.value; //saving the IP address to the local array of IPs
            inputField.readOnly = true; //set it back so they can't edit it
            saveIpBtn.remove()
    
            editIpBtn.classList.remove("hidden");

            chrome.declarativeNetRequest.updateDynamicRules(
                //save the new IP address to the ID of the old one
                {addRules:[{
                   "id": ruleId,
                   "priority": 3,
                   "action": { "type": "allowAllRequests" },
                   "condition": {"urlFilter": inputField.value, "resourceTypes": ["main_frame"] }}
                  ],
                  removeRuleIds: [ruleId]
                },
             )
        }
        else {
            //Error cehcking for editing the IP

            let editErrorMessage = document.createElement("p")
            
            if(!validIp) {
                editErrorMessage.innerHTML = errorMessages[0] //Please enter a valid IP address
            }
            else if (!uniqueIp) {
                editErrorMessage.innerHTML = errorMessages[1] //This IP address is already on the allow list
            }

            li.appendChild(editErrorMessage)   
            
    
            inputField.addEventListener("click", () => {
                editErrorMessage.remove();
            })

            inputField.addEventListener("input", () => {
                editErrorMessage.remove();
            })
        }
    })
    
}