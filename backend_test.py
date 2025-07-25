#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for TikTok Live Stream Competition
Tests all major endpoints with success and error cases
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

# Backend URL from frontend/.env
BASE_URL = "https://04545a8f-94a2-4956-907c-a916ba66b8f2.preview.emergentagent.com/api"

class TikTokAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "TikTok Live Stream Competition API" in data["message"]:
                    self.log_result("Root Endpoint", True, "API root endpoint accessible")
                    return True
                else:
                    self.log_result("Root Endpoint", False, "Unexpected response format", {"response": data})
            else:
                self.log_result("Root Endpoint", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Connection error: {str(e)}")
        return False
    
    def test_user_management(self):
        """Test user creation, retrieval, and ban/unban functionality"""
        # Test user creation
        try:
            user_data = {
                "username": "streamer_alex",
                "email": "alex@example.com",
                "role": "participant",
                "avatar_url": "https://example.com/avatar.jpg"
            }
            
            response = self.session.post(f"{self.base_url}/users", json=user_data)
            if response.status_code == 200:
                user = response.json()
                self.test_data["user_id"] = user["id"]
                self.log_result("Create User", True, f"User created with ID: {user['id']}")
            else:
                self.log_result("Create User", False, f"HTTP {response.status_code}", {"response": response.text})
                return False
        except Exception as e:
            self.log_result("Create User", False, f"Error: {str(e)}")
            return False
        
        # Test get all users
        try:
            response = self.session.get(f"{self.base_url}/users")
            if response.status_code == 200:
                users = response.json()
                if isinstance(users, list) and len(users) > 0:
                    self.log_result("Get Users", True, f"Retrieved {len(users)} users")
                else:
                    self.log_result("Get Users", False, "No users returned or invalid format")
            else:
                self.log_result("Get Users", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Users", False, f"Error: {str(e)}")
        
        # Test get specific user
        if "user_id" in self.test_data:
            try:
                response = self.session.get(f"{self.base_url}/users/{self.test_data['user_id']}")
                if response.status_code == 200:
                    user = response.json()
                    if user["id"] == self.test_data["user_id"]:
                        self.log_result("Get User by ID", True, "User retrieved successfully")
                    else:
                        self.log_result("Get User by ID", False, "User ID mismatch")
                else:
                    self.log_result("Get User by ID", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Get User by ID", False, f"Error: {str(e)}")
        
        # Create admin user for ban/unban tests
        try:
            admin_data = {
                "username": "admin_sarah",
                "email": "admin@example.com",
                "role": "admin"
            }
            response = self.session.post(f"{self.base_url}/users", json=admin_data)
            if response.status_code == 200:
                admin = response.json()
                self.test_data["admin_id"] = admin["id"]
                self.log_result("Create Admin User", True, f"Admin created with ID: {admin['id']}")
            else:
                self.log_result("Create Admin User", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Create Admin User", False, f"Error: {str(e)}")
        
        # Test ban user
        if "user_id" in self.test_data and "admin_id" in self.test_data:
            try:
                response = self.session.post(
                    f"{self.base_url}/users/{self.test_data['user_id']}/ban",
                    params={"admin_id": self.test_data["admin_id"]}
                )
                if response.status_code == 200:
                    self.log_result("Ban User", True, "User banned successfully")
                else:
                    self.log_result("Ban User", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Ban User", False, f"Error: {str(e)}")
            
            # Test unban user
            try:
                response = self.session.post(
                    f"{self.base_url}/users/{self.test_data['user_id']}/unban",
                    params={"admin_id": self.test_data["admin_id"]}
                )
                if response.status_code == 200:
                    self.log_result("Unban User", True, "User unbanned successfully")
                else:
                    self.log_result("Unban User", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Unban User", False, f"Error: {str(e)}")
        
        return True
    
    def test_competition_management(self):
        """Test competition creation, joining, starting, and ending"""
        # Create competition
        try:
            if "admin_id" not in self.test_data:
                # Create moderator if admin doesn't exist
                mod_data = {
                    "username": "moderator_mike",
                    "email": "mod@example.com",
                    "role": "moderator"
                }
                response = self.session.post(f"{self.base_url}/users", json=mod_data)
                if response.status_code == 200:
                    self.test_data["admin_id"] = response.json()["id"]
            
            comp_data = {
                "title": "Dance Battle Championship",
                "description": "Epic dance competition with live voting",
                "moderator_id": self.test_data["admin_id"],
                "voting_enabled": True
            }
            
            response = self.session.post(f"{self.base_url}/competitions", json=comp_data)
            if response.status_code == 200:
                competition = response.json()
                self.test_data["competition_id"] = competition["id"]
                self.log_result("Create Competition", True, f"Competition created with ID: {competition['id']}")
            else:
                self.log_result("Create Competition", False, f"HTTP {response.status_code}", {"response": response.text})
                return False
        except Exception as e:
            self.log_result("Create Competition", False, f"Error: {str(e)}")
            return False
        
        # Test get all competitions
        try:
            response = self.session.get(f"{self.base_url}/competitions")
            if response.status_code == 200:
                competitions = response.json()
                if isinstance(competitions, list) and len(competitions) > 0:
                    self.log_result("Get Competitions", True, f"Retrieved {len(competitions)} competitions")
                else:
                    self.log_result("Get Competitions", False, "No competitions returned")
            else:
                self.log_result("Get Competitions", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Competitions", False, f"Error: {str(e)}")
        
        # Test get specific competition
        if "competition_id" in self.test_data:
            try:
                response = self.session.get(f"{self.base_url}/competitions/{self.test_data['competition_id']}")
                if response.status_code == 200:
                    comp = response.json()
                    if comp["id"] == self.test_data["competition_id"]:
                        self.log_result("Get Competition by ID", True, "Competition retrieved successfully")
                    else:
                        self.log_result("Get Competition by ID", False, "Competition ID mismatch")
                else:
                    self.log_result("Get Competition by ID", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Get Competition by ID", False, f"Error: {str(e)}")
        
        # Test join competition
        if "competition_id" in self.test_data and "user_id" in self.test_data:
            try:
                response = self.session.post(
                    f"{self.base_url}/competitions/{self.test_data['competition_id']}/join",
                    params={"user_id": self.test_data["user_id"]}
                )
                if response.status_code == 200:
                    self.log_result("Join Competition", True, "Successfully joined competition")
                else:
                    self.log_result("Join Competition", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Join Competition", False, f"Error: {str(e)}")
        
        # Test start competition
        if "competition_id" in self.test_data:
            try:
                response = self.session.post(f"{self.base_url}/competitions/{self.test_data['competition_id']}/start")
                if response.status_code == 200:
                    self.log_result("Start Competition", True, "Competition started successfully")
                else:
                    self.log_result("Start Competition", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Start Competition", False, f"Error: {str(e)}")
        
        return True
    
    def test_live_voting_system(self):
        """Test live voting session creation, voting, and ending"""
        if "competition_id" not in self.test_data:
            self.log_result("Live Voting Setup", False, "No competition available for testing")
            return False
        
        # Create voting session
        try:
            voting_data = {
                "competition_id": self.test_data["competition_id"],
                "question": "Who has the best dance moves?",
                "options": ["Dancer A", "Dancer B", "Dancer C"]
            }
            
            response = self.session.post(f"{self.base_url}/voting/create", json=voting_data)
            if response.status_code == 200:
                voting_session = response.json()
                self.test_data["voting_session_id"] = voting_session["id"]
                self.log_result("Create Voting Session", True, f"Voting session created with ID: {voting_session['id']}")
            else:
                self.log_result("Create Voting Session", False, f"HTTP {response.status_code}", {"response": response.text})
                return False
        except Exception as e:
            self.log_result("Create Voting Session", False, f"Error: {str(e)}")
            return False
        
        # Submit vote
        if "voting_session_id" in self.test_data and "user_id" in self.test_data:
            try:
                vote_data = {
                    "voting_session_id": self.test_data["voting_session_id"],
                    "voter_id": self.test_data["user_id"],
                    "selected_option": "Dancer A"
                }
                
                response = self.session.post(f"{self.base_url}/voting/submit", json=vote_data)
                if response.status_code == 200:
                    self.log_result("Submit Live Vote", True, "Vote submitted successfully")
                else:
                    self.log_result("Submit Live Vote", False, f"HTTP {response.status_code}", {"response": response.text})
            except Exception as e:
                self.log_result("Submit Live Vote", False, f"Error: {str(e)}")
        
        # Get active voting sessions
        try:
            response = self.session.get(f"{self.base_url}/voting/active/{self.test_data['competition_id']}")
            if response.status_code == 200:
                sessions = response.json()
                if isinstance(sessions, list):
                    self.log_result("Get Active Voting Sessions", True, f"Retrieved {len(sessions)} active sessions")
                else:
                    self.log_result("Get Active Voting Sessions", False, "Invalid response format")
            else:
                self.log_result("Get Active Voting Sessions", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Active Voting Sessions", False, f"Error: {str(e)}")
        
        # Get specific voting session
        if "voting_session_id" in self.test_data:
            try:
                response = self.session.get(f"{self.base_url}/voting/{self.test_data['voting_session_id']}")
                if response.status_code == 200:
                    session = response.json()
                    if session["id"] == self.test_data["voting_session_id"]:
                        self.log_result("Get Voting Session", True, "Voting session retrieved successfully")
                    else:
                        self.log_result("Get Voting Session", False, "Session ID mismatch")
                else:
                    self.log_result("Get Voting Session", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Get Voting Session", False, f"Error: {str(e)}")
        
        # End voting session
        if "voting_session_id" in self.test_data:
            try:
                response = self.session.post(f"{self.base_url}/voting/{self.test_data['voting_session_id']}/end")
                if response.status_code == 200:
                    self.log_result("End Voting Session", True, "Voting session ended successfully")
                else:
                    self.log_result("End Voting Session", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("End Voting Session", False, f"Error: {str(e)}")
        
        return True
    
    def test_traditional_voting(self):
        """Test traditional star rating voting system"""
        if "competition_id" not in self.test_data or "user_id" not in self.test_data:
            self.log_result("Traditional Voting Setup", False, "Missing competition or user data")
            return False
        
        # Create another participant for voting
        try:
            participant_data = {
                "username": "dancer_emma",
                "email": "emma@example.com",
                "role": "participant"
            }
            response = self.session.post(f"{self.base_url}/users", json=participant_data)
            if response.status_code == 200:
                participant = response.json()
                self.test_data["participant_id"] = participant["id"]
            else:
                self.log_result("Create Participant", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Create Participant", False, f"Error: {str(e)}")
            return False
        
        # Cast vote
        try:
            vote_data = {
                "competition_id": self.test_data["competition_id"],
                "participant_id": self.test_data["participant_id"],
                "voter_id": self.test_data["user_id"],
                "vote_type": "star",
                "rating": 5
            }
            
            response = self.session.post(f"{self.base_url}/votes", json=vote_data)
            if response.status_code == 200:
                vote = response.json()
                self.log_result("Cast Traditional Vote", True, f"Vote cast with rating: {vote['rating']}")
            else:
                self.log_result("Cast Traditional Vote", False, f"HTTP {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Cast Traditional Vote", False, f"Error: {str(e)}")
        
        # Get competition results
        try:
            response = self.session.get(f"{self.base_url}/competitions/{self.test_data['competition_id']}/results")
            if response.status_code == 200:
                results = response.json()
                if isinstance(results, list):
                    self.log_result("Get Competition Results", True, f"Retrieved results for {len(results)} participants")
                else:
                    self.log_result("Get Competition Results", False, "Invalid results format")
            else:
                self.log_result("Get Competition Results", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Competition Results", False, f"Error: {str(e)}")
        
        return True
    
    def test_chat_system(self):
        """Test chat message sending, retrieval, and moderation"""
        if "competition_id" not in self.test_data or "user_id" not in self.test_data:
            self.log_result("Chat System Setup", False, "Missing competition or user data")
            return False
        
        # Send message
        try:
            message_data = {
                "competition_id": self.test_data["competition_id"],
                "user_id": self.test_data["user_id"],
                "username": "streamer_alex",
                "message": "Great performance everyone! 🔥"
            }
            
            response = self.session.post(f"{self.base_url}/messages", json=message_data)
            if response.status_code == 200:
                message = response.json()
                self.test_data["message_id"] = message["id"]
                self.log_result("Send Chat Message", True, f"Message sent with ID: {message['id']}")
            else:
                self.log_result("Send Chat Message", False, f"HTTP {response.status_code}", {"response": response.text})
                return False
        except Exception as e:
            self.log_result("Send Chat Message", False, f"Error: {str(e)}")
            return False
        
        # Get messages
        try:
            response = self.session.get(f"{self.base_url}/competitions/{self.test_data['competition_id']}/messages")
            if response.status_code == 200:
                messages = response.json()
                if isinstance(messages, list) and len(messages) > 0:
                    self.log_result("Get Chat Messages", True, f"Retrieved {len(messages)} messages")
                else:
                    self.log_result("Get Chat Messages", False, "No messages returned")
            else:
                self.log_result("Get Chat Messages", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Chat Messages", False, f"Error: {str(e)}")
        
        # Moderate message
        if "message_id" in self.test_data and "admin_id" in self.test_data:
            try:
                response = self.session.post(
                    f"{self.base_url}/messages/{self.test_data['message_id']}/moderate",
                    params={"admin_id": self.test_data["admin_id"]}
                )
                if response.status_code == 200:
                    self.log_result("Moderate Message", True, "Message moderated successfully")
                else:
                    self.log_result("Moderate Message", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("Moderate Message", False, f"Error: {str(e)}")
        
        return True
    
    def test_admin_analytics(self):
        """Test admin statistics and actions"""
        # Get admin stats
        try:
            response = self.session.get(f"{self.base_url}/admin/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_users", "active_competitions", "total_votes", "total_messages", "banned_users"]
                if all(field in stats for field in required_fields):
                    self.log_result("Get Admin Stats", True, f"Retrieved admin statistics: {stats}")
                else:
                    self.log_result("Get Admin Stats", False, "Missing required fields in stats")
            else:
                self.log_result("Get Admin Stats", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Admin Stats", False, f"Error: {str(e)}")
        
        # Get admin actions
        try:
            response = self.session.get(f"{self.base_url}/admin/actions")
            if response.status_code == 200:
                actions = response.json()
                if isinstance(actions, list):
                    self.log_result("Get Admin Actions", True, f"Retrieved {len(actions)} admin actions")
                else:
                    self.log_result("Get Admin Actions", False, "Invalid actions format")
            else:
                self.log_result("Get Admin Actions", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Admin Actions", False, f"Error: {str(e)}")
        
        return True
    
    def test_error_handling(self):
        """Test error handling with invalid data and missing resources"""
        # Test invalid user creation
        try:
            invalid_user = {"username": ""}  # Missing required fields
            response = self.session.post(f"{self.base_url}/users", json=invalid_user)
            if response.status_code >= 400:
                self.log_result("Invalid User Creation", True, f"Properly rejected invalid user: HTTP {response.status_code}")
            else:
                self.log_result("Invalid User Creation", False, "Should have rejected invalid user data")
        except Exception as e:
            self.log_result("Invalid User Creation", False, f"Error: {str(e)}")
        
        # Test non-existent user
        try:
            response = self.session.get(f"{self.base_url}/users/non-existent-id")
            if response.status_code == 404:
                self.log_result("Non-existent User", True, "Properly returned 404 for non-existent user")
            else:
                self.log_result("Non-existent User", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("Non-existent User", False, f"Error: {str(e)}")
        
        # Test non-existent competition
        try:
            response = self.session.get(f"{self.base_url}/competitions/non-existent-id")
            if response.status_code == 404:
                self.log_result("Non-existent Competition", True, "Properly returned 404 for non-existent competition")
            else:
                self.log_result("Non-existent Competition", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("Non-existent Competition", False, f"Error: {str(e)}")
        
        # Test duplicate vote submission
        if "voting_session_id" in self.test_data and "user_id" in self.test_data:
            try:
                # Try to vote again with same user
                vote_data = {
                    "voting_session_id": self.test_data["voting_session_id"],
                    "voter_id": self.test_data["user_id"],
                    "selected_option": "Dancer B"
                }
                response = self.session.post(f"{self.base_url}/voting/submit", json=vote_data)
                if response.status_code >= 400:
                    self.log_result("Duplicate Vote Prevention", True, f"Properly prevented duplicate vote: HTTP {response.status_code}")
                else:
                    self.log_result("Duplicate Vote Prevention", False, "Should have prevented duplicate voting")
            except Exception as e:
                self.log_result("Duplicate Vote Prevention", False, f"Error: {str(e)}")
        
        return True
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting TikTok Live Stream Competition API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run test suites in order
        test_suites = [
            ("Basic API Connection", self.test_root_endpoint),
            ("User Management", self.test_user_management),
            ("Competition Management", self.test_competition_management),
            ("Live Voting System", self.test_live_voting_system),
            ("Traditional Voting", self.test_traditional_voting),
            ("Chat System", self.test_chat_system),
            ("Admin Analytics", self.test_admin_analytics),
            ("Error Handling", self.test_error_handling)
        ]
        
        for suite_name, test_func in test_suites:
            print(f"\n📋 Testing {suite_name}...")
            try:
                test_func()
            except Exception as e:
                self.log_result(f"{suite_name} Suite", False, f"Suite failed: {str(e)}")
        
        # End competition if it exists
        if "competition_id" in self.test_data:
            try:
                response = self.session.post(f"{self.base_url}/competitions/{self.test_data['competition_id']}/end")
                if response.status_code == 200:
                    self.log_result("End Competition", True, "Competition ended successfully")
            except Exception as e:
                self.log_result("End Competition", False, f"Error: {str(e)}")
        
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        failed = len(self.results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.results)*100):.1f}%")
        
        if failed > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🔍 Detailed results saved to test data")
        return passed, failed

if __name__ == "__main__":
    tester = TikTokAPITester()
    tester.run_all_tests()