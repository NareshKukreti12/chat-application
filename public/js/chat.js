// var moment = require("moment");

var socket= io();
var messageTextBox1= jQuery('[name=message]');
var message_box=document.getElementById('message_box');
var feedback=document.getElementById('feedback');
function scrollToBottom(){
    //Selectors
    var messages=jQuery('#messages');
    var newMesage=messages.children('li:last-child');
    //Heights
    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageHeight=newMesage.innerHeight();
    var lastMessageHeight=newMesage.prev().innerHeight();
    if(clientHeight + scrollTop+newMessageHeight+lastMessageHeight>=scrollHeight){
        //scroll
        messages.scrollTop(scrollHeight);
    }
 }

socket.on('connect',function(){
    console.log('Connected to server');  
    var params = jQuery.deparam(window.location.search);
    socket.emit('join',params,function(err){
      if(err){
          alert(err);
         window.location.href='/';
      }
      else{
        console.log("No error");
      }
    })

});
socket.on('disconnect',function(){
    console.log('Disconnected from server');
});

socket.on('updateUserList',function(users){
  var ol=jQuery('<ol></ol>');
  users.forEach(function(user){
      ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('#users').html(ol);

})


socket.on('newMessage',function(message){
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#message-template').html();
    var html=Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();


});




  
socket.on('newLocationMessage',function(message){
    var formattedTime=moment(message.createdAt).format('h:mm a');

    var template=jQuery('#location-message-template').html();
    var html=Mustache.render(template,{
        url:message.url,
        from:message.from,
        createdAt:formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
})
jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextBox= jQuery('[name=message]');
    socket.emit('createMessage',{
        from:'User',
        text:messageTextBox.val()
    },function(){
       messageTextBox.val('');
    });
})

var locationButton=jQuery('#send-location');
locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert('Gelocation not supported by your browser');
    }
    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position){
       locationButton.removeAttr('disabled').text('Send location');
        console.log(position);
        socket.emit('createLocationMessage',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        });
    },function(){
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location')
    })
})
message_box.addEventListener('keypress',function(){
    console.log("Here...")
    socket.emit('typing');
})

socket.on('typing',function(){
  feedback.innerHTML="<p><em>typing..</em></p>";
   console.log("Typing Event")
   setTimeout(()=>{
       feedback.innerHTML="";
   },2000)
})
