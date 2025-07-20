# Azure AD Troubleshooting Guide

## Error: AADSTS700016 - Application not found

**Error Message**: `AADSTS700016: Application with identifier '1cac6d94-6db9-4543-9b11-df04447d8265' was not found in the directory 'MICA - The School of Ideas'`

### What This Means
This error occurs when Azure AD cannot find an application with the specified Client ID in your tenant. The application either:
- Was never registered in your Azure AD tenant
- Has been deleted
- You're using an incorrect Client ID
- You're trying to use a demo/placeholder ID

### How to Fix

#### Step 1: Register Your Application in Azure AD

1. **Go to Azure Portal**
   - Visit [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your MICA admin account
   - Make sure you're in the "MICA - The School of Ideas" tenant

2. **Navigate to App Registrations**
   - Search for "Azure Active Directory" in the search bar
   - Click on "Azure Active Directory"
   - In the left menu, click "App registrations"

3. **Create New Registration**
   - Click "New registration"
   - Fill in the details:
     - **Name**: `Finance Quiz App`
     - **Supported account types**: "Accounts in this organizational directory only (MICA - The School of Ideas only - Single tenant)"
     - **Redirect URI**: 
       - Type: `Single-page application (SPA)`
       - URI: `http://localhost:5173`
   - Click "Register"

4. **Get Your Application Details**
   - Copy the "Application (client) ID" - this is your `clientId`
   - Copy the "Directory (tenant) ID" - this is your `tenantId`

#### Step 2: Configure Authentication

1. **Set Redirect URIs**
   - In your app registration, go to "Authentication"
   - Under "Platform configurations", click "Single-page application"
   - Add redirect URI: `http://localhost:5173`
   - Under "Implicit grant and hybrid flows", check:
     - ✅ Access tokens
     - ✅ ID tokens
   - Click "Save"

#### Step 3: Configure API Permissions

1. **Add Microsoft Graph Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph" → "Delegated permissions"
   - Search and add:
     - `User.Read`
     - `email`
     - `profile`
   - Click "Add permissions"

2. **Grant Admin Consent**
   - Click "Grant admin consent for MICA - The School of Ideas"
   - Click "Yes" to confirm

#### Step 4: Update Your Environment Configuration

**Option A: Use the Setup Script**
```bash
cd frontend
node setup-azure-env.js
```

**Option B: Create .env File Manually**
Create a `.env` file in the `frontend` directory:
```env
VITE_AZURE_CLIENT_ID=your_actual_client_id_here
VITE_AZURE_TENANT_ID=your_actual_tenant_id_here
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

#### Step 5: Test the Configuration

1. **Restart your development server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test the login**
   - Open your browser console
   - Try logging in with Microsoft
   - Check for any new errors

### Common Issues and Solutions

#### Issue: Still getting AADSTS700016 after setup
**Solution**: 
- Double-check your Client ID and Tenant ID
- Make sure you copied the values from the correct app registration
- Verify you're in the right Azure AD tenant

#### Issue: AADSTS50011 - Reply URL does not match
**Solution**:
- Add the exact redirect URI to your Azure AD app registration
- Make sure the URI matches exactly (including protocol, port, and path)

#### Issue: AADSTS65001 - Insufficient permissions
**Solution**:
- Grant admin consent for the API permissions
- Make sure you have admin rights in the Azure AD tenant

#### Issue: Popup blocked
**Solution**:
- Allow popups for your domain
- Try using redirect flow instead of popup

### Verification Checklist

- [ ] Application registered in Azure AD
- [ ] Client ID copied correctly
- [ ] Tenant ID copied correctly
- [ ] Redirect URI added to Azure AD app registration
- [ ] API permissions added and admin consent granted
- [ ] Environment variables set correctly
- [ ] Development server restarted
- [ ] Browser console checked for errors

### Getting Help

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Verify your Azure AD setup** by following the setup guide step-by-step
3. **Test with a different browser** to rule out browser-specific issues
4. **Check your network** to ensure you can access Azure AD endpoints

### Security Notes

- ✅ Client ID is safe to include in frontend code
- ✅ No client secrets needed for this implementation
- ✅ Uses minimal permissions (User.Read, email, profile only)
- ✅ Tokens are handled securely by MSAL

### Production Deployment

When deploying to production:

1. **Update redirect URIs** in Azure AD to include your production domain
2. **Update environment variables** with production URLs
3. **Test with real MICA accounts** to ensure everything works
4. **Monitor Azure AD app usage** in the Azure portal 