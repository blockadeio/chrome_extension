function populate_demo() {
    document.getElementById("demoTitle").innerHTML = chrome.i18n.getMessage("demoTitle");
    document.getElementById("demoP1").innerHTML = chrome.i18n.getMessage("demoP1");
    document.getElementById("demoP2").innerHTML = chrome.i18n.getMessage("demoP2");
    var test = "http://test.blockade.io/no-face.jpg?";
    var rand = Math.floor(Math.random()*90000) + 10000;
    // We do this to bust up the cache
    document.getElementById("test").src = test + rand;
    var cleanup = setInterval(function () {
        if (localStorage["test.blockade.io"] !== null) {
            localStorage.removeItem("test.blockade.io");
            clearInterval(cleanup);
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', populate_demo);