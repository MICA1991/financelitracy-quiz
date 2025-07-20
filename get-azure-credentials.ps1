# Get Azure Credentials and Connection Strings
# Run this script after creating Azure resources

Write-Host "🔐 Getting Azure Credentials..." -ForegroundColor Green

# Configuration
$RESOURCE_GROUP = "finance-quiz-rg"
$COSMOS_ACCOUNT = "finance-quiz-cosmos"
$WEB_APP = "finance-quiz-api"
$STATIC_WEB_APP = "finance-quiz-frontend"

Write-Host "🗄️ Getting CosmosDB Connection String..." -ForegroundColor Yellow
$COSMOS_CONNECTION_STRING = az cosmosdb keys list `
  --name $COSMOS_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" `
  --output tsv

Write-Host "📋 Getting Web App Publish Profile..." -ForegroundColor Yellow
$PUBLISH_PROFILE = az webapp deployment list-publishing-credentials `
  --name $WEB_APP `
  --resource-group $RESOURCE_GROUP `
  --query "publishingUserName" `
  --output tsv

Write-Host "🔑 Getting Static Web App Deployment Token..." -ForegroundColor Yellow
$STATIC_WEB_APP_TOKEN = az staticwebapp secrets list `
  --name $STATIC_WEB_APP `
  --resource-group $RESOURCE_GROUP `
  --query "properties.apiKey" `
  --output tsv

Write-Host ""
Write-Host "✅ Credentials Retrieved Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 GitHub Secrets to Configure:" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Backend Secrets:" -ForegroundColor Yellow
Write-Host "AZURE_WEBAPP_PUBLISH_PROFILE: $PUBLISH_PROFILE"
Write-Host "ADMIN_TOKEN: <generate-jwt-token>"
Write-Host ""
Write-Host "🎨 Frontend Secrets:" -ForegroundColor Yellow
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN: $STATIC_WEB_APP_TOKEN"
Write-Host "VITE_API_BASE_URL: https://$WEB_APP.azurewebsites.net/api"
Write-Host "VITE_AZURE_CLIENT_ID: <your-azure-ad-client-id>"
Write-Host "VITE_AZURE_TENANT_ID: <your-azure-ad-tenant-id>"
Write-Host "VITE_AZURE_REDIRECT_URI: https://$STATIC_WEB_APP.azurewebsites.net"
Write-Host "VITE_GEMINI_API_KEY: <your-gemini-api-key>"
Write-Host ""
Write-Host "🗄️ Azure App Service Environment Variables:" -ForegroundColor Cyan
Write-Host "MONGODB_URI: $COSMOS_CONNECTION_STRING"
Write-Host "JWT_SECRET: <your-super-secret-jwt-key>"
Write-Host "CORS_ORIGIN: https://$STATIC_WEB_APP.azurewebsites.net"
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. Copy these values to your GitHub repository secrets"
Write-Host "2. Set up Azure AD app registration for authentication"
Write-Host "3. Configure Azure App Service environment variables"
Write-Host "4. Test the deployment" 