'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express=require('express');
const http=require('http');
var app = express();
const path=require('path');
const socketIO=require('socket.io');
module.exports = app; // for testing
var server=http.createServer(app)
var io=socketIO(server);

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 3000;





  const publicPath=path.join(__dirname+'/public')
  console.log(publicPath)
  app.use(express.static(publicPath))
  server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
  });
 


  if (swaggerExpress.runner.swagger.paths['/hello']) {
    //console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  
  }


  // console.log("IO",io)

  io.on('connection',(socket)=>{
    console.log('New user connected')

    socket.emit('newMessage',{
      from:'Admin',
      text:'Welcome to the chat app'
    })
    socket.broadcast.emit('newMessage',{
      from:'Admin',
      text:'New user joined'
    })

    socket.on('createMessage',(message)=>{
        console.log('CreateMessage',message);
        io.emit('newMessage',{
          from:message.from,
          text:message.text,
          createAt:new Date().getTime()
        })
        //  socket.broadcast.emit('newMessage',{
        //    from:message.from,
        //    text:message.text,
        //    createAt: new Date().getTime()
        //  });
    })

    socket.on('disconnect',()=>{
      console.log('User was disconnected')
    })
    socket.on('create',(newEmail)=>{
        console.log("Create Email",   newEmail);
    })
  })

});
