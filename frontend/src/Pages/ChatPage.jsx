import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

const ChatPage = () => {
  const [chat, setChat] = useState(()=>[]);

  useEffect(() => {
    async function fetchData() {
      try {
        let res = await axios.get("/api/chat");
        setChat(res.data.chats);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

 

  return (
    <div>
      {chat.map((ele, i) => {
        return <div key={i}>{ele.chatName}</div>;
      })}
    </div>
  );
};

export default ChatPage;
