import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data for demo purposes
const mockParticipants = [
  { id: "1", username: "DanceStar99", avatar: "https://images.unsplash.com/photo-1494790108755-2616b5b65734?w=150&h=150&fit=crop&crop=face", isStreaming: true },
  { id: "2", username: "SingingQueen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", isStreaming: true },
  { id: "3", username: "TalentKing", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", isStreaming: true },
  { id: "4", username: "ArtMaster", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", isStreaming: true },
  { id: "5", username: "MusicVibes", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", isStreaming: false },
  { id: "6", username: "CreativeFlow", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", isStreaming: false },
];

const mockModerator = {
  id: "mod1",
  username: "HostMaster",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
  isStreaming: true
};

const VideoFeed = ({ participant, isModerator = false, onVote = null }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [votes, setVotes] = useState(0);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    // Simulate random vote counts
    setVotes(Math.floor(Math.random() * 500) + 50);
  }, []);

  const handleVote = (rating) => {
    setUserRating(rating);
    if (onVote) onVote(participant.id, rating);
  };

  return (
    <div className={`relative group rounded-2xl overflow-hidden border-2 ${
      isModerator ? 'border-purple-500 shadow-purple-500/50' : 
      participant.isStreaming ? 'border-green-400 shadow-green-400/30' : 'border-gray-600'
    } shadow-lg transition-all duration-300 hover:shadow-2xl ${
      isModerator ? 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900' : 'bg-gradient-to-br from-gray-900 to-gray-800'
    }`}>
      
      {/* Video/Stream Area */}
      <div className={`relative ${isModerator ? 'h-96' : 'h-64'} bg-black overflow-hidden`}>
        {participant.isStreaming ? (
          <>
            {/* Live Stream Indicator */}
            <div className="absolute top-3 left-3 z-20">
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                LIVE
              </div>
            </div>
            
            {/* Mock video feed - using colored gradient */}
            <div className={`w-full h-full ${
              isModerator ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-red-500' : 
              `bg-gradient-to-br ${getRandomGradient()}`
            } relative`}>
              {/* Simulated video content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={participant.avatar} 
                  alt={participant.username}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
                />
              </div>
              
              {/* Floating hearts animation for engagement */}
              <div className="absolute right-4 bottom-20 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="text-red-400 text-xl animate-bounce opacity-70"
                    style={{animationDelay: `${i * 0.2}s`}}
                  >
                    ❤️
                  </div>
                ))}
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200">
                📹
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-sm">Camera Off</p>
          </div>
        )}
      </div>

      {/* User Info & Stats */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={participant.avatar} 
              alt={participant.username}
              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
            />
            <div>
              <h3 className="text-white font-bold text-sm">{participant.username}</h3>
              {isModerator && <span className="text-purple-300 text-xs font-semibold">MODERATOR</span>}
            </div>
          </div>
          
          {/* View count */}
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <span>👥</span>
            <span>{votes}</span>
          </div>
        </div>

        {/* Voting Stars (only for participants) */}
        {!isModerator && (
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleVote(star)}
                className={`text-lg transition-all duration-200 hover:scale-125 ${
                  userRating >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-200'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        )}

        {/* Status indicator */}
        <div className={`w-full h-1 rounded-full ${
          participant.isStreaming ? 'bg-green-400' : 'bg-gray-600'
        }`}></div>
      </div>
    </div>
  );
};

const ChatBox = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          💬 Live Chat
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{messages.length}</span>
        </h3>
      </div>
      
      <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.map((msg, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {msg.username.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-semibold text-sm">{msg.username}</span>
                <span className="text-gray-500 text-xs">{msg.timestamp}</span>
              </div>
              <p className="text-gray-300 text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-200"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const CompetitionControls = ({ competition, onStart, onEnd, onJoin }) => {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🏆 {competition.title}</h2>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          competition.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500' :
          competition.status === 'ended' ? 'bg-red-500/20 text-red-400 border border-red-500' :
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
        }`}>
          {competition.status.toUpperCase()}
        </div>
      </div>
      
      <p className="text-gray-300 mb-6">{competition.description}</p>
      
      <div className="flex gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-purple-400">{competition.participants}</div>
          <div className="text-gray-400 text-sm">Participants</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-green-400">1.2K</div>
          <div className="text-gray-400 text-sm">Viewers</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-yellow-400">5:42</div>
          <div className="text-gray-400 text-sm">Duration</div>
        </div>
      </div>
      
      <div className="flex gap-3">
        {competition.status === 'waiting' && (
          <button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
          >
            🚀 Start Competition
          </button>
        )}
        {competition.status === 'active' && (
          <button
            onClick={onEnd}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
          >
            🏁 End Competition
          </button>
        )}
        <button
          onClick={onJoin}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
        >
          ➕ Join
        </button>
      </div>
    </div>
  );
};

// Helper function for random gradients
const getRandomGradient = () => {
  const gradients = [
    'from-blue-600 to-purple-600',
    'from-green-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-600',
    'from-indigo-600 to-blue-600',
    'from-red-500 to-pink-600'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

function App() {
  const [competition, setCompetition] = useState({
    title: "Talent Show Championship",
    description: "Show off your best talents! Singing, dancing, comedy - all welcome!",
    status: "active",
    participants: 6
  });

  const [messages, setMessages] = useState([
    { username: "TalentFan", message: "This is amazing! 🔥", timestamp: "2 min ago" },
    { username: "DanceQueen", message: "Love the energy!", timestamp: "1 min ago" },
    { username: "Viewer123", message: "Who's your favorite?", timestamp: "30s ago" }
  ]);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Test API connection
    const testAPI = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log('API Response:', response.data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    testAPI();
  }, []);

  const handleVote = (participantId, rating) => {
    console.log(`Voted ${rating} stars for participant ${participantId}`);
    // Here you would send the vote to the backend
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      username: "You",
      message: message,
      timestamp: "now"
    };
    setMessages([...messages, newMessage]);
  };

  const handleStartCompetition = () => {
    setCompetition({...competition, status: "active"});
  };

  const handleEndCompetition = () => {
    setCompetition({...competition, status: "ended"});
  };

  const handleJoinCompetition = () => {
    console.log("Joining competition...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎭</div>
            <div>
              <h1 className="text-2xl font-bold text-white">TikTok Live Competition</h1>
              <p className="text-purple-300 text-sm">Real-time talent showcase</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full border border-purple-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">1,247 viewers</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Competition Controls */}
        <div className="mb-8">
          <CompetitionControls
            competition={competition}
            onStart={handleStartCompetition}
            onEnd={handleEndCompetition}
            onJoin={handleJoinCompetition}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Stream Area */}
          <div className="lg:col-span-3">
            {/* Moderator Stream - Full Width */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🎤 Host Stream
              </h2>
              <VideoFeed participant={mockModerator} isModerator={true} />
            </div>

            {/* Participants Grid - 2x3 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🌟 Participants ({mockParticipants.length}/6)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockParticipants.map((participant) => (
                  <VideoFeed
                    key={participant.id}
                    participant={participant}
                    onVote={handleVote}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Chat */}
            <ChatBox messages={messages} onSendMessage={handleSendMessage} />

            {/* Leaderboard */}
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 shadow-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                🏆 Live Rankings
              </h3>
              <div className="space-y-3">
                {mockParticipants.slice(0, 3).map((participant, index) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-amber-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <img src={participant.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-semibold">{participant.username}</div>
                      <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;