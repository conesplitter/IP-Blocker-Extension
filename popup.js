
let privateIpCheckbox = document.getElementById("privateIpCheckbox");

let allowedIpList = document.getElementById("allowedIpList");

let newIpForm = document.getElementById("newIpForm");
let newIpInput = document.getElementById("newIpInput");

let allowedIps = [];

function saveAllowedIpsToLocalStorage(allowedIpsArray) {
    chrome.storage.sync.set({"allowed_ips" : allowedIpsArray});
}

chrome.storage.sync.get(["private_ip"], ({private_ip }) => {
    privateIpCheckbox.checked = private_ip;
})

chrome.storage.sync.get(["allowed_ips"], ({allowed_ips }) => {

    allowed_ips.forEach((ip, index) =>{
        addAllowedIP(ip, index)
    })
})

newIpForm.addEventListener("submit",(e) => {
    e.preventDefault();

    addAllowedIP(newIpInput.value);
    newIpInput.value = "";
    saveAllowedIpsToLocalStorage(allowedIps);
})

function addAllowedIP(ip, index) {
    let li = document.createElement("li");

    let inputField = document.createElement("input")
    inputField.value = ip;
    inputField.readOnly = true;

    let deleteIp = document.createElement("button")
    deleteIp.innerText = "delete"

    deleteIp.addEventListener("click", () => {
        deleteAllowedIp(index, li)
    })

    let editIp = document.createElement("button")
    editIp.innerText = "edit"

    editIp.addEventListener("click", () => {
        editAllowedIp(index, li, inputField);
    })

    li.appendChild(inputField)    
    li.appendChild(deleteIp)
    li.appendChild(editIp)

    allowedIpList.appendChild(li)
    allowedIps.push(ip)

}

function deleteAllowedIp(index, li){
    allowedIps.splice(index, 1);
    li.remove();
    saveAllowedIpsToLocalStorage(allowedIps);
}

function editAllowedIp (index, li, inputField) {
    inputField.readOnly = false;

    let saveIP = document.createElement("button")
    saveIP.innerText = "Save"
    li.appendChild(saveIP)

    saveIP.addEventListener("click", () => {
        allowedIps[index] = inputField.value;
        inputField.readOnly = true;
        saveIP.remove()
        saveAllowedIpsToLocalStorage(allowedIps);
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
