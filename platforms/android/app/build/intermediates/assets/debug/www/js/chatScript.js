var query_url = "http://safeapp.appwebstage.com/api_v2/client/thread/";

function fetchChat(ticket_number){
    $$.ajax({
        url: query_url,
        async: true,
        method: 'post',
        data:{
            ticket_number: ticket_number
        },
        headers: {"X-USER": JSON.parse(localStorage.getItem("userData")).user_id},
        success: function(data,status,xhr){
            if(data.length > localStorage.getItem("msgCount") && localStorage.getItem("msgCount") > 0){
                localStorage.setItem("msgCount",data.length);
                $$(".messages").html("");
                displayMessages(data);
            }
            if(localStorage.getItem("msgCount") == 0){
                displayMessages(data);
                localStorage.setItem("msgCount",data.length)
            }
        }
    })
}

function sendMessage(ticket_number){
    var content = $$(".messagebar-area textarea").val();
    $$.ajax({
        url: query_url,
        async: true,
        method: 'post',
        data:{
            ticket_number: ticket_number,
            send: 1,
            content: content
        },
        headers: {"X-USER": JSON.parse(localStorage.getItem("userData")).user_id},
        success: function(data,status,xhr){
            fetchChat(ticket_number)
        }
    })
}

function displayMessages(data){
    var currentUserId = JSON.parse(localStorage.getItem("userData")).user_id
    var wrapper = $$(".messages");
    wrapper.prepend("<div class='messages-title' style='text-align:center'>Thread started <b>Feb 9</b> 12:58</div>");
    var chatTitle = $$(".messages-title");
    $$.each(eval(data.replace(/[\r\n]/, "")), function(i, item){
        if(item.user_id == currentUserId){
            var classes = "message message-sent";
            var DOMmessage = $$("<div></div>").attr("class",classes);
            var DOMcontent = $$("<div></div>").addClass("message-content");
            var DOMbubble = $$("<div></div>").addClass("message-bubble");
            var DOMtext = $$("<div></div>").addClass("message-text");
            DOMtext.html(item.body);
            DOMbubble.append(DOMtext);
            DOMcontent.append(DOMbubble);
            DOMmessage.append(DOMcontent);
            wrapper.append(DOMmessage);
            
        }
        
        else {
            var classes = "message message-received";
            var DOMmessage = $$("<div></div>").attr("class",classes);
            var DOMname = $$("<div></div>").addClass("message-name");
            var DOMtext = $$("<div></div>").addClass("message-text");
            var DOMavatar = $$("<div></div>").addClass("message-avatar");
            
            DOMtext.html(item.body);
            DOMname.html(item.poster);
            DOMavatar.css("background-image","url(http://lorempixel.com/output/people-q-c-100-100-9.jpg)").css("display","none");
            DOMmessage.append(DOMname);
            DOMmessage.append(DOMtext);
            DOMmessage.append(DOMavatar);
            wrapper.append(DOMmessage)
        }
    })
}