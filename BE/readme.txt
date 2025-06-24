Backend API
===========

This directory contains the Express server for the project.

All responses are JSON formatted. Requests to routes that are not defined will
return a 404 status code with the JSON body `{"error":"Not found"}`.
