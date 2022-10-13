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


chrome.storage.sync.get(["private_ip"], ({private_ip }) => {
    //Getting the state of the private IP toggle checkbox from the chrome local storage
    privateIpCheckbox.checked = private_ip;
})

getRules().then((rules) => {
    rules.forEach(rule => {
        if (rule.priority == 3) {
            allowedIps.push(rule.condition.urlFilter)
        } 
    })

    allowedIps.forEach((ip, index) =>{
        //passing the IPs to the addAllowedIP function which will render them in the html
        addAllowedIP(ip, index)
    })
})



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
    
            //saving the allowed Ips to local storage
            saveAllowedIpsToLocalStorage(allowedIps);
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

async function getRules() {
    try {
        return await chrome.declarativeNetRequest.getDynamicRules();
    } catch(error) {
        console.log(error);
    }
}



function isIpValid(ip) {
   return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)
   //^^^^ Regex to check to see if the input is a valid ip address
}


function saveAllowedIpsToLocalStorage(allowedIpsArray) {
    //Function to save the array of allowed IPs to the chrome local storage
    chrome.storage.sync.set({"allowed_ips" : allowedIpsArray});
}


function addAllowedIP(ip, index) {
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
        editAllowedIp(index, li, AllowedIPAndBtnsDiv, inputField, editIpBtn, ip);
    })

    AllowedIPAndBtnsDiv.appendChild(inputField)    
    AllowedIPAndBtnsDiv.appendChild(deleteIpBtn)
    AllowedIPAndBtnsDiv.appendChild(editIpBtn)

    allowedIpList.appendChild(li)

}

function addNewAllowedIp(ip) {
    //Function to add a new IP to the list, local storeage and create a rule for it

    //first pass the IP to the addAllowedIP function to create the li for it and add it to the allowedIps array for local storage
    addAllowedIP(ip);

    
    getRules().then((rules) => {


        rules.sort((a, b) => (a.id > b.id) ? 1 : -1) // sorting the rules by ID
        
        let ruleIds = [];
        let ruleId;
    
        rules.forEach(rule => {
            ruleIds.push(rule.id) //add the rule IDs to a new variable
        })
        
        const gapsInRuleIDs = [];
    
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

        


    })
}




function deleteAllowedIp(index, li, ip){
    // Function to delete an IP from the allow list

    allowedIps.splice(index, 1); //delete it from the local allowed IP array

    li.remove();
    saveAllowedIpsToLocalStorage(allowedIps); //save local allowed IP array to local storage
    getRules().then((rules) => {
        
        rules.forEach(rule => {
            if (rule.condition.urlFilter == ip && rule.priority == 3) {
                //if the ID of the rule by the IP address and the prority
                console.log(`${rule.id} has been deleted`);
                chrome.declarativeNetRequest.updateDynamicRules(
                    {
                        removeRuleIds: [rule.id]
                    }
                )
            } 
        })
    })

}




function editAllowedIp (index, li, AllowedIPAndBtnsDiv, inputField, editIpBtn, ip) {
    //function that edits the allowed IP addresses

    //allows the user to edit the field and hide the edit btn
    inputField.readOnly = false;
    editIpBtn.classList.add("hidden");


    //create a save IP btn
    let saveIpBtn = document.createElement("button")
    saveIpBtn.innerText = "Save"
    saveIpBtn.classList.add("btn","saveBtn")
    AllowedIPAndBtnsDiv.appendChild(saveIpBtn)

    saveIpBtn.addEventListener("click", () => {
        let id;
        let uniqueIp = false;
        
        getRules().then((rules) => {

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
                    id = rule.id
                }
            })


            let validIp = isIpValid(inputField.value) //check if the new IP is a vaild IP address

            if(validIp && uniqueIp) {
                

                allowedIps[index] = inputField.value; //saving the IP address to the local array of IPs
                inputField.readOnly = true; //set it back so they can't edit i
                saveIpBtn.remove()
                saveAllowedIpsToLocalStorage(allowedIps); //save the allowed Ips array to local storage
        
                editIpBtn.classList.remove("hidden");
    
                chrome.declarativeNetRequest.updateDynamicRules(
                    //save the new IP address to the ID of the old one
                    {addRules:[{
                       "id": id,
                       "priority": 3,
                       "action": { "type": "allowAllRequests" },
                       "condition": {"urlFilter": inputField.value, "resourceTypes": ["main_frame"] }}
                      ],
                      removeRuleIds: [id]
                    },
                 )
            }
            else {
                //error cehcking for editing the IP

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
    })
    
}



getRules().then((t) => {
    console.log(t);
})



//Event listener for when the checkbox is clicked
privateIpCheckbox.addEventListener('click', () => {
    chrome.storage.sync.set({"private_ip" : privateIpCheckbox.checked}); // Set the checkbox value to local storage
    
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
