import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';

export const ChatModal = ({ isOpen, onClose, conversationId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(conversationId);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUserName = user?.full_name || user?.email || 'ইউজার';
  const userId = user?.user_id || user?.id || 1;

  useEffect(() => {
    setCurrentRoom(conversationId);
  }, [conversationId]);

  // Proper room ID handling for property_ or admin_report_
  const activeRoomId = currentRoom
    ? (String(currentRoom).startsWith('property_') || String(currentRoom).startsWith('admin_report_'))
      ? currentRoom
      : `property_${currentRoom}`
    : 'property_default';

  // Extract property ID for reporting
  const getPropertyId = () => {
    if (!currentRoom) return 1;
    const parts = String(currentRoom).split('_');
    if (String(currentRoom).startsWith('admin_report_')) {
      return parts[2] || 1;
    }
    return parts[1] || 1;
  };

  const switchToAdminReport = () => {
    const propId = getPropertyId();
    const reportRoom = `admin_report_${propId}_user_${userId}`;
    setCurrentRoom(reportRoom);

    // অটোমেটিক একটি রিপোর্ট মেসেজ পাঠিয়ে দেওয়া হচ্ছে যাতে ইনবক্সে সাথে সাথে শো করে
    setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const autoPayload = {
          sender: "System",
          text: `⚠️ [অটো-রিপোর্ট]: ${currentUserName} এই বাসাটি সম্পর্কে অ্যাডমিনের নিকট অভিযোগ/রিপোর্ট করেছেন।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        wsRef.current.send(JSON.stringify(autoPayload));
      }
    }, 400);
  };

  const switchToNormalChat = () => {
    const propId = getPropertyId();
    const normalRoom = `property_${propId}_finder_${userId}`;
    setCurrentRoom(normalRoom);
  };

  const isReportRoom = String(activeRoomId).startsWith('admin_report_');

  useEffect(() => {
    if (!isOpen) return;

    fetch(`http://localhost:8000/api/chat/messages/${activeRoomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Error fetching chat history:", err));

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${activeRoomId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, parsedMessage]);
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, [isOpen, activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      sender: currentUserName,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    wsRef.current.send(JSON.stringify(payload));
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px] z-[10000]">
        {/* Header */}
        <div className={`p-4 ${isReportRoom ? 'bg-red-600' : 'bg-[#168A45]'} text-white flex justify-between items-center transition-colors`}>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              {isReportRoom ? <AlertTriangle className="w-4 h-4" /> : null}
              {isReportRoom ? 'এডমিন রিপোর্ট চ্যাট' : 'চ্যাট মেসেঞ্জার'}
            </h3>
            <p className="text-[10px] opacity-80">
              {isReportRoom ? 'এই মেসেজটি সরাসরি সিস্টেম অ্যাডমিনের কাছে যাবে' : `রুম: ${activeRoomId}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isReportRoom ? (
              <button
                onClick={switchToAdminReport}
                title="এডমিনের কাছে রিপোর্ট করুন"
                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" /> রিপোর্ট
              </button>
            ) : (
              <button
                onClick={switchToNormalChat}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer"
              >
                স্বাভাবিক চ্যাটে ফিরুন
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {isReportRoom && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center">
              ⚠️ আপনি এই চ্যাটটি সরাসরি সিস্টেম অ্যাডমিনের নিকট রিপোর্ট করছেন। সাধারণ ওনার বা অন্য কেউ এই মেসেজ দেখতে পাবেন না।
            </div>
          )}
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-10">কোন বার্তা নেই। প্রথম মেসেজ লিখুন...</p>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender === currentUserName;
              const isSystem = msg.sender === 'System';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isSystem ? 'items-center' : isMe ? 'items-end' : 'items-start'}`}
                >
                  {isSystem ? (
                    <div className="bg-red-100 text-red-800 text-[11px] px-3 py-1.5 rounded-lg my-1 text-center font-medium">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm ${
                        isMe
                          ? (isReportRoom ? 'bg-red-600 text-white' : 'bg-[#168A45] text-white') + ' rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="font-semibold text-[10px] opacity-75 mb-0.5">{msg.sender}</p>
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            placeholder={isReportRoom ? "অ্যাডমিনকে আপনার অভিযোগ লিখুন..." : "মেসেজ লিখুন..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 text-xs outline-none focus:ring-2 focus:ring-[#168A45]"
          />
          <button type="submit" className={`${isReportRoom ? 'bg-red-600 hover:bg-red-700' : 'bg-[#168A45] hover:bg-[#117037]'} text-white p-2.5 rounded-xl transition cursor-pointer`}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};