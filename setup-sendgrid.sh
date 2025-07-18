#!/bin/bash
# Setup script to configure SendGrid for email functionality
# Replace YOUR_SENDGRID_API_KEY with your actual SendGrid API key

echo "Setting up SendGrid email service..."

# Example: export SENDGRID_API_KEY="SG.your_actual_sendgrid_api_key_here"
export SENDGRID_API_KEY="SG.demo-key-replace-with-real-key"

echo "SendGrid API key set to: ${SENDGRID_API_KEY:0:20}..."

# Instructions for users
echo ""
echo "To use real email delivery:"
echo "1. Get your SendGrid API key from https://app.sendgrid.com/settings/api_keys"
echo "2. Replace the demo key in this script with your real key"
echo "3. Run: source setup-sendgrid.sh"
echo "4. Restart the server"