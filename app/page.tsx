'use client'
import { Button } from "@/components/ui/button";
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from './services/supabaseClient';

import Sidebar from "./components/sidebar";
import { HumanMessage, AIMessage } from "./components/chatMessages";
import CameraPreview, { CameraPreviewHandles } from "./components/cameraPreview";
import { useState, useEffect, useRef, useCallback } from "react";

import {
  Paperclip, 
  ArrowUp,
  UserRound,
  Camera,
  PanelLeft,
} from "lucide-react";

export default function Home() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

  const saveUserToSupabase = async () => {
    if (user) {
      const { email } = user;
      const { data, error } = await supabase
        .from('users')
        .upsert({ email, password: '' }, { onConflict: 'email' });

      if (error) console.error('Error saving user:', error);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showSplitView, setShowSplitView] = useState(false);

  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<CameraPreviewHandles>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { role: 'ai', text: transcription }]);
  }, []);

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : ""
        }`}
      >

        {/* Header */}
        <header className="flex items-center justify-between p-4">

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-neutral-700 rounded-md transition"
            >
              <PanelLeft className="h-6 w-6 text-white" />
            </button>
            
            <span className="text-lg font-semibold">Health Innovators AI Chatbot</span>
          </div>

          <nav className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button
                variant="default"
                className="flex items-center space-x-2 hover:bg-neutral-700"
                onClick={() => loginWithRedirect()}
              >
                <UserRound className="h-4 w-4 fill-current" />
                <span>Login</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <p>Welcome, {user?.email}</p>
                <Button
                  variant="default"
                  className="flex items-center space-x-2 hover:bg-neutral-700"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </nav>

        </header>

        {/* Main Content */}
        <main className="w-full flex flex-1 overflow-hidden">
          {/* Left Split Panel with transition */}
          <div
            className={`${
              showSplitView ? "w-1/2 opacity-100" : "w-0 opacity-0"
            } transition-all duration-500 ease-in-out overflow-hidden border-r border-neutral-800 p-4 hidden md:block`}
          >
            <CameraPreview ref={cameraRef} onTranscription={handleTranscription}/>
          </div>

          {/* Right Chat Panel with transition */}
          <div
            className={`${
              showSplitView ? "w-1/2" : "w-full"
            } transition-all duration-500 ease-in-out flex justify-center`}
          >
            <div className="w-full max-w-3xl h-[calc(96vh-160px)] overflow-y-auto px-4 py-8 space-y-4">
              {messages.length === 0 ? (
                <>
                  <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Hello there!</h1>
                  <p className="mb-8 text-xl text-neutral-300">
                    How can I help you today?
                  </p>
                </>
              ) : (
                messages.map((msg, idx) =>
                  msg.role === "user" ? (
                    <HumanMessage key={idx} text={msg.text} />
                  ) : (
                    <AIMessage key={idx} text={msg.text} />
                  )
                )
              )}
              <div ref={scrollRef} />
            </div>
          </div>
        </main>



        {/* Footer with Input */}
        <footer className="p-4">
          <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-2xl bg-[#2b2b2b] px-4 py-3 space-y-2">
              
              {/* Top Row: Input Field */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", text: inputValue.trim() },
                      { role: "ai", text: "This is a simulated AI reply." } // <-- add AI message here
                    ]);
                    setInputValue("");
                  }
                }}
                placeholder="Send a message..."
                className="w-full bg-transparent text-white placeholder:text-neutral-400 focus:outline-none"
              />

              {/* Bottom Row: Icons */}
              <div className="flex items-center justify-between">
                {/* Paperclip Icon (Left) */}
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-neutral-700 rounded-md transition">
                    <Paperclip className="h-5 w-5 text-zinc-400 hover:text-white" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowSplitView((prev) => !prev)
                      cameraRef.current?.toggleCamera();
                    }}
                    className="p-1 hover:bg-neutral-700 rounded-md transition"
                  >
                    <Camera className="h-5 w-5 text-zinc-400 hover:text-white"/>
                  </button>
                </div>

                {/* Send Icon (Right) */}
                <button 
                  className="rounded-full bg-zinc-400 hover:bg-white p-2 transition"
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", text: inputValue.trim() },
                      { role: "ai", text: "This is a simulated AI reply." } // <-- add AI message here
                    ]);
                    setInputValue("");
                  }}
                >
                  <ArrowUp className="h-4 w-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
