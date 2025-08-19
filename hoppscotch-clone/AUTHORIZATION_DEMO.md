# Authorization Tab Demo - Test Cases

## 🔐 Authorization Tab Implementation

Our Hoppscotch clone now has a fully functional Authorization tab with support for multiple authentication methods, just like the original Hoppscotch!

### ✅ **Implemented Authentication Types:**

1. **None** - No authentication
2. **Inherit** - Inherit from collection (placeholder)
3. **Basic Auth** - Username/password authentication
4. **Bearer Token** - Token-based authentication
5. **OAuth 2.0** - Full OAuth2 flow support with grant types:
   - Authorization Code (with PKCE support)
   - Client Credentials
   - Password
   - Implicit
6. **API Key** - Custom headers or query parameters
7. **AWS Signature** - AWS SigV4 authentication
8. **Digest Auth** - HTTP Digest authentication
9. **HAWK** - HAWK authentication protocol
10. **JWT** - JSON Web Token authentication

### 🧪 **Test Scenarios**

#### Test Server Running on: `http://localhost:3001`

#### Test 1: Basic Authentication

```
URL: http://localhost:3001/api/test-auth
Method: GET
Authorization Type: Basic Auth
Username: testuser
Password: testpass123
```

Expected Result: Authorization header `Basic dGVzdHVzZXI6dGVzdHBhc3MxMjM=`

#### Test 2: Bearer Token

```
URL: http://localhost:3001/api/test-auth
Method: GET
Authorization Type: Bearer Token
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample-token
```

Expected Result: Authorization header `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample-token`

#### Test 3: API Key (Headers)

```
URL: http://localhost:3001/api/test-auth
Method: GET
Authorization Type: API Key
Add To: Headers
Key: X-API-Key
Value: sk_test_1234567890abcdef
```

Expected Result: Header `X-API-Key: sk_test_1234567890abcdef`

#### Test 4: API Key (Query Parameters)

```
URL: http://localhost:3001/api/test-auth
Method: GET
Authorization Type: API Key
Add To: Query Parameters
Key: api_key
Value: sk_test_1234567890abcdef
```

Expected Result: URL becomes `http://localhost:3001/api/test-auth?api_key=sk_test_1234567890abcdef`

#### Test 5: OAuth 2.0 (Client Credentials)

```
URL: http://localhost:3001/api/test-auth
Method: GET
Authorization Type: OAuth 2.0
Grant Type: Client Credentials
Add To: Headers
Token Endpoint: https://oauth.example.com/token
Client ID: your_client_id
Client Secret: your_client_secret
Scopes: read write
```

Note: This would normally require an actual OAuth2 server. For demo, you can manually set a token.

### 🎨 **UI Features Implemented:**

1. **Dropdown Selection** - Clean dropdown to select auth type
2. **Conditional Forms** - Different form fields based on auth type
3. **Enable/Disable Toggle** - Checkbox to enable/disable auth
4. **Clear Functionality** - Button to clear auth configuration
5. **Real-time Updates** - Changes are immediately applied to request
6. **Dark Theme Support** - Matches the app's dark theme
7. **Help Documentation** - Links to auth documentation

### 🔧 **Technical Implementation:**

1. **Store Integration** - Auth config saved in Zustand store
2. **Request Service** - Auth headers/params applied to requests
3. **History Support** - Auth config saved with request history
4. **Service Layer** - Dedicated auth service for header generation
5. **Type Safety** - Proper TypeScript-like structure
6. **Error Handling** - Graceful handling of invalid auth configs

### 🚀 **How to Test:**

1. Open the app at `http://localhost:5175`
2. Navigate to the Authorization tab in the left panel
3. Select an authentication type from the dropdown
4. Fill in the required fields
5. Make a request to `http://localhost:3001/api/test-auth`
6. Check the response to see the detected authentication

### 📋 **Expected Test Results:**

The test server will respond with details about the detected authentication:

```json
{
  "success": true,
  "timestamp": "2025-08-18T...",
  "method": "GET",
  "authType": "basic",
  "authInfo": {
    "username": "testuser",
    "password": "***"
  },
  "message": "Request received with basic authentication"
}
```

This demonstrates that our Authorization tab is working correctly and applying the authentication as expected!
