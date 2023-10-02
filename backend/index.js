require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Note the '/promise'

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PW,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// API Routes
app.get("/api/clients", async (req, res) => {
	try {
		const [results] = await pool.query("SELECT * FROM clients");
		res.json(results);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// Fetch URLs for a specific client
app.get("/api/urls/:client_id", async (req, res) => {
	console.log("Inside /api/urls/:client_id route"); // Log to make sure the route is being hit

	const { client_id } = req.params;
	console.log("Received client_id:", client_id); // Log the received client_id

	const sql = `SELECT urls.id, urls.url, urls.status FROM urls INNER JOIN clients ON urls.client_id = clients.id WHERE clients.id = ?`;

	console.log("Executing SQL:", sql);
	console.log("With Parameters:", [client_id]);

	try {
		const [results] = await pool.query(sql, [client_id]);
		console.log("Query Results:", results); // Log the results here
		res.json(results);
	} catch (err) {
		console.error("Error executing query:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Update URL
app.put("/api/urls/:urlId", async (req, res) => {
	try {
		const { urlId } = req.params;
		const { url } = req.body;

		console.log(`Received urlId: ${urlId}, url: ${url}`); // Debugging line

		if (!urlId || !url) {
			return res
				.status(400)
				.json({ message: "Missing required parameters" });
		}

		const sql = "UPDATE urls SET url = ? WHERE id = ?";
		const [result] = await pool.execute(sql, [url, urlId]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "URL not found" });
		}

		res.status(200).json({ message: "URL updated successfully" });
	} catch (err) {
		console.error("Error updating URL:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// Delete URL
app.delete("/api/urls/:urlId", async (req, res) => {
	const { urlId } = req.params;
	const sql = "DELETE FROM urls WHERE id = ?";
	try {
		await pool.execute(sql, [urlId]);
		res.status(200).json({ message: "URL deleted successfully" });
	} catch (err) {
		console.error("Error deleting URL:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

app.post("/api/urls", async (req, res) => {
	try {
		const { url, client_id } = req.body;

		if (!url || !client_id) {
			return res
				.status(400)
				.json({ error: "Missing required parameters" });
		}

		const sql =
			"INSERT INTO urls (url, client_id, status) VALUES (?, ?, ?)";
		const status = "live"; // You can set the default status here

		const [result] = await pool.execute(sql, [url, client_id, status]);

		if (result.affectedRows > 0) {
			res.status(201).json({ message: "URL added successfully" });
		} else {
			res.status(500).json({ error: "Failed to add URL" });
		}
	} catch (err) {
		console.error("Error adding URL:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/api/clients", async (req, res) => {
	const { name } = req.body;
	try {
		const [result] = await pool.execute(
			"INSERT INTO clients (name) VALUES (?)",
			[name]
		);
		res.json({ success: true, clientId: result.insertId });
	} catch (err) {
		console.error("Error adding new client:", err);
		res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
});

app.put("/api/clients/:client_id", async (req, res) => {
	try {
		const { client_id } = req.params;
		const { newName } = req.body;

		const sql = "UPDATE clients SET name = ? WHERE id = ?";
		await pool.execute(sql, [newName, client_id]);

		res.json({ message: "Client updated successfully" });
	} catch (err) {
		console.error("Error updating client:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

app.delete("/api/clients/:client_id", async (req, res) => {
	try {
		const { client_id } = req.params;
		const sql = "DELETE FROM clients WHERE id = ?";
		await pool.execute(sql, [client_id]);
		res.json({ message: "Client deleted successfully" });
	} catch (err) {
		console.error("Error deleting client:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
