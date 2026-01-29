# OAuth Setup Guide

This guide provides step-by-step instructions for configuring OAuth authentication (Google and GitHub) in Supabase for the RSE Tracker app.

## Overview

OAuth allows users to authenticate using their existing Google or GitHub accounts. The RSE Tracker app supports both providers and they are integrated into the login page.

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [GitHub OAuth Setup](#github-oauth-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name (e.g., "RSE Tracker")
5. Click "CREATE"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and select "ENABLE"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in the required fields (app name, user support email, etc.)
   - Add yourself as a test user
4. After configuring consent screen, create OAuth client ID:
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (for local development)
     - `http://localhost:3000/auth/callback` (alternative local port)
     - `https://yourdomain.com/auth/callback` (for production)
   - Click "CREATE"
5. Copy the **Client ID** and **Client Secret**

### Step 4: Add Credentials to Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find and click "Google"
4. Paste your **Client ID** from Google Cloud
5. Paste your **Client Secret** from Google Cloud
6. Enable the provider
7. Click "Save"

---

## GitHub OAuth Setup

### Step 1: Register OAuth App on GitHub

1. Go to GitHub Settings > [Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: RSE Tracker
   - **Homepage URL**:
     - Local: `http://localhost:5173`
     - Production: `https://yourdomain.com`
   - **Authorization callback URL**:
     - Local: `http://localhost:5173/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`
4. Click "Register application"

### Step 2: Generate Client Secret

1. On the OAuth app page, click "Generate a new client secret"
2. Copy the **Client ID** shown at the top
3. Copy the **Client Secret** that was just generated

### Step 3: Add Credentials to Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find and click "GitHub"
4. Paste your **Client ID** from GitHub
5. Paste your **Client Secret** from GitHub
6. Enable the provider
7. Click "Save"

---

## Supabase Configuration

### Redirect URL Settings

The redirect URL must match across:
1. OAuth provider settings (Google Cloud Console / GitHub)
2. Supabase authentication settings
3. Your application's redirect handler

**Supabase Redirect URL Configuration:**

1. Go to "Authentication" > "URL Configuration"
2. Add your redirect URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
3. Click "Save"

### Email Redirect Settings

For email confirmations and password resets:

1. Go to "Authentication" > "Email Templates"
2. Update redirect URLs to match your domain:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

---

## Testing

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Click "Continue with Google" or "Continue with GitHub"

4. Complete the OAuth flow

5. You should be redirected to `/dashboard` after successful authentication

### Troubleshooting Common Issues

#### "Redirect URI mismatch" error
- Ensure the redirect URL in the OAuth provider exactly matches Supabase settings
- Check for trailing slashes and protocol (http vs https)
- Common mistake: forgetting `/auth/callback` in the redirect URL

#### "Invalid Client ID" or "Invalid Client Secret"
- Double-check credentials are correctly copied (no extra spaces)
- Verify credentials are for the correct environment (dev/prod)
- Ensure the provider is enabled in Supabase

#### Blank page after clicking OAuth button
- Check browser console for errors (F12 > Console tab)
- Verify Supabase API keys are correctly set in `.env`
- Ensure the OAuth app is not restricted to specific IP addresses

#### "Unauthorized" errors
- Make sure the OAuth app is enabled in Supabase
- Verify the user account has permission to access the app
- Check that test users are configured (especially for Google)

---

## Environment Variables

Ensure your `.env` file contains:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are used to initialize the Supabase client for OAuth authentication.

---

## Security Considerations

1. **Never commit credentials**: Keep Client IDs and Secrets in `.env` files that are gitignored
2. **Use HTTPS in production**: Always use HTTPS for production redirect URLs
3. **Restrict redirect URLs**: Only add necessary redirect URLs to prevent authorization code interception
4. **Rotate secrets regularly**: Consider rotating OAuth secrets periodically
5. **Monitor authentication**: Check Supabase logs for suspicious authentication attempts

---

## Support and References

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps)
- [Supabase Auth API Reference](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
