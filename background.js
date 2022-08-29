let private_ip = false;


chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.sync.set({"privateIp" : private_ip});
    

    console.log('private ips set to false');
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
