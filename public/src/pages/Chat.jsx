import React, { useEffect, useState } from "react";
import styled from "styled-components"
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {io} from 'socket.io-client'
import { allUsersRoute, host, myConversationsRoute } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { useRef } from "react";
import SidebarNav from "../components/SidebarNav";
import FriendsContainer from "../components/FriendsContainer";
import ConversationList from "../components/ConversationList";

function Chat() {
    const socket = useRef();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [currentChat, setCurrentChat] = useState(undefined);
    const [isLoaded, setIsLoaded] = useState(false);
    const [openMessageContainer, setOpenMessageContainer] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [haveNewMessage, setHaveNewMessage] = useState({});

    useEffect(() => {
        checkLogin();
    }, []);
    useEffect(() => {
        if (currentUser) {
            addUserToSocket();
        }
    })
    const addUserToSocket = async () => {
        socket.current = io(host);
        await socket.current.emit("add-user", currentUser._id);
    }
    const checkLogin = async () => {
        if (!localStorage.getItem("chat-app-user")) {
            navigate('/login')
        } else {
            setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            setIsLoaded(true);
        }
    }
    useEffect(() => {
        getContactsFromDB();
    }, [currentUser]);

    const getContactsFromDB = async () => {
        if (currentUser) {
            if (currentUser.isAvatarImageSet) {
                const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
                setContacts(data.data); 
            } else {
                navigate("/setAvatar");
            }
        }
    }
    useEffect(() => {
        getConversationsFromDB();
    }, [currentUser]);

    useEffect(() => {
        getConversationsFromDB();
    }, [haveNewMessage]);
    const getConversationsFromDB = async () => {
        if (currentUser) {
            if (currentUser.isAvatarImageSet) {
                const data = await axios.get(`${myConversationsRoute}/${currentUser._id}`);
                setConversations(data.data); 
            } else {
                navigate("/setAvatar");
            }
        }
    }

    
    useEffect(() => {
        if (socket.current) {
            socket.current.on("msg-receive", (dataSent) => {
                setHaveNewMessage(new Date());
            })
        }
    });

    const handleChatChange = (chat) => {
        setCurrentChat(chat)
    }

    const onHandleSelectNav = (isMessageContainer) => {
        setOpenMessageContainer(isMessageContainer);
    }

    return <Container>
        <div className="container">
            <SidebarNav changeNav={onHandleSelectNav} />
            {
                openMessageContainer ? (
                    <>
                        <ConversationList conversations={conversations} currentUser={currentUser} changeChat={handleChatChange} socket={socket}/>
                        {
                            isLoaded && currentChat === undefined ? 
                                (<Welcome currentUser={currentUser} />) :
                                (<ChatContainer updateListConversation={setHaveNewMessage} currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                ) : (
                    <>
                        <FriendsContainer contacts={contacts} currentUser={currentUser} changeChat={handleChatChange}/>
                        {
                            isLoaded && currentChat === undefined ? 
                                (<Welcome currentUser={currentUser} />) :
                                (<ChatContainer updateListConversation={setHaveNewMessage} currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                )
            }
            {/* {
                openMessageContainer ? (
                    <>
                        <Contacts contacts={conversations} currentUser={currentUser} changeChat={handleChatChange}/>
                        {
                            isLoaded && currentChat === undefined ? 
                                (<Welcome currentUser={currentUser} />) :
                                (<ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                ) : (<FriendsContainer/>)
            } */}
        </div>
    </Container> ;
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #131324;
    .container {
        height: 85vh;
        width: 85vw;
        background-color: #00000076;
        display: grid;
        grid-template-columns: 5% 25% 70%;
        @media screen and (min-width: 720px) and (max-width: 1080px){
            grid-template-columns: 5% 35% 60%;
        }
    }
`;

export default Chat;