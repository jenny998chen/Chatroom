let { Fragment, useState, useEffect, useRef } = React;
let socket = io();
const GlobalStyle = styled.createGlobalStyle`
  html,body,#root{
    height: 100%;
    margin: 0; 
    // box-sizing: border-box; 
  }
  html{
    font:18px Helvetica, Arial;
  }
  @media screen and (max-width: 1080px) {
    html {font-size: 32px;}
  }
  *:focus{
   outline: 0 !important;
  }
  #root{
    display: grid;
  }
  button,input{
    font-size: 1em;
  }
}`;

const Login = styled.div`
  text-align:center;
  margin: auto;
  display: inline-block;
  div{
    font-size: 1.3rem;
    font-weight: 600;
    color:rgb(56,56,56);
  }
  input{
    text-align:center;
    font-weight: 500;
    margin:0.6em;
    padding:0.4em 1em;
    border:none;
    border-bottom:2px solid rgb(56,56,56);
  }
  span{
    font-size: 0.85rem;
    display:block;
    color: #D8000C;
  }
`;
function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState('');
  const [err, setErr] = useState(false);

  function login(name) {
    fetch("/login", {
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify({ data: name })
    }).then(res => res.json())
      .then(res => {
        if (res.data) {
          setUser(name);
          socket.emit('add user', name);
          setShowLogin(false);
        } else {
          setErr(true);
        }
      })
  }
  return (
    <Fragment>
      <GlobalStyle />
      {showLogin ?
        <Login>
          <div>What's your name?</div>
          <input onKeyDown={e => { if (e.key === 'Enter') login(e.target.value) }} />
          {err && <span>username already exist! try again</span>}
        </Login>
        :
        <Home user={user} />
      }
    </Fragment>
  );
}
const Layout = styled.div`
  height:100%;
  display:grid;
  grid-template-columns:280px 1fr;
  grid-template-rows:1fr auto;
  overflow: hidden;

  max-width:1100px;
  border-right:1px solid #C8C8C8;
  // box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
`
const Side = styled.aside`
  border-right:1px solid #C8C8C8;
  grid-row: span 2;
  padding:1em 0;
  div{
    padding:0.5em 1em;
    :hover{
      background:#f1f0f0;
    }
  }
`
const Chat = styled.div`
  padding: 1em;
  display: flex;
  flex-direction: column;
  overflow: auto;
`
const Name = styled.div`
  font-size: 0.85em;
  padding:0 0.6em;
  font-weight: 550;
  opacity: 0.6;
  ${props => props.right
    ? 'align-self: flex-end;'
    : 'align-self: flex-start;'
  }
`
const Action = styled.div`
  font-size: 0.9em;
  font-weight: 500;
  opacity: 0.7;
  text-align: center;
  padding:0.1em;
`
const Bubble = styled.div`
  max-width: 85%;
  color: white;
  margin: 0.3em 0 0.8em;
  padding: 0.6em 1em;
  word-wrap:break-word;
  ${props => props.right
    ? 'align-self: flex-end;background-color: darkgrey;border-radius:0.6em 0.6em 0em 0.6em;'
    : 'align-self: flex-start;background-color: #0084ff;border-radius:0.6em 0.6em 0.6em 0em;'
  }
`;
const Input = styled.div`
  // margin: 1rem 1rem 0.5em;
  border-radius: 0.3em;
  border: 1px solid grey;
  padding: 0.5em 1em;
  margin-right:0.5em;
  flex-grow:1;
  :focus {
    border-color: rgb(0,132,180);
  }
  word-break:break-all;
`;
const Footer = styled.div`
  display:flex;
  margin:0.3em;
`;
const Button = styled.button`
  // font-size: 18px;
  align-self:flex-end;
  border-radius: 0.3em;
  background-color: green;
  color:white;
  text-transform: uppercase;
  font-weight: 600;
  padding: 0.5em 1em;
  border:none;
`;
function Home({ user }) {
  let chatRef = useRef(null);
  let inputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [inp, setInp] = useState('');
  useEffect(() => {
    socket.on('chat message', msg => {
      setChats(chats => chats.concat(msg));
    });
    socket.on('prev', m => {
      console.log('m', m)
      setChats(m.chats);
      setUsers(m.users);
    });
    socket.on('user joined', data => {
      console.log(data + ' joined');
      setChats(chats=>chats.concat({ action: 'joined', username: data}));
      setUsers(users => users.concat(data));
    });
    socket.on('user left', data => {
      console.log(data + ' left');
      if(data){
        setChats(chats=>chats.concat({ action: 'left', username: data}));
        setUsers(users => users.filter(i => i !== data));
      }
    });
  }, []);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ behavior: 'smooth', top: chatRef.current.scrollHeight });
      // chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chats]);

  function sendMsg() {
    socket.emit('chat message', { username: user, msg: inp });
    setChats(chats.concat({ self: true, username: user, msg: inp }));
    inputRef.current.innerHTML = ''
  }
  return (
    <Layout>
      <Side><div>Me: {user}</div>
        {users.map(u => <div key={u}>{u}</div>)}
      </Side>
      <Chat ref={chatRef}>
        {chats.map(({ username, self, msg, action }, i) => (
          <Fragment key={i}>
            {action?
            <Action>{username} {action}</Action>
            :
            <Fragment>
            <Name right={self}>{username}</Name>
            <Bubble right={self}>{msg}</Bubble>
            </Fragment>
            }
          </Fragment>
        ))}
      </Chat>
      <Footer>
        <Input
          ref={inputRef}
          contentEditable
          onInput={e => setInp(e.currentTarget.textContent)}
          onKeyDown={e => { if (e.key === 'Enter') { sendMsg(); e.preventDefault(); } }}
        />
        <Button onClick={sendMsg}>
          send
        </Button>
      </Footer>
    </Layout>
  );
}
ReactDOM.render(<App />, document.getElementById('root'));

