# Shoebox Webapp

A web-based browser and management tool for S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces, etc.).

## Features

- Browse and manage buckets and objects
- Duplicate file and directory detection
- Integrity checking
- File tagging and metadata management
- Multipart uploads
- Bucket scanning and synchronization
- Credential management
- Multiple connection support (stored in localStorage)

## Tech Stack

- **UI**: React 19, Mantine 8, Lucide icons
- **Routing**: TanStack Router
- **Data fetching**: TanStack React Query
- **Build**: Vite, pnpm workspaces
- **Linting/Formatting**: oxlint, oxfmt
- **Language**: TypeScript 5.7

## Project Structure

```
packages/
├── api/        # TypeScript SDK for S3-compatible APIs (aws4fetch, fast-xml-parser)
├── app/        # React SPA
├── tsconfig/   # Shared TypeScript configurations
└── lint/       # Linting rules
```

## S3 Compatibility

The core browsing features (listing buckets, navigating objects, upload, download, rename, delete, tagging) use standard S3 APIs and work with any S3-compatible backend. Shoebox-specific features — duplicate detection, integrity checking, scan status — degrade gracefully when the server doesn't support them.

### CORS

Browsers block cross-origin requests by default. You must configure CORS on every bucket you want to access from the webapp.

**Using curl (with SigV4 signing):**

```bash
export AWS_ACCESS_KEY_ID='your-access-key'
export AWS_SECRET_ACCESS_KEY='your-secret-key'
export BUCKET='Photos'

curl -X PUT "http://localhost:9000/${BUCKET}?cors" \
  --aws-sigv4 "aws:amz:us-east-1:s3" \
  --user "$AWS_ACCESS_KEY_ID:$AWS_SECRET_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '[{"allowed_origins":["*"],"allowed_methods":["GET","PUT","POST","DELETE","HEAD"],"allowed_headers":["*"],"expose_headers":["ETag","x-amz-request-id"],"max_age_seconds":3600}]'
```

**Using the AWS CLI:**

```bash
aws --endpoint-url http://localhost:9000 s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --cors-configuration '{"CORSRules":[{"AllowedOrigins":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedHeaders":["*"],"ExposeHeaders":["ETag","x-amz-request-id"],"MaxAgeSeconds":3600}]}'
```

> For production deployments, replace `"*"` in `AllowedOrigins` with the actual origin of your webapp.

### Other S3 Considerations

- **Credentials** — the app signs every request using AWS Signature V4. Provide the access key and secret when adding a connection.
- **Region** — defaults to `us-east-1`. Set the correct region if your provider requires it.
- **HTTPS / mixed content** — if the webapp is served over HTTPS, the S3 endpoint must also be HTTPS, otherwise the browser will block mixed-content requests.
- **Virtual-hosted vs path-style** — the API client uses path-style requests (`endpoint/bucket/key`), which is what most self-hosted S3 servers expect. No DNS or proxy configuration needed.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start the Vite dev server          |
| `pnpm build`     | Build both `api` and `app`         |
| `pnpm preview`   | Preview the production build       |
| `pnpm lint`      | Run oxlint                         |
| `pnpm fmt`       | Format code with oxfmt             |
| `pnpm fmt:check` | Check formatting without modifying |

## License

[GNU Affero General Public License v3 (AGPLv3)](LICENSE)
