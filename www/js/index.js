 // Countdown timer
var confirmTimer;

// Init App
var myApp = new Framework7({
    init: false,
    modalTitle: 'SafeApp',
    // Enable Material theme
    material: true,
    materialPageLoadDelay: 800
});


// Constructor for Hybrid app 
var hybridapp = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', hybridapp.onDeviceReady, false);
        document.addEventListener('pause', hybridapp.onPause, false);
        document.addEventListener('resume', hybridapp.onResume, false);
        // Initialize Firebase
        // hybridapp.firebaseInit();
        // try {
        //     // Register Auth Provider
        //     if (cordova) hybridapp.registerAuthProvider();
        // } catch (error) {
        //     // Initialize Firebase Web UI
        //     hybridapp.firebaseUIInit();
        // }
    },
    // deviceready Event Handler
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        function onSuccess() {

        }
        
        if( window.plugins && window.plugins.NativeAudio ) {
	
	// Preload audio resources
	window.plugins.NativeAudio.preloadComplex( 'panicalert', 'audio/alert.mp3', 1, 1, 0, function(msg){
	}, function(msg){
		console.log( 'error: ' + msg );
	});
    }
        
        document.addEventListener("volumedownbutton", onVolumeDownKeyDown, false);
        document.addEventListener("volumeupbutton",onVolumeUpKeyDown, false);
        myApp.waitTimerCount = 0;
        function onVolumeDownKeyDown() {
            myApp.waitTimerCount++;
            setTimeout(function(){myApp.waitTimerCount = 0},2000)
            if(myApp.waitTimerCount >= 3){
                myApp.alert("You activated the panic alarm, press the volume up button to stop");
                window.plugins.NativeAudio.loop( 'panicalert' );
            }
        }
        
        function onVolumeUpKeyDown(){
            window.plugins.NativeAudio.stop('panicalert');
            window.plugins.NativeAudio.unload('panicalert');
                
            if( window.plugins && window.plugins.NativeAudio ) {
	
	// Preload audio resources
	window.plugins.NativeAudio.preloadComplex( 'panicalert', 'audio/alert.mp3', 1, 1, 0, function(msg){
	}, function(msg){
		console.log( 'error: ' + msg );
	});
    }
        }

        function onError(e) {
            hybridapp.requestLocation();
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 10000 });
        hybridapp.showOngoingNotification();
    },
    onPause: function() {},
    onResume: function(resumeEvent) {
        if (resumeEvent.pendingResult) {
            if (resumeEvent.pendingResult.pluginStatus === "OK") {
                var contact = navigator.contacts.create(resumeEvent.pendingResult.result);
                hybridapp.pickContactSuccessCallback(contact);
            } else {
                hybridapp.pickFailCallback(resumeEvent.pendingResult.result);
            }
        }
    },
    showOngoingNotification: function() {
        var actions = [
            // {
            //     identifier: 'SIGN_IN',
            //     title: 'Yes',
            //     icon: 'res://ic_signin',
            //     activationMode: 'background',
            //     destructive: false,
            //     authenticationRequired: true
            // },
            {
                identifier: 'CALL_ME_NOW',
                title: 'CALL ME NOW',
                activationMode: 'foreground',
                destructive: false,
                authenticationRequired: false
            }
        ];

        cordova.plugins.notification.local.schedule({
            id: 1,
            title: "SafeApp Silent SOS",
            text: "Request your designated contact to call you immediately",
            at: Date.now(),
            actions: [actions[0]],
            ongoing: true,
            category: 'REQUEST_CALL'
        });
        cordova.plugins.notification.local.on("click", function(notification) {
            var contacts = [];
            if (window.localStorage.getItem('contacts'))
                contacts = JSON.parse(window.localStorage.getItem('contacts'));

            if (contacts.length > 0) {
                $$.each(contacts, function(e, i) {
                    hybridapp.sendSMS(i);
                });
            }
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: "SafeApp Silent SOS",
                text: "Request your designated contact to call you immediately",
                at: Date.now(),
                actions: [actions[0]],
                ongoing: true,
                category: 'REQUEST_CALL'
            });
        });
        cordova.plugins.notification.local.on('action', function(notification, state, data) {
            var contacts = [];
            if (window.localStorage.getItem('contacts'))
                contacts = JSON.parse(window.localStorage.getItem('contacts'));

            if (data.identifier === 'CALL_ME_NOW') {
                if (contacts.length > 0) {
                    $$.each(contacts, function(e, i) {
                        hybridapp.sendSMS(i);
                    });
                }
            }
        });
    },
    otherContactTpl: function(contact) {
        var id = contact.id,
            phoneNumber = contact.phoneNumbers ? contact.phoneNumbers[0].value : contact.displayName,
            displayName = contact.displayName || contact.phoneNumbers[0].value;
        return '<li><a class="item-link item-content" href="#" data-id="' + contact.id + '">' +
            '<div class="item-inner">' +
            '<div class="item-title-row"><div class="item-title">' + displayName + '</div></div>' +
            '<div class="item-subtitle">' + phoneNumber + '</div>' +
            '</div></a>' +
            '<div class="sortable-handler"></div>' +
            '</li>';
    },
    processTimeLeft: function() {
        var timeleft = 20;

        $$('.floating-button').on('click', function() {
            clearInterval(confirmTimer);
            mainView.router.back();
        });

        confirmTimer = setInterval(function() {
            $$('.notice span').text(--timeleft);
            if (timeleft <= 0) {
                clearInterval(confirmTimer);
                mainView.router.back();
            }
        }, 1000);
    },
    signUpUser: function(page) {

        var username = $$(page.container).find('#email').val();
        var password = $$(page.container).find('#password').val();

        if (username.length > 0 && password.length > 0) {
            $$.ajax({
                url: 'http://safeapp.appwebstage.com/api_v2/auth/login',
                async: true,
                crossDomain: true,
                method: 'POST',
                data: {
                    "u": username,
                    "p": password
                },
                beforeSend: function(xhr) {},
                error: function(xhr, status) {
                    myApp.alert("Error "+status+": Could not Login.");
                },
                success: function(data, status, xhr) {
                    var user = JSON.parse(data);
                    if (user.id) {
                        localStorage.setItem("userData",JSON.stringify(user));
                        mainView.router.load({ url: 'introduction.html' });
                        window.localStorage.setItem('loggedin', true);
                        myApp.hidePreloader();
                    } else {
                        myApp.hidePreloader();
                        myApp.alert("User not found");
                    }
                }
            });
        } else {
            myApp.hidePreloader();
            myApp.alert('Valid credentials required . . .');
        }
    },
    sendSMS: function(contact) {
        var phoneNumber = contact.phoneNumbers ? contact.phoneNumbers[0].value : contact.displayName;

        //CONFIGURATION
        var options = {
            replaceLineBreaks: false,
            android: { intent: '' }
        };

        var success = function() {
            myApp.hidePreloader();
            alert('Message sent successfully');
        };
        var error = function(e) {
            myApp.hidePreloader();
            alert('Message Failed:' + e);
        };
        sms.send(phoneNumber, "Please call me now! It's important.", options, success, error);
    },
    sendSMSToDesignatedContacts: function(trigger) {

        var contacts = [];
        var options = {
            replaceLineBreaks: false,
            android: { intent: '' }
        };
        var success = function() {
            alert('Message sent successfully');
        };
        var error = function(e) {
            alert('Message Failed:' + e);
        };
        if (window.localStorage.getItem('contacts')) {
            contacts = JSON.parse(window.localStorage.getItem('contacts'));
        }
        if (contacts.length > 0) {
            myApp.showPreloader('Sending SMS to ' + contacts.length + ' contacts');
            $$.each(contacts, function(e, i) {
                var message = "Testing SafeApp Designated Contact SMS feature."
                var phoneNumber = i.phoneNumbers ? i.phoneNumbers[0].value : '';
                if (phoneNumber == '') {
                    return;
                }
                sms.send(phoneNumber, message, options, success, error);
            });
            trigger.parents('.other-actions').find('.state').html('<i class="icon icon-notified"></i> Your contacts have been notified.');
            trigger.parents('.other-actions').find('.buttons-row').remove();
        } else {
            myApp.alert("No emergency contacts set.");
        }
        myApp.hidePreloader();
    },
    pickContactSuccessCallback: function(contact) {
        var contacts = [];
        if (window.localStorage.getItem('contacts')) {
            contacts = JSON.parse(window.localStorage.getItem('contacts'));
        }
        contacts.push(contact);
        window.localStorage.setItem('contacts', JSON.stringify(contacts));
        $$('#contact-list').empty();
        $$.each(contacts, function(e, i) {
            $$('#contact-list').append($$(hybridapp.otherContactTpl(i)));
        });
    },
    pickFailCallback: function(error) {
        alert('Error: ' + error);
    },
    showMyLocation: function() {
        window.open = cordova.InAppBrowser.open;

        function onSuccess(position) {
            var geouri = 'geo:' + position.coords.latitude + ',' + position.coords.longitude + '?q=' + position.coords.latitude + ',' + position.coords.longitude + '(Your+current+Location)';
            myApp.hidePreloader();
            window.open(geouri, '_system', 'location=yes');
        };

        function onError(error) {
            myApp.hidePreloader();
            hybridapp.requestLocation();
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 10000 });
    },
    sendSOSRequest: function(type) {
        myApp.showPreloader('Processing');
        var content, title, excerpt, savedIncidents = [];


        if (window.localStorage.getItem('savedincident'))
            savedIncidents = JSON.parse(window.localStorage.getItem('savedincident'));


        function onSuccess(position) {
            content += '<a href="https://maps.google.com/?q=' + position.coords.latitude + ',' + position.coords.longitude + '" target="_blank">' + position.coords.latitude + ',' + position.coords.longitude + '</a>';
            $$.ajax({
                url: 'http://safeapp.appwebstage.com/api_v2/ticket/set',
                async: true,
                crossDomain: true,
                method: 'POST',
                data: {
                    "ticket_type": 1,
                    "ticket_location": content
                },
                headers: {
                    "X-USER": JSON.parse(localStorage.getItem("userData")).user_id
                },
                beforeSend: function(xhr) {},
                error: function(xhr, status) {
                    console.log(status, xhr);
                    myApp.hidePreloader();
                    if (type == "emergency") {
                        $$('a.emergency').removeClass('disabled');
                        window.localStorage.removeItem('emergencyinprogress');
                    } else {
                        $$('a.first-aid').removeClass('disabled');
                        window.localStorage.removeItem('firstaidinprogress');
                    }
                },
                success: function(data, status, xhr) {
                    myApp.hidePreloader();
                    console.log(data);
                    var results = data;
                    if (type == "emergency") {
                        $$('a.emergency').addClass('disabled');
                        window.localStorage.setItem('emergencyinprogress', "true");
                        
                    } else {
                        $$('a.first-aid').addClass('disabled');
                        window.localStorage.setItem('firstaidinprogress', "true");
                    }

                    savedIncidents.push(results);
                    localStorage.setItem("current_ticket",results);
                    window.localStorage.setItem('savedincident', JSON.stringify(savedIncidents));
                }
            });
        }

        function onError(error) {
            myApp.hidePreloader();
            hybridapp.requestLocation();
        }

        switch (type) {
            case 'emergency':
                content = "Testing Emergency SOS from ";
                title = "Emergency SOS!";
                excerpt = "This is just a test.";
                break;
            case 'firstaid':
                content = "Testing First Aid SOS from ";
                title = "First-Aid SOS!";
                excerpt = "This is just a test.";
                break;
            default:
                break;
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 10000 });

    },
    removeContact: function(id) {
        var contacts = [];
        if (window.localStorage.getItem('contacts')) {
            contacts = JSON.parse(window.localStorage.getItem('contacts'));
        }
        myApp.confirm("Delete this contact", function() {
            if (contacts.length > 0) {
                contacts = contacts.filter(function(e, i) {
                    return parseInt(e.id) != parseInt(id);
                });
                window.localStorage.setItem('contacts', JSON.stringify(contacts));
                $$('#contact-list').empty();
                $$.each(contacts, function(e, i) {
                    $$('#contact-list').append($$(hybridapp.otherContactTpl(i)));
                });
                $$('#contact-list a').on('click', function() {
                    var id = $$(this).data('id');
                    hybridapp.removeContact(id);
                });
            }
        }, function() {});
    },
    pickContactAndSendSMS: function() {
        navigator.contacts.pickContact(function(contact) {
            var name = contact.displayName || '',
                number = contact.phoneNumbers ? contact.phoneNumbers[0].value : '';
            hybridapp.sendSMS(contact);
        }, function(err) {
            myApp.alert("Couldn't fetch contacts.")
            console.log('Error: ' + err);
        });
    },
    requestLocation: function() {
        cordova.dialogGPS("Your GPS is Disabled, SafeApp needs it to work.", //message
            "Use GPS, with wifi or 3G.", //description
            function(buttonIndex) { //callback
                switch (buttonIndex) {
                    case 0:
                        break; //cancel
                    case 1:
                        break; //neutro option
                    case 2:
                        break; //user go to configuration
                    default:
                        break;
                }
            },
            "Please Turn on your GPS", //title
            ["Cancel", "Later", "Go"]); //buttons
    },
    generateIncidentTpl: function(incident) {
        return '<li><div class="item-content">' +
            '<div class="item-inner"><div class="item-title-row">' +
            '<div class="item-title">' + incident.title.rendered + '</div>' +
            '<div class="item-after">Open</div>' +
            '</div>' +
            '<div class="item-subtitle">' + incident.content.rendered + '</div>' +
            '<div class="item-text">' + incident.date_gmt + '</div>' +
            '</div></div></li>';
    },
    showAllIncidents: function(incidents) {
        var $$container = $$('#incident-list');
        $$container.empty();
        $$.each(incidents, function(e, i) {
            $$container.append($$(hybridapp.generateIncidentTpl(i)));
        });
    }
};


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
});

