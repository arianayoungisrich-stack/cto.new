import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/conversations")({
  component: Conversations,
});

function Conversations() {
  const [selectedId, setSelectedId] = useState(1);

  const activeChat = conversations.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 bg-gray-100 border-none rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedId(chat.id)}
              className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                selectedId === chat.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium ${chat.color}`}>
                {chat.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold text-gray-900 truncate">{chat.name}</p>
                  <span className="text-[10px] text-gray-500">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                <div className="mt-2 flex gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600">{chat.channel}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${activeChat.color}`}>
                  {activeChat.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{activeChat.name}</h3>
                  <p className="text-xs text-green-600 font-medium">Active • {activeChat.channel}</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700">
                Take Over Chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChat.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md rounded-lg p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : msg.role === 'ai'
                        ? 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.time} {msg.role === 'ai' && '• AI Assistant'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <button className="h-9 w-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

const conversations = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    initials: 'SJ',
    color: 'bg-pink-500',
    time: '5 mins ago',
    lastMessage: '2pm works for me, thank you!',
    channel: 'Web Chat',
    messages: [
      { role: 'user', text: 'Hi, do you have any openings for a haircut tomorrow?', time: '2:15 PM' },
      { role: 'ai', text: 'Hello! Yes, we have a few slots available. Would you prefer morning or afternoon?', time: '2:15 PM' },
      { role: 'user', text: 'Afternoon please.', time: '2:16 PM' },
      { role: 'ai', text: 'We have 2:00 PM and 4:30 PM. Which one would you like?', time: '2:16 PM' },
      { role: 'user', text: '2pm works for me, thank you!', time: '2:17 PM' },
    ]
  },
  {
    id: 2,
    name: 'Michael Ross',
    initials: 'MR',
    color: 'bg-blue-500',
    time: '1 hour ago',
    lastMessage: 'I have a question about my booking',
    channel: 'SMS',
    messages: [
      { role: 'user', text: 'Hi, I need to reschedule my appointment.', time: '1:00 PM' },
      { role: 'ai', text: 'No problem! When would you like to move it to?', time: '1:01 PM' },
    ]
  },
  {
    id: 3,
    name: '+1 (555) 0123',
    initials: '#',
    color: 'bg-gray-500',
    time: '2 hours ago',
    lastMessage: 'Thanks for getting back to me',
    channel: 'SMS (Recovered)',
    messages: [
      { role: 'ai', text: 'Hi there! Sorry we missed your call. How can I help you today?', time: '12:05 PM' },
      { role: 'user', text: 'I was calling to see if you do bridal packages.', time: '12:10 PM' },
    ]
  }
];
