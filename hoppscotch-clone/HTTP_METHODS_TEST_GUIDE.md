# 🧪 HTTP Request Methods Testing Guide

## Testing Environment

- **Local Server**: http://localhost:5174/
- **Test API**: We'll use JSONPlaceholder (https://jsonplaceholder.typicode.com/) for testing
- **Date**: August 19, 2025

---

## ✅ Supported HTTP Methods

Your Hoppscotch clone supports **7 HTTP methods** with color-coded visual indicators:

| Method        | Color  | Use Case                 | Status           |
| ------------- | ------ | ------------------------ | ---------------- |
| 🟢 **GET**    | Green  | Retrieve data            | ✅ Ready to test |
| 🟠 **POST**   | Orange | Create new resources     | ✅ Ready to test |
| 🔵 **PUT**    | Blue   | Update/replace resources | ✅ Ready to test |
| 🟡 **PATCH**  | Yellow | Partial updates          | ✅ Ready to test |
| 🔴 **DELETE** | Red    | Remove resources         | ✅ Ready to test |
| 🟣 **HEAD**   | Purple | Get headers only         | ✅ Ready to test |
| 🩷 **OPTIONS** | Pink   | Get allowed methods      | ✅ Ready to test |

---

## 🎯 Test Plan

### Test Endpoints (JSONPlaceholder API)

- **Base URL**: `https://jsonplaceholder.typicode.com`
- **Posts**: `/posts` (100 items)
- **Comments**: `/comments` (500 items)
- **Users**: `/users` (10 items)

---

## 📋 Test Cases

### 1. 🟢 GET Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts/1`
**Expected**:

- Status: 200 OK
- Response: JSON object with post data
- Headers: Content-Type: application/json

### 2. 🟠 POST Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts`
**Body**:

```json
{
  "title": "Test Post from Hoppscotch Clone",
  "body": "This is a test post created using our API testing tool",
  "userId": 1
}
```

**Expected**:

- Status: 201 Created
- Response: Created post with id: 101

### 3. 🔵 PUT Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts/1`
**Body**:

```json
{
  "id": 1,
  "title": "Updated Post Title",
  "body": "This post has been updated via PUT request",
  "userId": 1
}
```

**Expected**:

- Status: 200 OK
- Response: Updated post data

### 4. 🟡 PATCH Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts/1`
**Body**:

```json
{
  "title": "Partially Updated Title"
}
```

**Expected**:

- Status: 200 OK
- Response: Post with updated title only

### 5. 🔴 DELETE Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts/1`
**Expected**:

- Status: 200 OK
- Response: Empty object {}

### 6. 🟣 HEAD Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts/1`
**Expected**:

- Status: 200 OK
- No response body (headers only)
- Headers should include Content-Type, Content-Length, etc.

### 7. 🩷 OPTIONS Request Test

**Endpoint**: `https://jsonplaceholder.typicode.com/posts`
**Expected**:

- Status: 200 OK
- Headers should include allowed methods
- May include CORS headers

---

## 🔧 Testing Instructions

### Step 1: Open the Application

1. Navigate to http://localhost:5174/
2. Ensure you're on the REST panel
3. Check that the interface loads properly

### Step 2: Test Each Method

For each test case above:

1. **Select HTTP Method**:

   - Click the method dropdown (default: GET)
   - Select the desired method
   - Verify color coding

2. **Enter URL**:

   - Paste the test endpoint URL
   - Ensure proper formatting

3. **Configure Request** (for POST, PUT, PATCH):

   - Go to "Body" tab
   - Select "JSON" content type
   - Paste the test body JSON

4. **Send Request**:

   - Click the "Send" button (or press Ctrl+Enter)
   - Monitor the request progress

5. **Verify Response**:
   - Check status code
   - Verify response body
   - Check response headers
   - Note response time

### Step 3: Advanced Features Testing

1. **Headers Testing**:

   - Add custom headers
   - Test Content-Type variations
   - Test Authorization headers

2. **Query Parameters**:

   - Test URL parameters
   - Test parameter encoding

3. **Authentication**:

   - Test with Bearer tokens
   - Test Basic Auth
   - Test API Key authentication

4. **History Feature**:
   - Verify requests appear in history
   - Test history restoration
   - Check history filtering

---

## 📊 Expected Results Summary

| Test | Method  | Endpoint | Expected Status | Expected Response |
| ---- | ------- | -------- | --------------- | ----------------- |
| 1    | GET     | /posts/1 | 200             | Post object       |
| 2    | POST    | /posts   | 201             | Created post      |
| 3    | PUT     | /posts/1 | 200             | Updated post      |
| 4    | PATCH   | /posts/1 | 200             | Partial update    |
| 5    | DELETE  | /posts/1 | 200             | Empty object      |
| 6    | HEAD    | /posts/1 | 200             | Headers only      |
| 7    | OPTIONS | /posts   | 200             | Allowed methods   |

---

## 🚀 Additional Tests

### Error Handling Tests

1. **404 Test**: Request non-existent resource

   - URL: `https://jsonplaceholder.typicode.com/posts/999999`
   - Expected: 404 Not Found

2. **Network Error**: Request invalid domain

   - URL: `https://invalid-domain-12345.com/api`
   - Expected: Network error handling

3. **Timeout Test**: Request slow endpoint
   - Test timeout functionality

### Performance Tests

1. **Large Response**: Request all posts

   - URL: `https://jsonplaceholder.typicode.com/posts`
   - Expected: 100 posts, good performance

2. **Concurrent Requests**: Send multiple requests
   - Test request queuing
   - Verify response handling

---

## ✅ Success Criteria

**All tests pass if**:

1. ✅ All 7 HTTP methods work correctly
2. ✅ Status codes are displayed accurately
3. ✅ Response bodies are formatted properly
4. ✅ Headers are displayed correctly
5. ✅ Request history is maintained
6. ✅ Error handling works as expected
7. ✅ UI remains responsive during requests
8. ✅ Authentication methods function properly

---

**Testing Status**: 🟡 Ready to Execute  
**Next Step**: Execute test cases manually through the UI
