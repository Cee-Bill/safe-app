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
        
        document.addEventListener("volumedownbutton", onVolumeDownKeyDown, false);
        myApp.waitTimerCount = 0;
        function onVolumeDownKeyDown() {
            myApp.waitTimerCount++;
            setTimeout(function(){myApp.waitTimerCount = 0},2000)
            if(myApp.waitTimerCount >= 3){
                myApp.alert("You activated the panic alarm");
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
    firebaseInit: function() {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyAzNF_kM3c5SR72ruvPbw3kP6hKRjdcUEw",
            authDomain: "safeapp-aabb7.firebaseapp.com",
            databaseURL: "https://safeapp-aabb7.firebaseio.com",
            projectId: "safeapp-aabb7",
            storageBucket: "safeapp-aabb7.appspot.com",
            messagingSenderId: "74614122239"
        };
        firebase.initializeApp(config);
    },
    firebaseUIInit: function() {
        // FirebaseUI config.
        var uiConfig = {
            signInSuccessUrl: 'login.html',
            signInOptions: [
                firebase.auth.PhoneAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: 'terms.html'
        };

        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#app', uiConfig);
        hybridapp.monitorAuthState();
    },
    registerAuthProvider: function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider).then(function() {
            firebase.auth().getRedirectResult().then(function(result) {
                // This gives you a Google Access Token.
                // You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // ...
                if (user) {
                    console.log(user);
                    document.getElementById('body').classList = 'framework7-root verified';
                    if (window.localStorage.getItem('loggedin')) {
                        mainView.router.load({ url: 'dashboard.html' });
                    } else {
                        mainView.router.load({ url: 'login.html' });
                        window.localStorage.setItem('loggedin', false);
                    }
                } else {
                    // User is signed out.
                    document.getElementById('body').classList = 'framework7-root signout';
                }
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        });
        hybridapp.monitorAuthState();
    },
    monitorAuthState: function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log(user);
                document.getElementById('body').classList = 'framework7-root verified';
                if (window.localStorage.getItem('loggedin')) {
                    mainView.router.load({ url: 'dashboard.html' });
                } else {
                    mainView.router.load({ url: 'login.html' });
                    window.localStorage.setItem('loggedin', false);
                }
            } else {
                // User is signed out.
                document.getElementById('body').classList = 'framework7-root signout';
            }
        }, function(error) {
            console.log(error);
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

        var email = $$(page.container).find('#email').val();
        var username = null;
        
        var password = $$(page.container).find('#password').val();


        if (email.length > 0 && password.length > 0) {
            myApp.alert(email);
            $$.ajax({
                url: 'http://safeapp898956.epareto.com/api/user/generate_auth_cookie?insecure=cool&username='+email+'&password='+password,
                async: true,
                crossDomain: true,
                method: 'POST',
                data: {
                    "username": email,
                    "password": password
                },
                beforeSend: function(xhr) {},
                error: function(xhr, status) {
                    myApp.alert("Could not Login");
                },
                success: function(data, status, xhr) {
                    var user = JSON.parse(data);
                    if (user.user.id) {
                        mainView.router.load({ url: 'introduction.html' });
                        window.localStorage.setItem('loggedin', true);
                        myApp.hidePreloader();
                    } else {
                        myApp.hidePreloader();
                        myApp.alert("User not found");
                    }
                }
            })
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
                url: 'http://safeapp898956.epareto.com/wp-json/wp/v2/safeappticket/',
                async: true,
                crossDomain: true,
                method: 'POST',
                data: {
                    "title": title,
                    "content": content,
                    "excerpt": excerpt
                },
                headers: {
                    "authorization": "Basic "+btoa('user1:user1')
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
                    var results = JSON.parse(data);
                    if (type == "emergency") {
                        $$('a.emergency').addClass('disabled');
                        window.localStorage.setItem('emergencyinprogress', "true");
                        
                    } else {
                        $$('a.first-aid').addClass('disabled');
                        window.localStorage.setItem('firstaidinprogress', "true");
                    }

                    savedIncidents.push(results);
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
        cordova.dialogGPS("Your GPS is Disabled, SafeApp needs it to be enable to work.", //message
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

myApp.onPageInit('dashboard', function(page) {
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
    
    
    $$('#mylocation').on('click', function() {
        myApp.closeModal();
        hybridapp.showMyLocation();
    });
    
    $$('#chat').on('click', function() {
        myApp.closeModal();
        mainView.router.load({ url: 'chat.html' });
    });
    
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


    $$('#completeAction').on('click',function(){
        myApp.prompt("Please enter your PIN to confirm");
        console.log("completed")
    });

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
