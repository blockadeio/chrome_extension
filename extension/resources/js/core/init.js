/**
 * Initialize our global space with a couple setup content and shared resources.
 */
// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-89853823-2']);
// _gaq.push(['_setSessionCookieTimeout', 0]);
// _gaq.push(['_trackPageview', '/background']);
(function() {
    if (typeof localStorage.cfg_init === "undefined") {
        localStorage.cfg_events = JSON.stringify([]);
        localStorage.cfg_indicators = JSON.stringify({});
        localStorage.cfg_debug = false;
        localStorage.cfg_notifications = true;
        localStorage.cfg_feedback = true;
        localStorage.cfg_isRunning = true;
        localStorage.cfg_configured = false;
        localStorage.cfg_lastIndicatorCount = 0;
        localStorage.cfg_firstSync = true;
        localStorage.cfg_init = true;
        localStorage.cfg_dbUpdateTime = 5;
        localStorage.cfg_localDatabase = false;
        localStorage.cfg_channels = JSON.stringify([{
            id: 0,
            url: 'https://api.blockade.io/',
            contact: 'info@blockade.io',
            username: '',
            api_key: ''
        }]);
        chrome.tabs.create({'url': SETUP_PAGE});
    }
    // var ga = document.createElement('script');
    // ga.type = 'text/javascript';
    // ga.async = false;
    // ga.src = 'https://ssl.google-analytics.com/ga.js';
    // var s = document.getElementsByTagName('script')[0];
    // s.parentNode.insertBefore(ga, s);
})();

var parser = document.createElement('a');
var pattern = new RegExp(/\bLTBYPASS-[0-9]{5}\b/g);
var bypass = /#LTBYPASS-[0-9]{5}/;