import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addChatMessage, fetchInteractions } from '../store/interactionsSlice';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
    const dispatch = useDispatch();
    const { chatHistory, chatLoading } = useSelector(state => state.interactions);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, chatLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        dispatch(addChatMessage({ role: 'user', content: msg }));
        await dispatch(sendChatMessage(msg));
        dispatch(fetchInteractions()); // refreshing table state since AI might have logged
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="p-5 border-b border-gray-100 bg-brand-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    AI Assistant
                </h3>
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-medium">Groq Powered</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
                {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex gap-3 ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${chat.role === 'user' ? 'bg-gray-800 text-white' : 'bg-brand-600 text-white'}`}>
                            {chat.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm ${chat.role === 'user'
                                ? 'bg-gray-800 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none prose prose-sm prose-p:leading-relaxed prose-blue'
                            }`}>
                            <ReactMarkdown>{chat.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {chatLoading && (
                    <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="relative flex items-center">
                    <textarea
                        rows="1"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-sm text-gray-800 resize-none overflow-hidden"
                        placeholder="Log call with Dr. Smith..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button
                        onClick={handleSend}
                        disabled={chatLoading}
                        className="absolute right-2 text-white bg-brand-600 p-2 rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-center">
                    <span className="text-[10px] text-gray-400 font-medium">Ask to summarize history, suggest follow-ups, or recommend materials.</span>
                </div>
            </div>
        </div>
    );
}
