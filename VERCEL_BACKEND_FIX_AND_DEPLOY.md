# Institute LMS — corrected Vercel + API setup

## 1. Frontend on Vercel
- Import this repository into Vercel.
- Set the project Root Directory to `frontend`.
- Framework preset: Angular (or Other if Angular is not detected).
- Build command: `npm run build`.
- Output directory: `dist/institute-lms-ui/browser`.
- `frontend/public/lms-config.js` is copied to the deployed site root. Replace `https://YOUR-API-SERVICE.onrender.com` with the real HTTPS URL of your deployed API before deployment.
- The Vercel frontend is static. Do not put SQL credentials or JWT secrets in frontend files.

## 2. API hosting (for example Render Docker)
Deploy `backend/InstituteLMS.API` using its Dockerfile. Set these environment variables in the API host:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ASPNETCORE_URLS=http://+:8080` (already set by Dockerfile)
- `ConnectionStrings__DefaultConnection` = your managed SQL Server/Azure SQL connection string
- `Jwt__Key` = a newly generated random secret of at least 32 bytes
- `Jwt__Issuer=InstituteLMS`
- `Jwt__Audience=InstituteLMSUsers`
- `Cors__AllowedOrigins__0=https://YOUR-VERCEL-DOMAIN.vercel.app`
- `AdminSetupKey` = a separate one-time random secret used only to create the first Business Head account

Do not commit real secrets or connection strings. The sample appsettings file intentionally contains no usable production credentials.

## 3. Create database tables
The project uses EF Core and SQL Server. It has no committed migrations in this ZIP. Before the API can serve login requests, install .NET 10 SDK and run from `backend/InstituteLMS.API`:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.0
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet publish -c Release
```

Commit the generated `Migrations` directory and redeploy the API. For production, run migrations as a controlled deployment step, not on every web-server startup.

## 4. Create the first administrator
After the database is migrated and the API is live, send one POST request to:
`https://YOUR-API-SERVICE.onrender.com/api/auth/seed-admin`

JSON body:
```json
{
  "fullName": "Institute Administrator",
  "email": "admin@example.com",
  "password": "Use-A-Unique-Password-At-Least-12-Chars",
  "setupKey": "THE_SAME_AdminSetupKey_VALUE"
}
```

Use your own details and a unique password. Remove `AdminSetupKey` from the hosting environment after successful one-time setup.

## 5. Verify
- Open `https://YOUR-API-SERVICE.onrender.com/api/health`; expect JSON with `status: ok`.
- Open the Vercel site and use the Business Head role with the administrator credentials.
- Login sends `POST /api/auth/login`, stores the JWT in session storage, and routes to the correct role dashboard.
- If CORS fails, verify the exact Vercel origin (scheme + hostname, no path) in `Cors__AllowedOrigins__0`.

## Important scope note
This repair connects the login UI to the included ASP.NET API and removes the machine-specific SQL Server/JWT defaults. Other legacy HTML modules still contain older Flask-era API calls and are not all migrated to the ASP.NET API by this login/database repair. Review those modules before treating every LMS feature as production-ready.
