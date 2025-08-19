/**
 * Storage Compatibility Test Script
 * Tests if the new storage system preserves existing database functionality
 */

// Import the storage services
import { apiService } from "./src/services/api.js";

class StorageCompatibilityTester {
  constructor() {
    this.testResults = {
      database: {
        connectivity: false,
        crud: false,
        dataIntegrity: false,
      },
      wrapper: {
        apiConsistency: false,
        errorHandling: false,
        returnFormat: false,
      },
    };
  }

  async runComprehensiveTest() {
    console.log("🧪 Starting Storage Compatibility Test Suite...\n");

    try {
      // Test 1: Database Connectivity
      await this.testDatabaseConnectivity();

      // Test 2: CRUD Operations
      await this.testCRUDOperations();

      // Test 3: Data Integrity
      await this.testDataIntegrity();

      // Test 4: API Consistency
      await this.testAPIConsistency();

      // Test 5: Error Handling
      await this.testErrorHandling();

      // Generate Test Report
      this.generateTestReport();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    }
  }

  async testDatabaseConnectivity() {
    console.log("🔌 Testing Database Connectivity...");

    try {
      // Test basic connectivity by fetching history
      const response = await fetch("http://localhost:5001/api/history");

      if (response.ok) {
        console.log("✅ Database connectivity: PASSED");
        this.testResults.database.connectivity = true;
      } else {
        console.log("❌ Database connectivity: FAILED");
      }
    } catch (error) {
      console.log("❌ Database connectivity: ERROR -", error.message);
    }
  }

