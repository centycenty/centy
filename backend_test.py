#!/usr/bin/env python3
"""
Backend API Testing for Food Ordering App
Tests QR code generation, menu management, and data initialization APIs
"""

import requests
import json
import sys
from typing import Dict, Any, List
import uuid

# Backend URL from frontend/.env
BACKEND_URL = "https://2c0402ac-7110-4373-ba1b-7f653470b578.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_items = []  # Track created items for cleanup
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_api_root(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("API Root Connectivity", True, f"Response: {data['message']}")
                    return True
            self.log_test("API Root Connectivity", False, f"Status: {response.status_code}")
            return False
        except Exception as e:
            self.log_test("API Root Connectivity", False, f"Error: {str(e)}")
            return False
    
    def test_data_initialization(self):
        """Test data initialization endpoint"""
        try:
            response = self.session.post(f"{BACKEND_URL}/initialize-data")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Data Initialization", True, f"Message: {data.get('message', 'Success')}")
                return True
            else:
                self.log_test("Data Initialization", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Data Initialization", False, f"Error: {str(e)}")
            return False
    
    def test_qr_app_generation(self):
        """Test QR code generation for main app"""
        try:
            response = self.session.get(f"{BACKEND_URL}/qr/app")
            if response.status_code == 200:
                data = response.json()
                if "qr_code" in data and data["qr_code"].startswith("data:image/png;base64,"):
                    self.log_test("QR Code - App Generation", True, f"URL: {data.get('url', 'N/A')}")
                    return True
                else:
                    self.log_test("QR Code - App Generation", False, "Invalid QR code format")
                    return False
            else:
                self.log_test("QR Code - App Generation", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("QR Code - App Generation", False, f"Error: {str(e)}")
            return False
    
    def test_qr_table_generation(self):
        """Test QR code generation for table"""
        table_number = "5"
        try:
            response = self.session.get(f"{BACKEND_URL}/qr/table/{table_number}")
            if response.status_code == 200:
                data = response.json()
                if "qr_code" in data and data["qr_code"].startswith("data:image/png;base64,"):
                    self.log_test("QR Code - Table Generation", True, f"Table: {data.get('table_number', 'N/A')}")
                    return True
                else:
                    self.log_test("QR Code - Table Generation", False, "Invalid QR code format")
                    return False
            else:
                self.log_test("QR Code - Table Generation", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("QR Code - Table Generation", False, f"Error: {str(e)}")
            return False
    
    def test_custom_qr_generation(self):
        """Test custom QR code generation"""
        qr_data = {
            "data": "https://example.com/custom-link",
            "size": 10,
            "border": 4
        }
        try:
            response = self.session.post(f"{BACKEND_URL}/generate-qr", json=qr_data)
            if response.status_code == 200:
                data = response.json()
                if "qr_code" in data and data["qr_code"].startswith("data:image/png;base64,"):
                    self.log_test("QR Code - Custom Generation", True, "Custom QR generated successfully")
                    return True
                else:
                    self.log_test("QR Code - Custom Generation", False, "Invalid QR code format")
                    return False
            else:
                self.log_test("QR Code - Custom Generation", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("QR Code - Custom Generation", False, f"Error: {str(e)}")
            return False
    
    def test_categories_crud(self):
        """Test category CRUD operations"""
        # Test GET categories
        try:
            response = self.session.get(f"{BACKEND_URL}/categories")
            if response.status_code == 200:
                categories = response.json()
                self.log_test("Categories - GET All", True, f"Found {len(categories)} categories")
                
                # Test POST category
                new_category = {
                    "name": "Test Category",
                    "icon": "🧪",
                    "color": "#FF5733"
                }
                response = self.session.post(f"{BACKEND_URL}/categories", json=new_category)
                if response.status_code == 200:
                    created_category = response.json()
                    category_id = created_category["id"]
                    self.created_items.append(("category", category_id))
                    self.log_test("Categories - POST Create", True, f"Created category: {created_category['name']}")
                    
                    # Test DELETE category
                    response = self.session.delete(f"{BACKEND_URL}/categories/{category_id}")
                    if response.status_code == 200:
                        self.log_test("Categories - DELETE", True, "Category deleted successfully")
                        return True
                    else:
                        self.log_test("Categories - DELETE", False, f"Status: {response.status_code}")
                        return False
                else:
                    self.log_test("Categories - POST Create", False, f"Status: {response.status_code}")
                    return False
            else:
                self.log_test("Categories - GET All", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Categories - CRUD", False, f"Error: {str(e)}")
            return False
    
    def test_menu_items_crud(self):
        """Test menu items CRUD operations"""
        # Test GET all menu items
        try:
            response = self.session.get(f"{BACKEND_URL}/menu-items")
            if response.status_code == 200:
                items = response.json()
                self.log_test("Menu Items - GET All", True, f"Found {len(items)} menu items")
                
                # Test category filtering
                if items:
                    first_category = items[0]["category"]
                    response = self.session.get(f"{BACKEND_URL}/menu-items?category={first_category}")
                    if response.status_code == 200:
                        filtered_items = response.json()
                        self.log_test("Menu Items - Category Filter", True, f"Found {len(filtered_items)} items in {first_category}")
                    else:
                        self.log_test("Menu Items - Category Filter", False, f"Status: {response.status_code}")
                
                # Test POST new menu item
                new_item = {
                    "name": "Test Pasta Dish",
                    "description": "Delicious test pasta with marinara sauce",
                    "price": 15.99,
                    "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
                    "category": "Dinner",
                    "cooking_time": 20,
                    "difficulty": "Medium",
                    "rating": 4.5,
                    "ingredients": ["Pasta", "Marinara Sauce", "Parmesan", "Basil"],
                    "instructions": ["Boil pasta", "Heat sauce", "Combine", "Serve hot"]
                }
                
                response = self.session.post(f"{BACKEND_URL}/menu-items", json=new_item)
                if response.status_code == 200:
                    created_item = response.json()
                    item_id = created_item["id"]
                    self.created_items.append(("menu_item", item_id))
                    self.log_test("Menu Items - POST Create", True, f"Created item: {created_item['name']}")
                    
                    # Test GET specific item
                    response = self.session.get(f"{BACKEND_URL}/menu-items/{item_id}")
                    if response.status_code == 200:
                        item = response.json()
                        self.log_test("Menu Items - GET Specific", True, f"Retrieved: {item['name']}")
                        
                        # Test QR code for menu item
                        response = self.session.get(f"{BACKEND_URL}/qr/menu-item/{item_id}")
                        if response.status_code == 200:
                            qr_data = response.json()
                            if "qr_code" in qr_data and qr_data["qr_code"].startswith("data:image/png;base64,"):
                                self.log_test("QR Code - Menu Item", True, f"QR for: {qr_data.get('item_name', 'N/A')}")
                            else:
                                self.log_test("QR Code - Menu Item", False, "Invalid QR format")
                        else:
                            self.log_test("QR Code - Menu Item", False, f"Status: {response.status_code}")
                        
                        # Test PUT update item
                        updated_item = new_item.copy()
                        updated_item["name"] = "Updated Test Pasta"
                        updated_item["price"] = 17.99
                        
                        response = self.session.put(f"{BACKEND_URL}/menu-items/{item_id}", json=updated_item)
                        if response.status_code == 200:
                            updated = response.json()
                            self.log_test("Menu Items - PUT Update", True, f"Updated: {updated['name']}, Price: ${updated['price']}")
                        else:
                            self.log_test("Menu Items - PUT Update", False, f"Status: {response.status_code}")
                        
                        # Test DELETE item
                        response = self.session.delete(f"{BACKEND_URL}/menu-items/{item_id}")
                        if response.status_code == 200:
                            self.log_test("Menu Items - DELETE", True, "Item deleted successfully")
                            return True
                        else:
                            self.log_test("Menu Items - DELETE", False, f"Status: {response.status_code}")
                            return False
                    else:
                        self.log_test("Menu Items - GET Specific", False, f"Status: {response.status_code}")
                        return False
                else:
                    self.log_test("Menu Items - POST Create", False, f"Status: {response.status_code}")
                    return False
            else:
                self.log_test("Menu Items - GET All", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Menu Items - CRUD", False, f"Error: {str(e)}")
            return False
    
    def test_users_crud(self):
        """Test user CRUD operations"""
        try:
            # Test GET users
            response = self.session.get(f"{BACKEND_URL}/users")
            if response.status_code == 200:
                users = response.json()
                self.log_test("Users - GET All", True, f"Found {len(users)} users")
                
                # Test POST user
                new_user = {
                    "username": "testchef",
                    "email": "testchef@foodapp.com",
                    "password": "securepassword123"
                }
                
                response = self.session.post(f"{BACKEND_URL}/users", json=new_user)
                if response.status_code == 200:
                    created_user = response.json()
                    self.log_test("Users - POST Create", True, f"Created user: {created_user['username']}")
                    return True
                else:
                    self.log_test("Users - POST Create", False, f"Status: {response.status_code}")
                    return False
            else:
                self.log_test("Users - GET All", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Users - CRUD", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for non-existent resources"""
        try:
            # Test non-existent menu item
            fake_id = str(uuid.uuid4())
            response = self.session.get(f"{BACKEND_URL}/menu-items/{fake_id}")
            if response.status_code == 404:
                self.log_test("Error Handling - Menu Item 404", True, "Correctly returned 404")
            else:
                self.log_test("Error Handling - Menu Item 404", False, f"Expected 404, got {response.status_code}")
            
            # Test non-existent menu item QR
            response = self.session.get(f"{BACKEND_URL}/qr/menu-item/{fake_id}")
            if response.status_code == 404:
                self.log_test("Error Handling - QR Menu Item 404", True, "Correctly returned 404")
                return True
            else:
                self.log_test("Error Handling - QR Menu Item 404", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for Food Ordering App")
        print("=" * 60)
        
        # Test in priority order
        tests = [
            ("API Connectivity", self.test_api_root),
            ("Data Initialization", self.test_data_initialization),
            ("QR Code - App", self.test_qr_app_generation),
            ("QR Code - Table", self.test_qr_table_generation),
            ("QR Code - Custom", self.test_custom_qr_generation),
            ("Menu Items CRUD", self.test_menu_items_crud),
            ("Categories CRUD", self.test_categories_crud),
            ("Users CRUD", self.test_users_crud),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n📋 Testing: {test_name}")
            print("-" * 40)
            if test_func():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"🏁 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ All backend tests PASSED!")
            return True
        else:
            print(f"❌ {total - passed} tests FAILED")
            return False

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Backend is working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  Some backend tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()