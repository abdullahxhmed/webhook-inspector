Webhook Inspector
A tool to capture, inspect, and replay HTTP webhooks for debugging. Useful for testing third-party integrations.

[Live Demo: https://webhook-inspector-7jii.onrender.com](https://webhook-inspector-7jii.onrender.com)

What it Does
This project solves a common developer problem: losing webhooks when your server is down during testing. It provides a middleman endpoint that:

Captures any incoming webhook (from Stripe, GitHub, etc.) and saves it to a database.

Lets you view all captured webhooks.

Allows you to replay any saved webhook to a different URL, like your local development server.

How to Run Locally
Prerequisites: Node.js, a MongoDB database (local or via MongoDB Atlas).

Clone the repository and install dependencies:

bash
git clone https://github.com/yourusername/webhook-inspector.git
cd webhook-inspector
npm install
Create a .env file in the project root:

env
DATABASE_URL=mongodb://localhost:27017/webhookInspector
PORT=3000
Start the server:

bash
npm run dev
Using the API
The server runs on http://localhost:3000.

Capture a Webhook: Send a POST request to /webhook. Any JSON payload will be saved.

List Webhooks: Send a GET request to /webhooks to see all captured data.

Replay a Webhook: Send a POST request to /webhooks/:id/replay with a JSON body like {"targetUrl": "https://your-test-endpoint.com"}. It will resend the original webhook to the new URL.

Project Structure
index.js - Main server file with all route logic.

models/Webhook.js - Mongoose schema for storing webhooks.

.env - Configuration file (not committed to Git).

Tech Stack
Node.js, Express, MongoDB, Mongoose, Axios.
