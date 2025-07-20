# 🚀 Step-by-Step Azure Deployment Guide

## 📋 Prerequisites Checklist

- ✅ Code pushed to GitHub
- ✅ Azure subscription active
- ✅ Azure CLI installed and logged in

## 🔧 Step 1: Install Azure CLI (if not installed)

```bash
# Download and install Azure CLI
winget install Microsoft.AzureCLI

# Or download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
```

## 🔐 Step 2: Login to Azure

```bash
# Login to Azure
az login

# Verify login
az account show
```

## 🏗️ Step 3: Create Azure Resources

### Option A: Use the Automated Script
```bash
# Run the PowerShell script
.\azure-setup-script.ps1
```

### Option B: Manual Commands
```bash
# Set variables
$RESOURCE_GROUP="finance-quiz-rg"
$LOCATION="Central India"
$COSMOS_ACCOUNT="finance-quiz-cosmos"
$APP_SERVICE_PLAN="finance-quiz-plan"
$WEB_APP="finance-quiz-api"
$STATIC_WEB_APP="finance-quiz-frontend"
$GITHUB_REPO="https://github.com/MICA1991/financelitracy-quiz.git"

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create CosmosDB Account
az cosmosdb create --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --kind MongoDB --capabilities EnableMongo

# Create App Service Plan
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

# Create Web App for Backend
az webapp create --name $WEB_APP --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --runtime "NODE|18-lts"

# Create Static Web App for Frontend
az staticwebapp create --name $STATIC_WEB_APP --resource-group $RESOURCE_GROUP --source $GITHUB_REPO --branch main --app-location "/frontend" --output-location "dist"
```

## 🔑 Step 4: Get Azure Credentials

### Option A: Use the Automated Script
```bash
# Run the credentials script
.\get-azure-credentials.ps1
```

### Option B: Manual Commands
```bash
# Get CosmosDB Connection String
az cosmosdb keys list --name finance-quiz-cosmos --resource-group finance-quiz-rg --type connection-strings

# Get Web App Publish Profile
az webapp deployment list-publishing-credentials --name finance-quiz-api --resource-group finance-quiz-rg

# Get Static Web App Deployment Token
az staticwebapp secrets list --name finance-quiz-frontend --resource-group finance-quiz-rg
```

## ⚙️ Step 5: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/MICA1991/financelitracy-quiz`

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

### Backend Secrets:
```
AZURE_WEBAPP_PUBLISH_PROFILE=<publish-profile-content>
ADMIN_TOKEN=<generate-jwt-token>
```

### Frontend Secrets:
```
AZURE_STATIC_WEB_APPS_API_TOKEN=<static-web-app-deployment-token>
VITE_API_BASE_URL=https://finance-quiz-api.azurewebsites.net/api
VITE_AZURE_CLIENT_ID=<your-azure-ad-client-id>
VITE_AZURE_TENANT_ID=<your-azure-ad-tenant-id>
VITE_AZURE_REDIRECT_URI=https://finance-quiz-frontend.azurewebsites.net
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

## 🔧 Step 6: Configure Azure App Service

```bash
# Set environment variables for the backend
az webapp config appsettings set \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    MONGODB_URI="<your-cosmosdb-connection-string>" \
    JWT_SECRET="<your-super-secret-jwt-key>" \
    JWT_EXPIRES_IN=24h \
    CORS_ORIGIN="https://finance-quiz-frontend.azurewebsites.net" \
    DEFAULT_ADMIN_USERNAME=admin \
    DEFAULT_ADMIN_PASSWORD=<secure-password>
```

## 🔐 Step 7: Set Up Azure AD (Optional)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `Finance Quiz App`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `https://finance-quiz-frontend.azurewebsites.net`
5. Add platform: **Single-page application**
6. Enable implicit grant: **Access tokens**, **ID tokens**
7. Copy **Application (client) ID** and **Directory (tenant) ID**
8. Update GitHub secrets with these values

## 🚀 Step 8: Test Deployment

### Trigger Deployment:
```bash
# Make a small change to trigger deployment
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test deployment"
git push origin main
```

### Monitor Deployment:
1. Go to your GitHub repository → **Actions** tab
2. Watch the deployment workflows run
3. Check for any errors

### Test the Application:
```bash
# Test backend health
curl https://finance-quiz-api.azurewebsites.net/health

# Test frontend (open in browser)
# https://finance-quiz-frontend.azurewebsites.net
```

## 🧪 Step 9: Verify Everything Works

### Backend Tests:
- ✅ Health endpoint responds
- ✅ Database connection works
- ✅ API endpoints accessible

### Frontend Tests:
- ✅ Application loads
- ✅ Azure AD login works (if configured)
- ✅ Admin dashboard accessible
- ✅ Excel export works

## 🔍 Troubleshooting

### Common Issues:

1. **GitHub Actions not triggering**:
   - Check if workflows are in `.github/workflows/` folder
   - Verify branch name is `main`

2. **Build failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Deployment failures**:
   - Verify GitHub secrets are correct
   - Check Azure resource permissions

4. **CORS issues**:
   - Verify CORS_ORIGIN setting matches frontend URL
   - Check Azure App Service configuration

### Debug Commands:
```bash
# Check app service status
az webapp show --name finance-quiz-api --resource-group finance-quiz-rg

# Check static web app status
az staticwebapp show --name finance-quiz-frontend --resource-group finance-quiz-rg

# View logs
az webapp log tail --name finance-quiz-api --resource-group finance-quiz-rg
```

## 📊 Success Metrics

- ✅ Zero-downtime deployments
- ✅ Automated rollback on failures
- ✅ Health checks passing
- ✅ All features functional
- ✅ Performance metrics within acceptable ranges

## 🎯 Next Steps After Deployment

1. **Set up monitoring** with Application Insights
2. **Configure custom domain** (if needed)
3. **Set up backup strategies**
4. **Implement scaling policies**
5. **Set up alerting and notifications**

---

**Status**: Ready for deployment
**Last Updated**: Current Date 