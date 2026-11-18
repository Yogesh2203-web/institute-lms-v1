INSTITUTE LMS — DEPLOYMENT FIRST

1. Frontend: deploy the frontend folder to Vercel.
2. Edit frontend/public/lms-config.js and replace https://YOUR-API-SERVICE.onrender.com with your actual deployed API HTTPS URL.
3. Backend: deploy backend/InstituteLMS.API using its Dockerfile (for example, on Render).
4. Configure ConnectionStrings__DefaultConnection, Jwt__Key (32+ bytes), Jwt__Issuer, Jwt__Audience, Cors__AllowedOrigins__0, and AdminSetupKey in the backend host environment.
5. Generate and apply the EF Core InitialCreate migration before first login. Exact commands and the one-time admin setup are in VERCEL_BACKEND_FIX_AND_DEPLOY.md.
6. Test the backend /api/health endpoint before testing login.

Never put SQL connection strings, JWT keys, or the one-time admin setup key in frontend files or Git.

Verification note: this package was statically checked and ZIP integrity verified. An Angular production build and .NET build could not be run in this environment because dependencies/.NET SDK were unavailable here.
