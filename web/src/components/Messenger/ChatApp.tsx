// ChatApp.tsx
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

import { stompClient } from '../utils/websoket';

interface ChatRoom {
    id: string;
    name: string;
    profileImage: string | null;
}
interface UserProfile {
    username: string;
    profileImage: string | null;
}
interface ResponseData {
    usersInfo: UserProfile[];
}
interface ChatMessage {
    roomId: string;
    message: string;
    sentAt: Date;
}

const ChatApp: React.FC = () => {
    const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [username, setUsername] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    // const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                await stompClient.connect({}, (frame) => {
                    console.log('WebSocket connected');
                    console.log('Connected frame:', frame);

                    // 원하는 웹소켓 관련 로직 추가
                });
            } catch (error) {
                console.error('Error connecting WebSocket:', error);
            }
        };

        connectWebSocket().catch((error) => {
            console.error('An error occurred during WebSocket connection:', error);
        });

        return () => {
            if (stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('WebSocket disconnected');
                });
            }
        };
    }, []);

    const handleChatRoomClick = (chatRoomId: string) => {
        setSelectedChatRoom(chatRoomId);
        setInputMessage('');
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() === '' || username.trim() === '') return;

        const newMessage = `${username}: ${inputMessage}`;
        const currentTime = new Date();

        // 메시지 객체 생성
        const messageObject = {
            roomId: selectedChatRoom!,
            message: newMessage,
            sentAt: currentTime,
        };

        // 로컬 상태 업데이트
        setChatMessages((prevMessages) => [...prevMessages, messageObject]);

        // stompClient를 사용하여 메시지 서버에 전송
        stompClient.send('/dm/message', {}, JSON.stringify(messageObject));

        setInputMessage('');
    };

    return (
        <ChatAppWrapper>
            <div>WebSocket Connection Test</div>;
            {/* <ChatListBox>
                {isLoading ? (
                    <p>Loading...</p>
                ) : chatRooms.length > 0 ? (
                    <ChatList chatRooms={chatRooms} onChatRoomClick={handleChatRoomClick} />
                ) : (
                    <p>No chat rooms available.</p>
                )}
            </ChatListBox> */}
            <ChatListBox>
                <ChatList chatRooms={chatRooms} onChatRoomClick={handleChatRoomClick} />
            </ChatListBox>
            <ChatWindow
                chatRoomId={selectedChatRoom}
                chatMessages={chatMessages.filter((message) => message.roomId === selectedChatRoom)}
                onSendMessage={handleSendMessage}
                inputMessage={inputMessage}
                onInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputMessage(e.target.value)
                }
                username={username}
                onUsernameChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                }
                chatRoomName={chatRooms.find((room) => room.id === selectedChatRoom)?.name}
                userProfile={userProfile}
            />
        </ChatAppWrapper>
    );
};

const ChatAppWrapper = styled.div`
    display: flex;
    position: relative;
    max-width: 1440px;
    min-height: 100vh;
    margin: 180px auto 0;
`;

const ChatListBox = styled.div`
    // position: absolute;
    // top: 150px;
    // left: 50px;
    // width: 320px;
    // height: 480px;
    overflow-y: auto;
    // box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
`;
export default ChatApp;
