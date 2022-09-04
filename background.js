let private_ip = false;
let allowedIps= ["TEST", "ANOTHER TEST"];

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({"private_ips" : private_ip});
    chrome.storage.sync.set({"allowed_ips" : allowedIps});
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
