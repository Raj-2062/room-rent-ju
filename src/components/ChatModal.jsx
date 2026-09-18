import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, ShieldAlert, CheckCheck } from 'lucide-react';

export const ChatModal = ({ isOpen, onClose, propertyTitle, ownerName, rent }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'owner', text: 'আসসালামু আলাইকুম! বাসা সংক্রান্ত কোনো তথ্য জানতে চান?', time: '১০:৩০ AM' }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickReplies = [
    'বাসাটি কি এখনো খালি আছে?',
    'মাসিক ভাড়া কত?',
    'কবে থেকে উঠতে পারব?',
    'আমি কি বাসাটি দেখতে আসতে পারি?'
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col h-[550px]">
        
        {/* Header */}
        <div className="p-4 bg-[#168A45] text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">{ownerName || 'রহিম আহমেদ (মালিক)'}</h3>
            <p className="text-xs text-green-100 line-clamp-1">{propertyTitle || 'আমবাগান মেইন রোডের কাছে সিঙ্গেল রুম'} • ৳{rent || '৪,৫০০'}/মাস</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning */}
        <div className="bg-amber-50 p-2.5 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-800">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>নিরাপত্তার জন্য: অগ্রিম টাকা পাঠানোর আগে অবশ্যই বাসা সরেজমিনে গিয়ে যাচাই করুন।</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAF8]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#168A45] text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}
              >
                <p>{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="text-[11px] whitespace-nowrap bg-white border border-gray-200 hover:border-[#168A45] text-gray-600 px-2.5 py-1 rounded-full transition"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-[#168A45] transition">
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="মেসেজ লিখুন..."
            className="flex-1 bg-gray-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#168A45]"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-[#168A45] hover:bg-[#117037] text-white rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};