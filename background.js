let private_ip = false;


chrome.runtime.onInstalled.addListener(() => {

    let idToDelete = [];


    chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
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
    

        rules.forEach(rule => {
            if(privateIpsArray.includes(rule.condition.urlFilter) && rule.priority == 2) {
                idToDelete.push(rule.id)
            }
        })

    }).then(() =>{ 
        
        idToDelete.forEach(id => {
            chrome.declarativeNetRequest.updateDynamicRules(
                {    
                    //delete all of the private IP allow rules if someone has reinstalled the plugin 
                    removeRuleIds: [id]
                })
            })
        })



}) 


const blockUrls = [
    "*://0*.*.*.*",
    "*://1*.*.*.*",
    "*://2*.*.*.*",
    "*://3*.*.*.*",
    "*://4*.*.*.*",
    "*://5*.*.*.*",
    "*://6*.*.*.*",
    "*://7*.*.*.*",
    "*://8*.*.*.*",
    "*://9*.*.*.*",

];

blockUrls.forEach((domain, index) => {
    let id = index + 19;

    chrome.declarativeNetRequest.updateDynamicRules(
       {addRules:[{
          "id": id,
          "priority": 1,
          "action": { "type": "block" },
          "condition": {"urlFilter": domain, "resourceTypes": ["main_frame"] }}
         ],
         removeRuleIds: [id]
       },
    )
})
