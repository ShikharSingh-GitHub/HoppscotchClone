// Quick test to verify POST request functionality
// This can be run in browser console

const testPostRequest = async () => {
  try {
    console.log("Testing POST request...");

    const requestData = {
      method: "POST",
      url: "http://localhost:5001/api/demo/users",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Frontend Test User",
        email: "frontend@test.com",
        age: 30,
        role: "user",
      }),
    };

    console.log("Request data:", requestData);

    // Using fetch to test
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: requestData.headers,
      body: requestData.body,
    });

    const result = await response.json();
    console.log("Response:", result);
    console.log("Status:", response.status);

    if (response.ok) {
      console.log("✅ POST request successful!");
    } else {
      console.log("❌ POST request failed:", response.statusText);
    }

    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
};

// Run the test
testPostRequest();