$$(document).on('ajaxComplete', function(e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
});

// Callbacks for specific pages when it initialized
/* ===== Page Init ===== */
myApp.onPageInit('index', function(page) {
    window.setTimeout(function() {
        if (window.localStorage.getItem('loggedin') == "true") {
            document.getElementById('body').classList = 'framework7-root verified';
            mainView.router.load({ url: 'dashboard.html' });
        } else {
            document.getElementById('body').classList = 'framework7-root signout';
            mainView.router.load({ url: 'login.html' });
            window.localStorage.setItem('loggedin', false);
        }
    }, 3000);

});

myApp.onPageInit('login', function(page) {
    $$('#signin').on('click', function(e) {
        e.preventDefault();
        myApp.showPreloader("Please wait . . .");
        hybridapp.signUpUser(page);
    });
});

myApp.onPageInit('introduction', function(page) {
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 'auto',
        centeredSlides: true,
        paginationClickable: true,
        spaceBetween: 30
    });
});

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    if(mainView.activePage.name != "dashboard"){
        mainView.router.back();
    }
    
}

myApp.onPageInit('change_account', function (page) {
    $$('#switchAccountId').on('click', function () {
        myApp.alert("You do not have other accounts!");
    });
});

myApp.onPageInit('dashboard', function(page) {
    localStorage.setItem("msgCount",0);
    $$('.floating-button').on('click', function() {
        var clickedLink = this;
        myApp.popover('.dial-popover', clickedLink);
    });
    $$('.more-link').on('click', function() {
        var clickedLink = this;
        myApp.popover('.more-popover', clickedLink);
    });
    $$('#checkin').on('click', function() {
        myApp.closeModal();
        myApp.showPreloader('Sending check-in ping');

        function onSuccess(position) {
            myApp.hidePreloader();
            myApp.alert('Check-in confirmed. You checked in @ ' + position.coords.longitude + ', ' + position.coords.latitude);
        }

        function onError(error) {
            myApp.hidePreloader();
            hybridapp.requestLocation();
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 10000 });

    });
    $$('#callmenow').on('click', function() {
        myApp.closeModal();
        var contacts = [];
        if (window.localStorage.getItem('contacts')) {
            contacts = JSON.parse(window.localStorage.getItem('contacts'));
            if (contacts.length > 0) {
                $$.each(contacts, function(e, i) {
                    if (i.phoneNumbers && i.phoneNumbers.length > 0) {
                        hybridapp.sendSMS(i);
                        return;
                    }
                });
            } else {
                hybridapp.pickContactAndSendSMS();
            }
        } else {
            hybridapp.pickContactAndSendSMS();
        }
    });
    
    $$("#callEmergency").on('click',function(){
        myApp.closeModal();
        window.plugins.CallNumber.callNumber(function(){}, function(){}, '112', false);
    })
    
    
    $$('#mylocation').on('click', function() {
        myApp.closeModal();
        hybridapp.showMyLocation();
    });
    
    $$('#chat').on('click', function() {
        myApp.closeModal();
        mainView.router.load({ url: 'chat.html' });
         window.setInterval(function(){
            var tkt = localStorage.getItem("current_ticket");
            fetchChat(tkt);
        },2000)
    });

    $$('#switchAccount').on('click', function () {
        myApp.closeModal();
        mainView.router.load({ url: 'change_account.html' });
    });
    
    $$('#providers').on('click', function () {
        myApp.closeModal();
        mainView.router.load({ url: 'providers.html' });
    });

    // link to track_help map page
    $$('#track_help').on('click', function () {
        myApp.closeModal();
        mainView.router.load({ url: 'track_help.html' });
    });

    // link to nearest police station
    $$('#police_station').on('click', function () {
        myApp.closeModal();
        mainView.router.load({ url: 'nearest_police_station.html' });
    });
    var map;


    $$(document).on('page:init', '.page[data-page="police_station"]', function (e) {
        initMap();
    });


    // link to device tracker
    $$('#device_tracker').on('click', function () {
        myApp.closeModal();
        mainView.router.load({ url: 'device_tracker.html' });
    });




$$('#powersave').on('click',function(){
    myApp.closeModal();
    powersaveToggle();
    myApp.alert("GPS powersaving mode enabled, the app will use location only when requested");
})

function powersaveToggle(){
    if(window.powersave == true){
        window.powersave == false;
    }
    
    else{
        widow.powersave = true;
    }
}
    

    
    $$('#logout').on('click', function() {
        myApp.closeModal();
        myApp.showPreloader('Loggin you out');
        setTimeout(function() {
            myApp.hidePreloader();
            window.localStorage.setItem('loggedin', false);
            mainView.router.load({ url: 'login.html' });
        }, 3000);
    });
});


    
function completeAction(pin){
    
        if(pin == "5566"){
            $$.ajax({
        url: "http://safeapp.appwebstage.com/api_v2/ticket/edit",
        method: "POST",
        async: true,
        crossDomain: true,
        data: {"ticket_number":localStorage.getItem("current_ticket"),"field":"status_id","value":"2"},
        success: function(data,status,xhr){
            if(data == 1 || data == "1"){
                myApp.alert("Ticket resolved");
                $$('#completeAction').css("display","none");
                $$('#clearTicket').on("click",function(){
                    if(localStorage.getItem('emergencyinprogress')){
                        localStorage.removeItem('emergencyinprogress');
                    }
                    if(localStorage.getItem('emergencyinprogress')){
                        localStorage.removeItem('firstaidinprogress');
                    }
                    mainView.router.load({ url: 'dashboard.html' });
                })
                $$('#clearTicket').css('display','initial');
                $$("[data-indicate='resolved']").removeClass("incomplete").addClass("complete");
            }
        }
            })
        }
        else {
            myApp.alert("failed");
        }
}
myApp.onPageInit('sendaction', function(page) {
    if (window.localStorage.getItem('emergencyinprogress') == "true") {
        $$('a.emergency').addClass('disabled');
    } else {
        $$('a.emergency').removeClass('disabled');
    }
    if (window.localStorage.getItem('firstaidinprogress') == "true") {
        $$('a.first-aid').addClass('disabled');
    } else {
        $$('a.first-aid').removeClass('disabled');
    }
    $$('.inform').on('click', function() {
        hybridapp.sendSMSToDesignatedContacts($$(this));
    });
    $$('.cancel').on('click', function() {
        $$(this).parents('.other-actions').find('.state, .buttons-row').remove();
    });
    if (window.localStorage.getItem('emergencyinprogress') == "true" && window.localStorage.getItem('firstaidinprogress') == "true") {
        $$('.content-block-title').text('IN PROGRESS . . .');
    }
    
    $$('#completeAction').on('click',function(){
        myApp.prompt("Please enter your PIN to confirm","PIN Required",completeAction,function(){return;});
    });
    
    $$.ajax({
        url: "http://safeapp.appwebstage.com/api_v2/ticket/get",
        method: "POST",
        async: true,
        crossDomain: true,
        data: {"ticket_number":localStorage.getItem("current_ticket")},
        success: function(data,status,xhr){
            data = JSON.parse(data);
            var ticketStatus = data.status_id;
            var classArray;
            if(ticketStatus == "6"){
                classArray = {"sent":"complete","seen":"incomplete","started":"incomplete","resolved":"incomplete"}
            }
            
            else{
                if(ticketStatus == "1"){
                classArray = {"sent":"complete","seen":"complete","started":"complete","resolved":"incomplete"}
            }
            else {
                classArray = {"sent":"complete","seen":"complete","started":"complete","resolved":"complete"}
                $$('#completeAction').css("display","none");
            }
            }
            
            $$("[data-indicate]").each(function(){
                $$(this).removeClass("incomplete");
                $$(this).addClass(classArray[$$(this).attr("data-indicate")])
            })
                
        }
    })

});

