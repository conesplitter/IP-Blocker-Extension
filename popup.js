
let privateIpCheckbox = document.getElementById("privateIpCheckbox");


chrome.storage.sync.get(["private_ip"], ({private_ip }) => {
    privateIpCheckbox.checked = private_ip;
})




privateIpCheckbox.addEventListener('click', () => {
    chrome.storage.sync.set({"private_ip" : privateIpCheckbox.checked});
    
    if (privateIpCheckbox.checked === true){
        const allowUrls = [
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
        
        allowUrls.forEach((domain, index) => {
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