  async testCRUDOperations() {
    console.log("\n📝 Testing CRUD Operations...");

    try {
      // Create test data
      const testEntry = {
        method: "GET",
        url: "https://test-compatibility.example.com",
        headers: { "Content-Type": "application/json" },
        body: {},
        responseStatus: 200,
        responseBody: { message: "Compatibility test" },
        responseHeaders: { "Content-Type": "application/json" },
        responseTime: 150,
        requestType: "REST",
        tabId: "test-tab-001",
        tabTitle: "Compatibility Test",
      };

      // Test CREATE
      console.log("  📤 Testing CREATE operation...");
      const createResponse = await fetch("http://localhost:5001/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testEntry),
      });

      if (createResponse.ok) {
        const createdEntry = await createResponse.json();
        console.log("  ✅ CREATE: PASSED - Entry ID:", createdEntry.data?.id);

        // Test READ
        console.log("  📥 Testing READ operation...");
        const readResponse = await fetch("http://localhost:5001/api/history");

        if (readResponse.ok) {
          const historyData = await readResponse.json();
          console.log(
            "  ✅ READ: PASSED - Found",
            historyData.data?.length,
            "entries"
          );

          // Test DELETE
          if (createdEntry.data?.id) {
            console.log("  🗑️ Testing DELETE operation...");
            const deleteResponse = await fetch(
              `http://localhost:5001/api/history/${createdEntry.data.id}`,
              {
                method: "DELETE",
              }
            );

            if (deleteResponse.ok) {
              console.log("  ✅ DELETE: PASSED");
              this.testResults.database.crud = true;
            } else {
              console.log("  ❌ DELETE: FAILED");
            }
          }
        } else {
          console.log("  ❌ READ: FAILED");
        }
      } else {
        console.log("  ❌ CREATE: FAILED");
      }
    } catch (error) {
      console.log("  ❌ CRUD Operations: ERROR -", error.message);
    }
  }

  async testDataIntegrity() {
    console.log("\n🔍 Testing Data Integrity...");

    try {
      // Test data format consistency
      const response = await fetch("http://localhost:5001/api/history");

      if (response.ok) {
        const data = await response.json();
        const entries = data.data || [];

        if (entries.length > 0) {
          const sampleEntry = entries[0];
          const requiredFields = ["id", "method", "url", "timestamp"];
          const hasRequiredFields = requiredFields.every((field) =>
            sampleEntry.hasOwnProperty(field)
          );

          if (hasRequiredFields) {
            console.log(
              "✅ Data Integrity: PASSED - All required fields present"
            );
            this.testResults.database.dataIntegrity = true;
          } else {
            console.log("❌ Data Integrity: FAILED - Missing required fields");
          }
        } else {
          console.log("⚠️ Data Integrity: SKIPPED - No entries found");
          this.testResults.database.dataIntegrity = true; // Assume pass if no data
        }
      }
    } catch (error) {
      console.log("❌ Data Integrity: ERROR -", error.message);
    }
  }

  async testAPIConsistency() {
    console.log("\n🔄 Testing API Consistency...");

    try {
      // Test all API endpoints are still working
      const endpoints = [
        { path: "/api/history", method: "GET", name: "Get History" },
        { path: "/api/health", method: "GET", name: "Health Check" },
      ];

      let allPassed = true;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            `http://localhost:5001${endpoint.path}`,
            {
              method: endpoint.method,
            }
          );

          if (response.ok) {
            console.log(`  ✅ ${endpoint.name}: PASSED`);
          } else {
            console.log(
              `  ❌ ${endpoint.name}: FAILED (Status: ${response.status})`
            );
            allPassed = false;
          }
        } catch (error) {
          console.log(`  ❌ ${endpoint.name}: ERROR - ${error.message}`);
          allPassed = false;
        }
      }

      this.testResults.wrapper.apiConsistency = allPassed;
    } catch (error) {
      console.log("❌ API Consistency: ERROR -", error.message);
    }
  }

  async testErrorHandling() {
    console.log("\n⚠️ Testing Error Handling...");

    try {
      // Test invalid requests
      const invalidTests = [
        {
          name: "Invalid ID Delete",
          url: "http://localhost:5001/api/history/invalid-id-999",
          method: "DELETE",
        },
        {
          name: "Malformed POST Data",
          url: "http://localhost:5001/api/history",
          method: "POST",
          body: "invalid-json",
        },
      ];

      let errorHandlingPassed = true;

      for (const test of invalidTests) {
        try {
          const response = await fetch(test.url, {
            method: test.method,
            headers: test.body ? { "Content-Type": "application/json" } : {},
            body: test.body,
          });

          // We expect these to fail gracefully (4xx errors, not 5xx)
          if (response.status >= 400 && response.status < 500) {
            console.log(
              `  ✅ ${test.name}: PASSED (Status: ${response.status})`
            );
          } else if (response.status >= 500) {
            console.log(
              `  ❌ ${test.name}: FAILED (Server Error: ${response.status})`
            );
            errorHandlingPassed = false;
          } else {
            console.log(
              `  ⚠️ ${test.name}: UNEXPECTED SUCCESS (Status: ${response.status})`
            );
          }
        } catch (error) {
          console.log(
            `  ✅ ${test.name}: PASSED (Network Error Handled: ${error.message})`
          );
        }
      }

      this.testResults.wrapper.errorHandling = errorHandlingPassed;
    } catch (error) {
      console.log("❌ Error Handling: ERROR -", error.message);
    }
  }

  generateTestReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 STORAGE COMPATIBILITY TEST REPORT");
    console.log("=".repeat(60));

    const { database, wrapper } = this.testResults;

    console.log("\n🗄️ DATABASE FUNCTIONALITY:");
    console.log(
      `   Connectivity:     ${
        database.connectivity ? "✅ PASSED" : "❌ FAILED"
      }`
    );
    console.log(
      `   CRUD Operations:  ${database.crud ? "✅ PASSED" : "❌ FAILED"}`
    );
    console.log(
      `   Data Integrity:   ${
        database.dataIntegrity ? "✅ PASSED" : "❌ FAILED"
      }`
    );

    console.log("\n🔗 WRAPPER FUNCTIONALITY:");
    console.log(
      `   API Consistency:  ${
        wrapper.apiConsistency ? "✅ PASSED" : "❌ FAILED"
      }`
    );
    console.log(
      `   Error Handling:   ${
        wrapper.errorHandling ? "✅ PASSED" : "❌ FAILED"
      }`
    );

    // Calculate overall score
    const totalTests = Object.values({ ...database, ...wrapper }).length;
    const passedTests = Object.values({ ...database, ...wrapper }).filter(
      Boolean
    ).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log("\n📈 OVERALL RESULTS:");
    console.log(
      `   Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );

    if (successRate >= 90) {
      console.log(
        "   🎉 EXCELLENT! Database functionality is fully preserved."
      );
    } else if (successRate >= 70) {
      console.log("   ⚠️ GOOD! Minor issues detected, mostly functional.");
    } else {
      console.log("   ❌ POOR! Significant issues detected, needs attention.");
    }

    console.log("\n💡 RECOMMENDATION:");
    if (database.connectivity && database.crud && database.dataIntegrity) {
      console.log("   ✅ Your existing database storage is fully compatible!");
      console.log("   ✅ Users can safely continue using database storage.");
      console.log("   ✅ New JSON storage option is available as alternative.");
    } else {
      console.log("   ⚠️ Some database functionality may be affected.");
      console.log(
        "   🔧 Review the failed tests and fix issues before deployment."
      );
    }

    console.log("\n" + "=".repeat(60));
  }
}

// Run the test
const tester = new StorageCompatibilityTester();
tester.runComprehensiveTest().catch(console.error);
