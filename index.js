var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3001;

app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, './client/build')));                     
app.use(express.json())
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

var users = [];
var chatMsg=[
// {username: 'test', msg: 'ttttttttttrehaerhe'},
];
app.post('/login', (req, res) => {
  res.send({data:!users.includes(req.body.data)})
})
// app.get('/prev', (req, res) => {
//   res.send({users,'chats':chatMsg})
// })
io.on('connection', socket => {
  socket.on('chat message', function(msg){
    chatMsg.push(msg);
    socket.broadcast.emit('chat message', msg);
  });
  //(dynamic data)array in node(server) 
  //https://stackoverflow.com/questions/41322878/dynamic-rooms-in-socket-io
  socket.on('add user', name => {
    socket.emit('prev',{users,'chats':chatMsg});
    socket.username = name;
    users.push(name);
    socket.broadcast.emit('user joined', name);
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user left', socket.username);
    users=users.filter(i => i !== socket.username);
  });
});

server.listen(port, function(){
  console.log('listening on *:' + port);
});

