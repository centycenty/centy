import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);

  useEffect(() => {
    initializeData();
    fetchCategories();
    fetchMenuItems();
  }, []);

  const initializeData = async () => {
    try {
      await axios.post(`${API}/initialize-data`);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async (category = '') => {
    try {
      const url = category ? `${API}/menu-items?category=${category}` : `${API}/menu-items`;
      const response = await axios.get(url);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const generateQRCode = async (type, data) => {
    try {
      let url;
      if (type === 'app') {
        const response = await axios.get(`${API}/qr/app`);
        setQRCodeData(response.data);
      } else if (type === 'item') {
        const response = await axios.get(`${API}/qr/menu-item/${data}`);
        setQRCodeData(response.data);
      } else if (type === 'table') {
        const response = await axios.get(`${API}/qr/table/${data}`);
        setQRCodeData(response.data);
      }
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Header = () => (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">🍽️ FoodieQ</h1>
        <button
          onClick={() => generateQRCode('app')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
        >
          <span>📱</span>
          <span>App QR</span>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentView('home')}
          className={`px-4 py-2 rounded-lg ${currentView === 'home' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentView('admin')}
          className={`px-4 py-2 rounded-lg ${currentView === 'admin' ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          Admin
        </button>
      </div>
    </div>
  );

  const UserGreeting = () => (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl m-4">
      <h2 className="text-xl font-bold">Hi, Arnold</h2>
      <p className="text-orange-100">Ready to cook for dinner?</p>
      <div className="mt-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1600555379885-08a02224726d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWVhbHN8ZW58MHx8fHwxNzUzNDgxNjQ3fDA&ixlib=rb-4.1.0&q=85"
            alt="Featured"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold">Chicken Baked</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded">⭐ 4.8</span>
              <span>🕒 25 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SearchBar = () => (
    <div className="px-4 mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      </div>
    </div>
  );

  const CategoryFilter = () => (
    <div className="px-4 mb-6">
      <div className="flex space-x-3 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setSelectedCategory('');
            fetchMenuItems();
          }}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedCategory === '' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.name);
              fetchMenuItems(category.name);
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
              selectedCategory === category.name 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const MenuGrid = () => (
    <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map(item => (
        <div key={item.id} className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="relative">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
              <button
                onClick={() => generateQRCode('item', item.id)}
                className="text-white text-sm"
              >
                📱
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{item.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-orange-400 font-bold text-lg">${item.price}</span>
              <div className="flex items-center space-x-2">
                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-sm">
                  ⭐ {item.rating}
                </span>
                <span className="text-gray-400 text-sm">🕒 {item.cooking_time}min</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedItem(item);
                setCurrentView('item-detail');
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              View Recipe
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const ItemDetail = () => (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => setCurrentView('home')}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        ← Back to Menu
      </button>
      
      {selectedItem && (
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="relative">
            <img 
              src={selectedItem.image_url} 
              alt={selectedItem.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => generateQRCode('item', selectedItem.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
              >
                📱 QR Code
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-white text-3xl font-bold mb-4">{selectedItem.name}</h1>
            <p className="text-gray-400 mb-6">{selectedItem.description}</p>
            
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-orange-400 text-2xl font-bold">${selectedItem.price}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded">
                  ⭐ {selectedItem.rating}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">🕒 {selectedItem.cooking_time} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">📊 {selectedItem.difficulty}</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {selectedItem.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-gray-300">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Instructions</h3>
                <div className="space-y-3">
                  {selectedItem.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AdminPanel = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Admin Panel</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => generateQRCode('app')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                📱 Generate App QR Code
              </button>
              <button
                onClick={() => generateQRCode('table', 'T1')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                🪑 Generate Table QR (T1)
              </button>
              <button
                onClick={() => generateQRCode('table', 'T2')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                🪑 Generate Table QR (T2)
              </button>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Menu Items:</span>
                <span className="text-white font-bold">{menuItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categories:</span>
                <span className="text-white font-bold">{categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available Items:</span>
                <span className="text-white font-bold">
                  {menuItems.filter(item => item.is_available).length}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-xl p-4">
          <h3 className="text-white text-lg font-semibold mb-4">Menu Items Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-600">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Rating</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id} className="text-gray-300 border-b border-gray-600">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.category}</td>
                    <td className="py-2">${item.price}</td>
                    <td className="py-2">⭐ {item.rating}</td>
                    <td className="py-2">
                      <button
                        onClick={() => generateQRCode('item', item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm mr-2"
                      >
                        📱 QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const QRCodeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xl font-bold">QR Code</h3>
          <button
            onClick={() => setShowQRCode(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {qrCodeData && (
          <div className="text-center">
            <img 
              src={qrCodeData.qr_code} 
              alt="QR Code"
              className="mx-auto mb-4 bg-white p-4 rounded-lg"
            />
            <p className="text-gray-400 mb-2">Scan to access:</p>
            <p className="text-white font-mono text-sm break-all mb-4">{qrCodeData.url}</p>
            {qrCodeData.item_name && (
              <p className="text-orange-400 font-semibold">📱 {qrCodeData.item_name}</p>
            )}
            {qrCodeData.table_number && (
              <p className="text-green-400 font-semibold">🪑 Table {qrCodeData.table_number}</p>
            )}
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = 'qr-code.png';
                  link.href = qrCodeData.qr_code;
                  link.click();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                💾 Download
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeData.url);
                  alert('URL copied to clipboard!');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                📋 Copy URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {currentView === 'home' && (
        <div>
          <UserGreeting />
          <SearchBar />
          <CategoryFilter />
          <MenuGrid />
        </div>
      )}
      
      {currentView === 'item-detail' && <ItemDetail />}
      {currentView === 'admin' && <AdminPanel />}
      
      {showQRCode && <QRCodeModal />}
    </div>
  );
}

export default App;