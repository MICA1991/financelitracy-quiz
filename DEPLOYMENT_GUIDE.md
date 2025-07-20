# 🚀 GitHub to Azure Deployment Guide

This guide will help you deploy the Finance Quiz application to Azure using GitHub Actions.

## 📋 Prerequisites

- Azure subscription
- GitHub repository with your code
- Azure CLI (for initial setup)
- Node.js 18+ (for local testing)

## 🏗️ Azure Resources Setup

### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name finance-quiz-rg --location eastus

# Create CosmosDB account
az cosmosdb create \
  --name finance-quiz-cosmos \
  --resource-group finance-quiz-rg \
  --kind MongoDB \
  --capabilities EnableMongo

# Create App Service Plan
az appservice plan create \
  --name finance-quiz-plan \
  --resource-group finance-quiz-rg \
  --sku B1 \
  --is-linux

# Create Web App for Backend
az webapp create \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --plan finance-quiz-plan \
  --runtime "NODE|18-lts"

# Create Static Web App for Frontend
az staticwebapp create \
  --name finance-quiz-frontend \
  --resource-group finance-quiz-rg \
  --source https://github.com/yourusername/your-repo \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

### Step 2: Get Connection Strings and Tokens

```bash
# Get CosmosDB connection string
az cosmosdb keys list \
  --name finance-quiz-cosmos \
  --resource-group finance-quiz-rg \
  --type connection-strings

# Get Static Web App deployment token
az staticwebapp secrets set \
  --name finance-quiz-frontend \
  --secret-name deployment-token \
  --secret-value "your-deployment-token"

# Get Web App publish profile
az webapp deployment list-publishing-credentials \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg
```

## 🔐 GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

### Backend Secrets
```
AZURE_WEBAPP_PUBLISH_PROFILE=<publish-profile-content>
ADMIN_TOKEN=<jwt-token-for-admin-operations>
```

### Frontend Secrets
```
AZURE_STATIC_WEB_APPS_API_TOKEN=<static-web-app-deployment-token>
VITE_API_BASE_URL=https://finance-quiz-api.azurewebsites.net/api
VITE_AZURE_CLIENT_ID=<your-azure-ad-client-id>
VITE_AZURE_TENANT_ID=<your-azure-ad-tenant-id>
VITE_AZURE_REDIRECT_URI=https://finance-quiz-frontend.azurewebsites.net
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

## ⚙️ Azure App Service Configuration

Set these application settings in your Azure Web App:

```bash
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

## 🔄 Deployment Workflow

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions will automatically:
   - Build the application
   - Run tests
   - Deploy to Azure

### Manual Deployment
```bash
# Trigger deployment manually
git push origin main
```

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://finance-quiz-api.azurewebsites.net/health
```

### Frontend Access
Visit: `https://finance-quiz-frontend.azurewebsites.net`

### API Documentation
Visit: `https://finance-quiz-api.azurewebsites.net/api`

## 🔧 Azure AD Configuration

### Step 1: Create App Registration
1. Go to Azure Portal > Azure Active Directory > App registrations
2. Create new registration:
   - Name: `Finance Quiz App`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `https://finance-quiz-frontend.azurewebsites.net`

### Step 2: Configure Authentication
1. Add platform: Single-page application
2. Add redirect URI: `https://finance-quiz-frontend.azurewebsites.net`
3. Enable implicit grant: Access tokens, ID tokens

### Step 3: Configure API Permissions
1. Add Microsoft Graph permissions:
   - User.Read
   - email
   - profile
2. Grant admin consent

### Step 4: Get Application Details
- Copy Application (client) ID
- Copy Directory (tenant) ID
- Update GitHub secrets

## 📊 Monitoring and Logs

### Application Insights
```bash
# Create Application Insights
az monitor app-insights component create \
  --app finance-quiz-insights \
  --location eastus \
  --resource-group finance-quiz-rg \
  --application-type web
```

### View Logs
```bash
# Stream application logs
az webapp log tail --name finance-quiz-api --resource-group finance-quiz-rg

# Download logs
az webapp log download --name finance-quiz-api --resource-group finance-quiz-rg
```

## 🔒 Security Best Practices

### Environment Variables
- Store all secrets in Azure Key Vault
- Use managed identities for secure access
- Rotate JWT secrets regularly

### Network Security
- Enable HTTPS only
- Configure proper CORS origins
- Use Azure Front Door for additional security

### Monitoring
- Enable Application Insights
- Set up alerting for errors
- Monitor performance metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### 2. Deployment Failures
- Verify GitHub secrets are correct
- Check Azure resource permissions
- Review deployment logs

#### 3. Runtime Errors
- Check application logs
- Verify environment variables
- Test database connectivity

#### 4. CORS Issues
- Verify CORS_ORIGIN setting
- Check frontend URL configuration
- Test API endpoints directly

### Debug Commands
```bash
# Check app service status
az webapp show --name finance-quiz-api --resource-group finance-quiz-rg

# Check static web app status
az staticwebapp show --name finance-quiz-frontend --resource-group finance-quiz-rg

# Test database connection
az webapp ssh --name finance-quiz-api --resource-group finance-quiz-rg
```

## 📈 Scaling and Performance

### App Service Scaling
```bash
# Scale up to Premium plan
az appservice plan update \
  --name finance-quiz-plan \
  --resource-group finance-quiz-rg \
  --sku P1V2

# Enable auto-scaling
az monitor autoscale create \
  --resource-group finance-quiz-rg \
  --resource /subscriptions/<subscription-id>/resourceGroups/finance-quiz-rg/providers/Microsoft.Web/serverfarms/finance-quiz-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name finance-quiz-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

### CosmosDB Scaling
- Enable autoscale for database throughput
- Configure proper indexing
- Monitor RU consumption

## 🔄 Continuous Integration

### Branch Strategy
- `main`: Production deployment
- `develop`: Staging deployment
- Feature branches: Development and testing

### Pull Request Workflow
1. Create feature branch
2. Make changes
3. Create pull request
4. Automated testing
5. Code review
6. Merge to develop/main

## 📞 Support

For issues with:
- **Azure Resources**: Check Azure Portal and documentation
- **GitHub Actions**: Check Actions tab in repository
- **Application**: Check Application Insights and logs
- **Deployment**: Review deployment logs and configuration

## 🔗 Useful Links

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure CosmosDB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 