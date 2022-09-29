let privateIpCheckbox = document.getElementById("privateIpCheckbox");

let allowedIpList = document.getElementById("allowedIpList");

let newIpForm = document.getElementById("newIpForm");
let newIpInput = document.getElementById("newIpInput");

let allowedIps = [];



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

    //passing the value to the addNewAllowedIp function 
    addNewAllowedIp(newIpInput.value);
    
    newIpInput.value = "";

    //saving the allowed Ips to local storage
    saveAllowedIpsToLocalStorage(allowedIps);
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

    // allowedIps.forEach((ip, index) => {
    //     console.log(ip);
    // })
    

    let id = 29 + allowedIps.length;
    // let id


        chrome.declarativeNetRequest.updateDynamicRules(
            {addRules:[{
               "id": id,
               "priority": 3,
               "action": { "type": "allowAllRequests" },
               "condition": {"urlFilter": ip, "resourceTypes": ["main_frame"] }}
              ],
              removeRuleIds: [id]
            },
         )
    
    })

    
}




function deleteAllowedIp(index, li, ip){
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
    let saveIP = document.createElement("button")
    saveIP.innerText = "Save"
    li.appendChild(saveIP)

    saveIP.addEventListener("click", () => {
        allowedIps[index] = inputField.value;
        inputField.readOnly = true;
        saveIP.remove()
        saveAllowedIpsToLocalStorage(allowedIps);

        editIpBtn.disabled = false;
    })
    
}


//Event listener for when the checkbox is clicked
privateIpCheckbox.addEventListener('click', () => {
    chrome.storage.sync.set({"private_ip" : privateIpCheckbox.checked}); // Set the checkbox value to local storage
    
    if (privateIpCheckbox.checked === true){
        const allowIps = [ //array of private IP addresses
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
        
        allowIps.forEach((domain, index) => {
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
            console.log('RULE ADDED');
        })
    }
    else {
        chrome.declarativeNetRequest.updateDynamicRules(
        {
            removeRuleIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
        })
    }



    chrome.declarativeNetRequest.getDynamicRules(rule => {
        console.log(rule);
    })

})
