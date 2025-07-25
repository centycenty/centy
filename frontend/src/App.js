import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

// Live Voting Board Component
const LiveVotingBoard = ({ competitionId, isAdmin = false }) => {
  const [activeVoting, setActiveVoting] = useState(null);
  const [votingQuestion, setVotingQuestion] = useState('');
  const [votingOptions, setVotingOptions] = useState(['Option A', 'Option B', 'Option C']);
  const [userVote, setUserVote] = useState(null);
  const [currentUserId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Simulate getting active voting session
    const mockVoting = {
      id: "voting_1",
      competition_id: competitionId,
      question: "Who has the best performance so far?",
      options: ["DanceStar99", "SingingQueen", "TalentKing"],
      votes: {
        "DanceStar99": 45,
        "SingingQueen": 38,
        "TalentKing": 52
      },
      is_active: true
    };
    setActiveVoting(mockVoting);
  }, [competitionId]);

  const startVoting = async () => {
    try {
      const response = await axios.post(`${API}/voting/create`, {
        competition_id: competitionId,
        question: votingQuestion,
        options: votingOptions.filter(opt => opt.trim() !== '')
      });
      setActiveVoting(response.data);
      setVotingQuestion('');
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  const submitVote = async (option) => {
    if (userVote) return; // Already voted

    try {
      await axios.post(`${API}/voting/submit`, {
        voting_session_id: activeVoting.id,
        voter_id: currentUserId,
        selected_option: option
      });
      setUserVote(option);
      
      // Update local state (in real app, this would come via WebSocket)
      setActiveVoting(prev => ({
        ...prev,
        votes: {
          ...prev.votes,
          [option]: prev.votes[option] + 1
        }
      }));
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const endVoting = async () => {
    try {
      await axios.post(`${API}/voting/${activeVoting.id}/end`);
      setActiveVoting(prev => ({ ...prev, is_active: false }));
    } catch (error) {
      console.error('Error ending voting:', error);
    }
  };

  const addOption = () => {
    setVotingOptions([...votingOptions, '']);
  };

  const updateOption = (index, value) => {
    const newOptions = [...votingOptions];
    newOptions[index] = value;
    setVotingOptions(newOptions);
  };

  const removeOption = (index) => {
    if (votingOptions.length > 2) {
      setVotingOptions(votingOptions.filter((_, i) => i !== index));
    }
  };

  const totalVotes = activeVoting ? Object.values(activeVoting.votes).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          🗳️ Live Voting
          {activeVoting?.is_active && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </h3>
        {totalVotes > 0 && (
          <div className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full">
            {totalVotes} votes
          </div>
        )}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <h4 className="text-white font-bold mb-3">🔧 Admin Controls</h4>
          
          {!activeVoting?.is_active && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Voting Question
                </label>
                <input
                  type="text"
                  value={votingQuestion}
                  onChange={(e) => setVotingQuestion(e.target.value)}
                  placeholder="Enter your voting question..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Voting Options
                </label>
                {votingOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    {votingOptions.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  ➕ Add Option
                </button>
              </div>

              <button
                onClick={startVoting}
                disabled={!votingQuestion || votingOptions.filter(opt => opt.trim()).length < 2}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200"
              >
                🚀 Start Voting
              </button>
            </div>
          )}

          {activeVoting?.is_active && (
            <div className="flex gap-4">
              <button
                onClick={endVoting}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-bold"
              >
                🛑 End Voting
              </button>
              <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg">
                Voting is live!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Voting Display */}
      {activeVoting && (
        <div>
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <h4 className="text-white font-bold mb-3">{activeVoting.question}</h4>
            
            {activeVoting.is_active && !userVote ? (
              <div className="space-y-3">
                {activeVoting.options.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => submitVote(option)}
                    className="w-full bg-gray-700 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-all duration-200 text-left flex items-center justify-between"
                  >
                    <span>{option}</span>
                    <span className="text-purple-300">{activeVoting.votes[option] || 0} votes</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activeVoting.options.map((option, index) => {
                  const voteCount = activeVoting.votes[option] || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const isUserChoice = userVote === option;
                  
                  return (
                    <div key={option} className={`bg-gray-700 rounded-lg p-4 ${isUserChoice ? 'ring-2 ring-purple-500' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">
                          {option}
                          {isUserChoice && <span className="ml-2 text-purple-400">✓ Your vote</span>}
                        </span>
                        <span className="text-gray-300">{voteCount} votes</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-gray-400 text-sm mt-1">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!activeVoting && !isAdmin && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🗳️</div>
          <p className="text-gray-400">No active voting session</p>
          <p className="text-gray-500 text-sm">Wait for the admin to start a vote</p>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_users: 1247,
    active_competitions: 3,
    total_votes: 5823,
    total_messages: 12456,
    banned_users: 12
  });

  const mockUsers = [
    { id: '1', username: 'DanceStar99', email: 'dance@example.com', role: 'participant', is_banned: false, created_at: '2024-01-15' },
    { id: '2', username: 'SingingQueen', email: 'sing@example.com', role: 'participant', is_banned: false, created_at: '2024-01-20' },
    { id: '3', username: 'BadUser123', email: 'bad@example.com', role: 'viewer', is_banned: true, created_at: '2024-01-10' },
  ];

  const mockCompetitions = [
    { id: '1', title: 'Talent Show Championship', status: 'active', participants: 6, created_at: '2024-01-25' },
    { id: '2', title: 'Dance Battle Royale', status: 'waiting', participants: 4, created_at: '2024-01-24' },
    { id: '3', title: 'Comedy Night', status: 'ended', participants: 8, created_at: '2024-01-20' },
  ];

  const chartData = [
    { name: 'Jan', users: 400, votes: 2400 },
    { name: 'Feb', users: 300, votes: 1398 },
    { name: 'Mar', users: 200, votes: 9800 },
    { name: 'Apr', users: 278, votes: 3908 },
    { name: 'May', users: 189, votes: 4800 },
  ];

  const pieData = [
    { name: 'Participants', value: 45, color: '#8b5cf6' },
    { name: 'Viewers', value: 40, color: '#ec4899' },
    { name: 'Moderators', value: 10, color: '#10b981' },
    { name: 'Admins', value: 5, color: '#f59e0b' },
  ];

  const banUser = async (userId) => {
    try {
      await axios.post(`${API}/users/${userId}/ban`, { admin_id: 'admin_1' });
      // In real app, refresh the user list
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const unbanUser = async (userId) => {
    try {
      await axios.post(`${API}/users/${userId}/unban`, { admin_id: 'admin_1' });
      // In real app, refresh the user list
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const startCompetition = async (competitionId) => {
    try {
      await axios.post(`${API}/competitions/${competitionId}/start`);
      // In real app, refresh the competition list
    } catch (error) {
      console.error('Error starting competition:', error);
    }
  };

  const endCompetition = async (competitionId) => {
    try {
      await axios.post(`${API}/competitions/${competitionId}/end`);
      // In real app, refresh the competition list
    } catch (error) {
      console.error('Error ending competition:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'competitions', name: 'Competitions', icon: '🏆' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'voting', name: 'Live Voting', icon: '🗳️' },
    { id: 'moderation', name: 'Moderation', icon: '🛡️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Admin Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎛️</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-purple-300 text-sm">TikTok Live Competition Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              🔙 Back to App
            </Link>
            <div className="flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full border border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Admin Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">{stats.total_users.toLocaleString()}</div>
                <div className="text-blue-200">Total Users</div>
                <div className="text-green-300 text-sm mt-2">↗️ +12% this week</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">{stats.active_competitions}</div>
                <div className="text-green-200">Active Competitions</div>
                <div className="text-green-300 text-sm mt-2">🔥 Live now</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">{stats.total_votes.toLocaleString()}</div>
                <div className="text-purple-200">Total Votes</div>
                <div className="text-green-300 text-sm mt-2">↗️ +45% today</div>
              </div>
              <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">{stats.total_messages.toLocaleString()}</div>
                <div className="text-pink-200">Chat Messages</div>
                <div className="text-green-300 text-sm mt-2">💬 Very active</div>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">{stats.banned_users}</div>
                <div className="text-red-200">Banned Users</div>
                <div className="text-yellow-300 text-sm mt-2">🔒 Security active</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4">📈 Growth Analytics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #6366f1',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="users" fill="#8b5cf6" />
                    <Bar dataKey="votes" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4">👥 User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-gray-300 text-sm">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voting' && (
          <div className="space-y-8">
            <LiveVotingBoard competitionId="comp_1" isAdmin={true} />
          </div>
        )}

        {activeTab === 'competitions' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">🏆 Competition Management</h3>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold">
                ➕ New Competition
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-300 pb-4">Competition</th>
                    <th className="text-gray-300 pb-4">Status</th>
                    <th className="text-gray-300 pb-4">Participants</th>
                    <th className="text-gray-300 pb-4">Created</th>
                    <th className="text-gray-300 pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCompetitions.map(comp => (
                    <tr key={comp.id} className="border-b border-gray-800">
                      <td className="text-white py-4 font-semibold">{comp.title}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          comp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          comp.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {comp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-gray-300 py-4">{comp.participants}/6</td>
                      <td className="text-gray-300 py-4">{comp.created_at}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {comp.status === 'waiting' && (
                            <button 
                              onClick={() => startCompetition(comp.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              ▶️ Start
                            </button>
                          )}
                          {comp.status === 'active' && (
                            <button 
                              onClick={() => endCompetition(comp.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              ⏹️ End
                            </button>
                          )}
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                            ⚙️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">👥 User Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                  <option>All Roles</option>
                  <option>Participants</option>
                  <option>Viewers</option>
                  <option>Moderators</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-300 pb-4">User</th>
                    <th className="text-gray-300 pb-4">Email</th>
                    <th className="text-gray-300 pb-4">Role</th>
                    <th className="text-gray-300 pb-4">Status</th>
                    <th className="text-gray-300 pb-4">Joined</th>
                    <th className="text-gray-300 pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="text-white py-4 font-semibold">{user.username}</td>
                      <td className="text-gray-300 py-4">{user.email}</td>
                      <td className="py-4">
                        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.is_banned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.is_banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="text-gray-300 py-4">{user.created_at}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {user.is_banned ? (
                            <button 
                              onClick={() => unbanUser(user.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              ✅ Unban
                            </button>
                          ) : (
                            <button 
                              onClick={() => banUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              🚫 Ban
                            </button>
                          )}
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                            👤 Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">🛡️ Content Moderation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4">
                  <div className="text-red-400 text-2xl font-bold">23</div>
                  <div className="text-red-300">Flagged Messages</div>
                  <button className="mt-2 bg-red-600 text-white px-4 py-1 rounded text-sm">Review</button>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4">
                  <div className="text-yellow-400 text-2xl font-bold">7</div>
                  <div className="text-yellow-300">Pending Reports</div>
                  <button className="mt-2 bg-yellow-600 text-white px-4 py-1 rounded text-sm">Review</button>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                  <div className="text-blue-400 text-2xl font-bold">156</div>
                  <div className="text-blue-300">Auto-Moderated</div>
                  <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm">View Log</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h3 className="text-2xl font-bold text-white mb-6">📈 Detailed Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white text-lg font-bold mb-4">📊 Engagement Metrics</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #6366f1',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="votes" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white text-lg font-bold">🎯 Key Performance Indicators</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Average Session Duration</span>
                        <span className="text-white font-bold">15:42</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Participant Retention Rate</span>
                        <span className="text-green-400 font-bold">87.3%</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Average Votes per Competition</span>
                        <span className="text-purple-400 font-bold">1,247</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Peak Concurrent Viewers</span>
                        <span className="text-blue-400 font-bold">3,456</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
        <Link
          to="/admin"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:shadow-lg flex items-center gap-2"
        >
          🎛️ Admin
        </Link>
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

const LiveStreamApp = () => {
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
            {/* Live Voting Board */}
            <LiveVotingBoard competitionId="comp_1" isAdmin={false} />
            
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
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveStreamApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;