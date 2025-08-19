# 🔐 Authentication Implementation Guide

This document describes the comprehensive Basic Auth and OAuth 2.0 implementation in our Hoppscotch clone application.

## 🎯 Overview

Our application now supports professional-grade authentication methods:

- **Basic Authentication** - Username/password combination encoded in Base64
- **OAuth 2.0** - Complete implementation with all major grant flows
  - Authorization Code Flow (with PKCE support)
  - Client Credentials Flow
  - Password Flow
  - Implicit Flow (deprecated but supported)

## 🔧 Basic Authentication

### How it Works

1. User enters username and password in the Authorization tab
2. Credentials are combined as `username:password`
3. String is Base64 encoded using `btoa()`
4. Authorization header is set as `Authorization: Basic <encoded-credentials>`

### Implementation Files

- `src/components/LeftPanel/Authorization.jsx` - UI components
- `src/services/requestAuthService.js` - Header generation logic

### Example Usage

```javascript
// Test Basic Auth in console
window.authTesting.testBasicAuth("myuser", "mypassword");
```

### Security Features

- Secure credential handling
- Base64 encoding following RFC standards
- Environment variable support for credentials

## 🚀 OAuth 2.0 Implementation

### Supported Grant Types

#### 1. Authorization Code Flow

**Best for:** Web applications, mobile apps with secure storage

- Supports PKCE (Proof Key for Code Exchange) for enhanced security
- Two-step process: authorization → token exchange
- Secure handling of client secrets

#### 2. Client Credentials Flow

**Best for:** Server-to-server communication, API access

- Direct token acquisition using client credentials
- Support for Basic Auth header or request body authentication
- Ideal for backend services

#### 3. Password Flow

**Best for:** First-party applications (not recommended for third-party)

- Direct username/password exchange for tokens
- Simple but less secure
- Only use with trusted applications

#### 4. Implicit Flow

**Best for:** Legacy single-page applications (deprecated)

- Direct token return via URL fragment
- No server-side token exchange
- Less secure, avoid for new applications

### Implementation Files

- `src/services/oauth2Service.js` - Complete OAuth 2.0 flows
- `src/components/LeftPanel/Authorization.jsx` - OAuth 2.0 UI
- `src/services/requestAuthService.js` - Request integration

### Key Features

#### PKCE Support

- Automatic code verifier generation
- SHA256 code challenge creation
- Enhanced security for public clients

#### Advanced Configuration

- Custom request parameters for auth/token endpoints
- Flexible client authentication methods
- State parameter for CSRF protection

#### Token Management

- Automatic token application to requests
- Refresh token support
- Secure token storage

## 🎮 Testing & Usage

### Interactive Testing

Open browser console and run:

```javascript
// Test all authentication methods
window.authTesting.demonstrateAuthMethods();

// Test specific methods
window.authTesting.testBasicAuth("user", "pass");
window.authTesting.testOAuth2ClientCredentials({...});
```

### In the Application

1. Open the REST panel
2. Navigate to Authorization tab
3. Select authentication type
4. Configure parameters
5. Generate tokens (for OAuth 2.0)
6. Make authenticated requests

## 📋 Configuration Examples

### Basic Auth

```javascript
{
  "authType": "basic",
  "authActive": true,
  "username": "api_user",
  "password": "api_password"
}
```

### OAuth 2.0 - Authorization Code

```javascript
{
  "authType": "oauth-2",
  "addTo": "HEADERS",
  "grantTypeInfo": {
    "grantType": "AUTHORIZATION_CODE",
    "authEndpoint": "https://api.example.com/oauth2/authorize",
    "tokenEndpoint": "https://api.example.com/oauth2/token",
    "clientID": "your_client_id",
    "clientSecret": "your_client_secret",
    "redirectURI": "https://yourapp.com/callback",
    "scopes": "read write",
    "isPKCE": true,
    "state": "random_state_value"
  }
}
```

### OAuth 2.0 - Client Credentials

```javascript
{
  "authType": "oauth-2",
  "addTo": "HEADERS",
  "grantTypeInfo": {
    "grantType": "CLIENT_CREDENTIALS",
    "tokenEndpoint": "https://api.example.com/oauth2/token",
    "clientID": "your_client_id",
    "clientSecret": "your_client_secret",
    "scopes": "api:read api:write",
    "clientAuthentication": "AS_BASIC_AUTH_HEADERS"
  }
}
```

## 🔒 Security Best Practices

### Basic Auth

- Use HTTPS only
- Store credentials securely
- Consider using environment variables
- Avoid logging credentials

### OAuth 2.0

- Always use HTTPS
- Implement PKCE for public clients
- Use state parameter to prevent CSRF
- Validate redirect URIs
- Implement proper token storage
- Use refresh tokens for long-lived access

## 🛠️ Architecture

### Request Flow

1. User configures authentication in UI
2. Auth configuration stored in request state
3. When making request:
   - `generateAuthHeaders()` creates appropriate headers
   - `generateAuthParams()` creates query parameters (if needed)
   - Headers/params applied to request
4. Request sent with authentication

### Code Structure

```
src/
├── components/LeftPanel/
│   └── Authorization.jsx          # Auth UI components
├── services/
│   ├── oauth2Service.js          # OAuth 2.0 flow implementations
│   ├── requestAuthService.js     # Auth header generation
│   └── requestService.js         # Request execution
├── utils/
│   └── authTesting.js           # Testing utilities
└── store/
    └── store.js                 # State management
```

## 🚦 Error Handling

### Basic Auth

- Invalid characters in credentials
- Missing username/password
- Base64 encoding errors

### OAuth 2.0

- Invalid client credentials
- Authorization code expiry
- Token endpoint errors
- PKCE validation failures
- Redirect URI mismatches

## 🔄 Future Enhancements

### Planned Features

- JWT (JSON Web Token) authentication
- API Key authentication
- AWS Signature authentication
- Digest authentication
- Custom authentication flows

### Improvements

- Token expiry notifications
- Automatic token refresh
- Secure credential storage
- Authentication templates

## 📚 Resources

### OAuth 2.0 Specifications

- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

### Basic Auth

- [RFC 7617 - Basic Authentication](https://tools.ietf.org/html/rfc7617)

---

## 🎯 Quick Start

1. **Basic Auth**: Select "Basic Auth" → Enter username/password → Make request
2. **OAuth 2.0**: Select "OAuth 2.0" → Choose grant type → Configure parameters → Generate token → Make request

Happy API testing! 🚀
