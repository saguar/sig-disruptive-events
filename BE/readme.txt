Backend API
===========

This directory contains the Express server for the project.

All responses are JSON formatted. Requests to routes that are not defined will
return a 404 status code with the JSON body `{"error":"Not found"}`.

Configuration Notes
-------------------
The configuration file `config/config.json` now uses the key `severity1` instead
of the old `s1` name. Update any custom scripts accordingly.
