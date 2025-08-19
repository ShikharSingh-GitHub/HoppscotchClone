# Basic Auth & OAuth 2.0 Demonstration Guide

## 🔐 Basic Authentication Demo

### Step 1: Navigate to Authorization Tab

1. Open http://localhost:5175 in your browser
2. Click on the **Authorization** tab in the left panel
3. Select **Basic Auth** from the dropdown

### Step 2: Configure Basic Auth

```
Username: testuser
Password: testpass123
```

### Step 3: Test Basic Auth

1. Set the request URL to: `http://localhost:3001/api/test-auth`
2. Method: GET
3. Click **Send Request**
4. Expected response:

```json
{
  "success": true,
  "authType": "Basic",
  "message": "Basic authentication detected",
  "details": {
    "username": "testuser",
    "encodedCredentials": "dGVzdHVzZXI6dGVzdHBhc3MxMjM="
  }
}
```

### Step 4: Verify Authorization Header

The request should include:

```
Authorization: Basic dGVzdHVzZXI6dGVzdHBhc3MxMjM=
```

---

## 🔑 OAuth 2.0 Demonstration

### Demo 1: Authorization Code Flow

#### Step 1: Configure OAuth 2.0

1. Select **OAuth 2.0** from the Authorization dropdown
2. Grant Type: **Authorization Code**
3. Fill in the form:

```
Authorization URL: https://oauth.example.com/auth
Token URL: https://oauth.example.com/token
Client ID: demo_client_id_12345
Client Secret: demo_client_secret_67890
Scope: read write profile
State: random_state_value_123
Redirect URI: http://localhost:3001/oauth/callback
```

#### Step 2: Test OAuth 2.0 Authorization Code

1. Click **Get Access Token** (this simulates the OAuth flow)
2. The system will generate a mock access token
3. Set request URL to: `http://localhost:3001/api/test-auth`
4. Click **Send Request**
5. Expected response:

```json
{
  "success": true,
  "authType": "Bearer",
  "message": "OAuth 2.0 Bearer token detected",
  "details": {
    "tokenPrefix": "mock_oauth2_token",
    "grantType": "authorization_code"
  }
}
```

### Demo 2: Client Credentials Flow

#### Step 1: Configure Client Credentials

1. Grant Type: **Client Credentials**
2. Fill in the form:

```
Token URL: https://oauth.example.com/token
Client ID: client_credentials_id
Client Secret: client_credentials_secret
Scope: api:read api:write
```

#### Step 2: Test Client Credentials

1. Click **Get Access Token**
2. System generates mock client credentials token
3. Send request to test endpoint
4. Expected response:

```json
{
  "success": true,
  "authType": "Bearer",
  "message": "OAuth 2.0 Bearer token detected",
  "details": {
    "tokenPrefix": "mock_oauth2_token",
    "grantType": "client_credentials"
  }
}
```

### Demo 3: Implicit Flow

#### Step 1: Configure Implicit Flow

1. Grant Type: **Implicit**
2. Fill in the form:

```
Authorization URL: https://oauth.example.com/auth
Client ID: implicit_client_id
Scope: openid profile
State: implicit_state_123
Redirect URI: http://localhost:3001/oauth/implicit/callback
```

#### Step 2: Test Implicit Flow

1. Click **Get Access Token**
2. System generates mock implicit token
3. Send request to test endpoint

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Basic Auth with Special Characters

```
Username: user@domain.com
Password: P@ssw0rd!2024
```

### Scenario 2: OAuth 2.0 with PKCE

```
Grant Type: Authorization Code
Code Challenge Method: S256
Code Verifier: automatically generated
Code Challenge: automatically generated
```

### Scenario 3: Multiple Scopes

```
Scope: read:user write:user admin:system openid profile email
```

---

## 🔍 Verification Steps

### 1. Check Network Tab

- Open browser DevTools (F12)
- Go to Network tab
- Send requests and verify Authorization headers

### 2. Server Response Validation

- Check that server correctly identifies auth type
- Verify credentials are properly decoded
- Confirm token format is correct

### 3. Error Handling

- Test with invalid credentials
- Test with expired tokens
- Test with malformed headers

---

## 📝 Expected Results Summary

| Auth Type                    | Header Format                   | Test Endpoint Response            |
| ---------------------------- | ------------------------------- | --------------------------------- |
| Basic Auth                   | `Authorization: Basic <base64>` | Shows decoded username            |
| OAuth 2.0 Authorization Code | `Authorization: Bearer <token>` | Shows token prefix and grant type |
| OAuth 2.0 Client Credentials | `Authorization: Bearer <token>` | Shows token prefix and grant type |
| OAuth 2.0 Implicit           | `Authorization: Bearer <token>` | Shows token prefix and grant type |

## 🎯 Demo Completion Checklist

- [ ] Basic Auth with test credentials
- [ ] Basic Auth with special characters
- [ ] OAuth 2.0 Authorization Code flow
- [ ] OAuth 2.0 Client Credentials flow
- [ ] OAuth 2.0 Implicit flow
- [ ] Verify Authorization headers in Network tab
- [ ] Confirm server responses match expected format
- [ ] Test error scenarios with invalid credentials
