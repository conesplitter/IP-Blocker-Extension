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


chrome.storage.sync.get(["private_ip"], ({private_ip }) => {
    //Getting the state of the private IP toggle checkbox from the chrome local storage
    privateIpCheckbox.checked = private_ip;
})

chrome.storage.sync.get(["allowed_ips"], ({allowed_ips }) => {
    //getting the arrary of allowed IPs from local storage

    chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
        rules.forEach(rule => {
            if (rule.priority == 3 && !allowed_ips.includes(rule.condition.urlFilter)) {
                allowed_ips.push(rule.condition.urlFilter)
            } 
        })
    }).then(() => {
        allowed_ips.forEach((ip, index) =>{
            //passing the IPs to the addAllowedIP function
            addAllowedIP(ip, index)
        })
    })


})



newIpForm.addEventListener("submit",(e) => {
    //event listener for input field that add new ips
    e.preventDefault();
    let uniqueIp = false;

    chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
        let allIps = [];
        

        rules.forEach(rule => {
            allIps.push(rule.condition.urlFilter);
        })

        if(!allIps.includes(newIpInput.value)){
            uniqueIp = true;
        }

        console.log(newIpInput.value);
        console.log(allIps);
        console.log(allIps.includes(newIpInput.value));
        

     
    }).then(() =>{
        let validIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIpInput.value);
        //           ^^^^ Regex to check to see if the input is a valid ip address

        if (validIp && uniqueIp) {  
            
    
            //passing the value to the addNewAllowedIp function 
            addNewAllowedIp(newIpInput.value);
            
            newIpInput.value = "";
    
            //saving the allowed Ips to local storage
            saveAllowedIpsToLocalStorage(allowedIps);
          } 
          else {
    
            if(!validIp) {
                errorMessage.innerHTML = "Please enter a valid IP address" 
            }
            else if (!uniqueIp) {
                errorMessage.innerHTML = "This IP address is already on the allow list" 
            }
            
    
            newIpInput.addEventListener("click", () => {
                errorMessage.innerHTML = null;
            })
          }
    })
    
    
})


function saveAllowedIpsToLocalStorage(allowedIpsArray) {
    //Function to save the array of allowed IPs to the chrome local storage
    chrome.storage.sync.set({"allowed_ips" : allowedIpsArray});
}


function addAllowedIP(ip, index) {
    //Function to add the allowed IPs to the HTML
    let li = document.createElement("li");

    let inputField = document.createElement("input")
    inputField.value = ip;
    inputField.readOnly = true;

    let deleteIpBtn = document.createElement("button")
    deleteIpBtn.innerText = "delete"

    deleteIpBtn.addEventListener("click", () => {
        deleteAllowedIp(index, li, ip)
    })

    let editIpBtn = document.createElement("button")
    editIpBtn.innerText = "edit"

    editIpBtn.addEventListener("click", () => {
        editIpBtn.disabled = true
        editAllowedIp(index, li, inputField, editIpBtn);
    })

    li.appendChild(inputField)    
    li.appendChild(deleteIpBtn)
    li.appendChild(editIpBtn)

    allowedIpList.appendChild(li)
    allowedIps.push(ip)

}

function addNewAllowedIp(ip) {
    //Function to add a new IP to the list, local storeage and create a rule for it

    //first pass the IP to the addAllowedIP function to create the li for it and add it to the allowedIps array for local storage
    addAllowedIP(ip);

    
    chrome.declarativeNetRequest.getDynamicRules().then((rules) => {


        rules.sort((a, b) => (a.id > b.id) ? 1 : -1) // sorting the rules by ID
        
        let ruleIds = [];
        let ruleId;
    
        rules.forEach(rule => {
            ruleIds.push(rule.id)
        })
        
        const missing = [];
    
        for (let i in ruleIds) {
            // get the size of the gap
            let x = ruleIds[i] - ruleIds[i - 1];
            // start filling in the gap with `1`
            let diff = 1;
            // while there's still a gap, push the correct numbers
            // into `missing`, calculated by the number + diff
            while (diff < x && (ruleIds[i - 1] + diff) > 28) {
              missing.push(ruleIds[i - 1] + diff);
              diff++;
            }
          }

        if(missing.length != 0) {
            ruleId = missing[0];
        }
        else {
            let CurrentMaxId = Math.max.apply(Math, rules.map(rule => rule.id)); // finds the current largest ID number
            ruleId = CurrentMaxId + 1;
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

    allowedIps.splice(index, 1);

    li.remove();
    saveAllowedIpsToLocalStorage(allowedIps);
    chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
        
        rules.forEach(rule => {
            if (rule.condition.urlFilter == ip && rule.priority == 3) {
                chrome.declarativeNetRequest.updateDynamicRules(
                    {
                        removeRuleIds: [rule.id]
                    }
                )
            } 
            else {
                console.log("Rule not found");
            }
        })
    })

}




function editAllowedIp (index, li, inputField, editIpBtn) {
    inputField.readOnly = false;

    //create a save IP btn
    let saveIpBtn = document.createElement("button")
    saveIpBtn.innerText = "Save"
    li.appendChild(saveIpBtn)

    saveIpBtn.addEventListener("click", () => {
        allowedIps[index] = inputField.value;
        inputField.readOnly = true;
        saveIpBtn.remove()
        saveAllowedIpsToLocalStorage(allowedIps);

        editIpBtn.disabled = false;
    })
    
}


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
