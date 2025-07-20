import { Configuration, PopupRequest } from "@azure/msal-browser";

// Get configuration from environment variables
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const redirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin;

// Validate required configuration
if (!clientId || !tenantId) {
  console.error('Azure AD configuration missing. Please set VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID environment variables.');
  console.error('Follow the setup guide in AZURE_AD_SETUP_STEPS.md to register your application in Azure AD.');
}

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || "00000000-0000-0000-0000-000000000000", // Fallback for development
    authority: `https://login.microsoftonline.com/${tenantId || "00000000-0000-0000-0000-000000000000"}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
          default:
            console.log(message);
            return;
        }
      },
    },
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "email", "profile"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
}; 