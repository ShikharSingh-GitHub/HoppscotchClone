const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// Helper function to safely stringify objects
const safeStringify = (obj) => {
  if (obj === null || obj === undefined) {
    return "{}";
  }
  if (typeof obj === "string") {
    // If it's already a string, try to parse it first to validate
    try {
      JSON.parse(obj);
      return obj;
    } catch (e) {
      // If it's not valid JSON, wrap it in quotes
      return JSON.stringify(obj);
    }
  }
  if (typeof obj === "object") {
    return JSON.stringify(obj);
  }
  return JSON.stringify(obj);
};

// Helper function to safely parse JSON
const safeParse = (str) => {
  if (!str) return {};
  if (typeof str === "object") return str;

  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Failed to parse JSON:", str, e);
    return {};
  }
};

// Get all history entries
const getHistory = async (req, res) => {
  try {
    const { type } = req.query;

    let query = `
      SELECT 
        id, method, url, headers, body, 
        response_status, response_body, response_headers, 
        response_time, request_type, timestamp,
        tab_id, tab_title,
        is_starred
      FROM request_history 
    `;

    const params = [];

    if (type && type !== "all") {
      query += " WHERE request_type = ?";
      params.push(type);
    }

    query += " ORDER BY timestamp DESC";

    const [rows] = await pool.execute(query, params);

    // Safely parse JSON with error handling
    const history = rows.map((row) => {
      return {
        ...row,
        headers: safeParse(row.headers),
        response_headers: safeParse(row.response_headers),
        tabId: row.tab_id,
        tabTitle: row.tab_title,
      };
    });

    res.json({
      success: true,
      data: history,
      message: "History retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
};

// Add history entry
const addHistory = async (req, res) => {
  try {
    const {
      method,
      url,
      headers,
      body,
      responseStatus,
      responseBody,
      responseHeaders,
      responseTime,
      requestType = "REST",
      tabId,
      tabTitle,
    } = req.body;

    console.log("Adding history entry with tab info:", {
      tabId: tabId || "not provided",
      tabTitle: tabTitle || "not provided",
    });

    // Debug: log the incoming headers
    console.log("Incoming headers:", headers, "Type:", typeof headers);
    console.log(
      "Incoming responseHeaders:",
      responseHeaders,
      "Type:",
      typeof responseHeaders
    );

    const id = uuidv4();

    // Ensure we're stringifying objects properly
    const headersStr = safeStringify(headers);
    const responseHeadersStr = safeStringify(responseHeaders);

    console.log("Stringified headers:", headersStr);
    console.log("Stringified responseHeaders:", responseHeadersStr);

    const query = `
      INSERT INTO request_history 
      (id, method, url, headers, body, response_status, response_body, response_headers, response_time, request_type, tab_id, tab_title, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      id,
      method,
      url,
      headersStr,
      body || null,
      responseStatus || 0,
      responseBody || "",
      responseHeadersStr,
      responseTime || 0,
      requestType,
      tabId || null,
      tabTitle || null,
    ];

    await pool.execute(query, params);

    res.status(201).json({
      success: true,
      data: { id, tabId, tabTitle },
      message: "History entry added successfully",
    });
  } catch (error) {
    console.error("Error adding history entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add history entry",
    });
  }
};

// Delete history entry
const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM request_history WHERE id = ?";
    const [result] = await pool.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "History entry not found",
      });
    }

    res.json({
      success: true,
      message: "History entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting history entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete history entry",
    });
  }
};

// Toggle star status
const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;

    // First get current star status
    const [rows] = await pool.execute(
      "SELECT is_starred FROM request_history WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "History entry not found",
      });
    }

    const newStarStatus = !rows[0].is_starred;

    // Update the star status
    await pool.execute(
      "UPDATE request_history SET is_starred = ? WHERE id = ?",
      [newStarStatus ? 1 : 0, id]
    );

    res.json({
      success: true,
      data: { is_starred: newStarStatus },
      message: "Star status updated successfully",
    });
  } catch (error) {
    console.error("Error toggling star status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle star status",
    });
  }
};

// Clear history
const clearHistory = async (req, res) => {
  try {
    const { type } = req.query;
    let query = "DELETE FROM request_history";
    let params = [];

    if (type) {
      query = "DELETE FROM request_history WHERE request_type = ?";
      params = [type];
    }

    const [result] = await pool.execute(query, params);

    res.json({
      success: true,
      message: `Cleared ${result.affectedRows} history entries`,
    });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear history",
    });
  }
};

module.exports = {
  getHistory,
  addHistory,
  deleteHistory,
  toggleStar,
  clearHistory,
};
