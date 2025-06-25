Backend API
===========

This directory contains the Express server for the project. All endpoints reply with JSON.
Requests to undefined routes return a 404 status code with `{\"error\":\"Not found\"}`.

Configuration Notes
-------------------
The configuration file `config/config.json` now uses the key `severity1` instead of the
old `s1` name. Update any custom scripts accordingly.

Running the Server
------------------
1. Install dependencies:
   ```
   npm install
   ```
2. Start the server with:
   ```
   node BE/server.js
   ```
   or simply `npm start`. The application listens on the `PORT` environment variable
   or defaults to **3000**.

Available Endpoints
-------------------
### `GET /config`
Returns the contents of `config/config.json`.

### `POST /config`
Expects a JSON body with numeric `severity1`, `critical`, `warning` and `outage` fields.
Saves the data to `config/config.json`.
Successful response:
```
{ "message": "Configuration saved successfully" }
```
A `400` status code is returned when the payload is invalid.

### `GET /data`
Reads `data/data.json` and returns its JSON contents.

### `POST /data`
Accepts a JSON payload and stores it in `data/data.json`.
Successful response:
```
{ "message": "Data saved successfully" }
```

### `POST /upload`
Uploads a CSV file. The request must be `multipart/form-data` with the field `file`.
Only files with a `.csv` extension under 2 MB are accepted. Saved files appear in
`uploads/`.
Successful response:
```
{ "message": "File uploaded successfully", "filename": "<saved name>" }
```

Static files from the `FE` directory are served automatically.

Uploads Cleanup
---------------
Saved CSV files in `uploads/` are temporary. An automated task runs once an hour
and deletes files older than **7 days**. Set the `UPLOAD_RETENTION_DAYS`
environment variable to adjust how long uploaded files are kept.
