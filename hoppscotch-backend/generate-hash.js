const bcrypt = require("bcryptjs");

async function generateHashes() {
  try {
    // OAuth2 client secret
    const clientSecret = "demo-secret";
    const clientHash = await bcrypt.hash(clientSecret, 10);

    // User password
    const userPassword = "password";
    const userHash = await bcrypt.hash(userPassword, 10);

    console.log("=== OAuth2 Client Credentials ===");
    console.log("Client Secret:", clientSecret);
    console.log("Client Hash:", clientHash);

    console.log("\n=== Basic Auth User ===");
    console.log("Password:", userPassword);
    console.log("Password Hash:", userHash);

    // Test the hashes
    const clientValid = await bcrypt.compare(clientSecret, clientHash);
    const userValid = await bcrypt.compare(userPassword, userHash);

    console.log("\n=== Validation ===");
    console.log("Client hash validation:", clientValid);
    console.log("User hash validation:", userValid);

    console.log("\n=== SQL Updates ===");
    console.log(
      `UPDATE oauth_clients SET client_secret_hash = '${clientHash}' WHERE client_id = 'demo-client';`
    );
    console.log(
      `UPDATE users SET password_hash = '${userHash}' WHERE username = 'demo';`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

generateHashes();
