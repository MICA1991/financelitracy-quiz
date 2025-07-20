# Azure Resource Creation Script for Finance Quiz App
# Run this script after logging into Azure CLI

Write-Host "Creating Azure Resources for Finance Quiz App..." -ForegroundColor Green

# Configuration
$RESOURCE_GROUP = "finance-quiz-rg"
$LOCATION = "Central India"
$COSMOS_ACCOUNT = "finance-quiz-cosmos"
$APP_SERVICE_PLAN = "finance-quiz-plan"
$WEB_APP = "finance-quiz-api"
$STATIC_WEB_APP = "finance-quiz-frontend"

# Get GitHub repository URL from user
$GITHUB_REPO = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo)"

Write-Host "Creating Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host "Creating CosmosDB Account..." -ForegroundColor Yellow
az cosmosdb create --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --kind MongoDB --capabilities EnableMongo

Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

Write-Host "Creating Web App for Backend..." -ForegroundColor Yellow
az webapp create --name $WEB_APP --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --runtime "NODE|20-lts"

Write-Host "Creating Static Web App for Frontend..." -ForegroundColor Yellow
az staticwebapp create --name $STATIC_WEB_APP --resource-group $RESOURCE_GROUP --source $GITHUB_REPO --branch main --app-location "/frontend" --output-location "dist"

Write-Host "Azure Resources Created Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Resource Details:" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP"
Write-Host "CosmosDB: $COSMOS_ACCOUNT"
Write-Host "Web App: $WEB_APP"
Write-Host "Static Web App: $STATIC_WEB_APP"
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "Backend API: https://$WEB_APP.azurewebsites.net"
Write-Host "Frontend: https://$STATIC_WEB_APP.azurewebsites.net"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Get connection strings and tokens"
Write-Host "2. Configure GitHub secrets"
Write-Host "3. Set up Azure AD app registration"
Write-Host "4. Configure environment variables" 