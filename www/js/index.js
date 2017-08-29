// Init App
var myApp = new Framework7({
    init: false,
    modalTitle: 'SafeApp',
    // Enable Material theme
    material: true,
});

// Expose Internal DOM library
var $$ = Dom7;

// Add main view
var mainView = myApp.addView('.view-main', {});


// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function(e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function(e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.hideIndicator();
});

// Callbacks for specific pages when it initialized
/* ===== Page Init ===== */
myApp.onPageInit('', function(page) {

});

/* ===== Handle panel opened/closed event ===== */
$$('.panel-left, .panel-right').on('open', function() {

});
$$('.panel-left, .panel-right').on('close', function() {

});

// Constructor for Hybrid app 
var hybridapp = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', hybridapp.onDeviceReady, false);
        document.addEventListener('pause', hybridapp.onPause, false);
        document.addEventListener('resume', hybridapp.onResume, false);
    },
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {},
    onPause: function() {},
    onResume: function() {},
};

hybridapp.initialize();
myApp.init();