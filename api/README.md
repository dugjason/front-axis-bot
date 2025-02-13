# API Routes

This directory contains serverless API routes that handle server-side functionality. Currently includes:

- `/axis` - Handles Front.app webhook requests to calculate AXIS scores for customer conversations
  - Validates request integrity using Front's signature verification
  - Generates AXIS scores using LLM analysis
  - Updates Front conversations with scores and tags