myApp.onPageInit('processalert', function(page) {
    hybridapp.processTimeLeft();
    $$('.back').on('click', function() {
        clearTimeout(confirmTimer);
    });
    $$('#emergencyactivator').on('click', function() {
        hybridapp.sendSOSRequest('emergency');
    });
});

myApp.onPageInit('processaid', function(page) {
    hybridapp.processTimeLeft();
    $$('.back').on('click', function() {
        clearTimeout(confirmTimer);
    });
    $$('#emergencyactivator').on('click', function() {
        hybridapp.sendSOSRequest('firstaid');
    });
});

myApp.onPageInit('contacts', function(page) {
    var options, contacts = [];
    myApp.sortableOpen('.sortable');

    if (window.localStorage.getItem('contacts')) {
        contacts = JSON.parse(window.localStorage.getItem('contacts'));
        $$.each(contacts, function(e, i) {
            $$('#contact-list').append($$(hybridapp.otherContactTpl(i)));
        });
    }
    $$('#contact-list a').on('click', function() {
        var id = $$(this).data('id');
        hybridapp.removeContact(id);
    });
    $$('#addemergencycontact').on('click', function() {
        try {
            if (navigator.contacts) {
                navigator.contacts.pickContact(function(contact) {
                    var name = contact.displayName || '',
                        number = contact.phoneNumbers ? contact.phoneNumbers[0].value : '';
                    alert('The following contact will be added:\n' + name + '\n' + number);
                    hybridapp.pickContactSuccessCallback(contact);
                }, function(err) {
                    console.log('Error: ' + err);
                });
            }
        } catch (e) {

        }
    });

});


myApp.onPageInit('history', function(page) {
    var savedIncidents = [];
    if (window.localStorage.getItem('savedincident'))
        savedIncidents = JSON.parse(window.localStorage.getItem('savedincident'));

    if (savedIncidents.length > 0)
        hybridapp.showAllIncidents(savedIncidents);

});



/* ===== Handle panel opened/closed event ===== */
$$('.panel-left, .panel-right').on('open', function() {

});
$$('.panel-left, .panel-right').on('close', function() {

});

$$('#clearIncidents').on('click', function() {
    window.localStorage.removeItem('emergencyinprogress');
    window.localStorage.removeItem('firstaidinprogress');
    myApp.alert("All incidents cleared.");
});

hybridapp.initialize();
myApp.init();
