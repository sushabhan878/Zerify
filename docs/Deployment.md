# Deployment Guide — Zerify

## 1. Environment Variables

### Backend (`apps/backend/.env`)

#### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `<random-secret>` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://zerify.app` |

#### Cloudinary
| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

#### Social OAuth (Meta/Instagram)
| Variable | Description |
|----------|-------------|
| `META_APP_ID` | Meta/Facebook app ID |
| `META_APP_SECRET` | Meta/Facebook app secret |
| `META_CONFIG_ID` | Facebook Login for Business config |
| `META_API_VERSION` | Graph API version (e.g., `v19.0`) |
| `META_GRAPH_URL` | Graph API base URL |
| `INSTAGRAM_GRAPH_URL` | Instagram Graph API URL |
| `META_REDIRECT_URI` | Meta OAuth redirect URI |
| `META_WEBHOOK_URL` | Meta webhook URL |
| `META_WEBHOOK_VERIFY_TOKEN` | Webhook verification token |

#### Social OAuth (Instagram Direct)
| Variable | Description |
|----------|-------------|
| `INSTAGRAM_APP_ID` | Instagram OAuth app ID |
| `INSTAGRAM_APP_SECRET` | Instagram OAuth secret |
| `INSTAGRAM_REDIRECT_URI` | Instagram OAuth redirect |

#### Social OAuth (YouTube)
| Variable | Description |
|----------|-------------|
| `YOUTUBE_CLIENT_ID` | YouTube OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth client secret |
| `YOUTUBE_REDIRECT_URI` | YouTube OAuth redirect |
| `YOUTUBE_API_KEY` | YouTube Data API key |

#### Social OAuth (LinkedIn)
| Variable | Description |
|----------|-------------|
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth secret |
| `LINKEDIN_REDIRECT_URI` | LinkedIn OAuth redirect |
| `LINKEDIN_SCOPES` | LinkedIn OAuth scopes |

#### Social OAuth (X/Twitter)
| Variable | Description |
|----------|-------------|
| `X_CLIENT_ID` | X/Twitter OAuth client ID |
| `X_CLIENT_SECRET` | X/Twitter OAuth secret |
| `X_REDIRECT_URI` | X OAuth redirect |
| `X_SCOPES` | X OAuth scopes |
| `X_AUTH_URL` | X authorization URL |
| `X_TOKEN_URL` | X token exchange URL |
| `X_API_BASE_URL` | X API base URL |

#### Social OAuth (Threads)
| Variable | Description |
|----------|-------------|
| `THREADS_CLIENT_ID` | Threads OAuth client ID |
| `THREADS_CLIENT_SECRET` | Threads OAuth secret |
| `THREADS_REDIRECT_URI` | Threads OAuth redirect |
| `THREADS_SCOPES` | Threads OAuth scopes |

#### Security
| Variable | Description |
|----------|-------------|
| `SOCIAL_ENCRYPTION_SECRET` | AES-256-GCM key for OAuth token encryption |

#### Payment (Cashfree)
| Variable | Description |
|----------|-------------|
| `CASHFREE_CLIENT_ID` | Cashfree client ID |
| `CASHFREE_CLIENT_SECRET` | Cashfree client secret |
| `CASHFREE_ENVIRONMENT` | `sandbox` or `production` |
| `CASHFREE_API_VERSION` | API version |
| `CASHFREE_WEBHOOK_SECRET` | Webhook signature secret |
| `CASHFREE_RETURN_URL` | Payment return URL |
| `CASHFREE_WEBHOOK_URL` | Webhook endpoint URL |

### Frontend (`apps/frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |

---

## 2. Backend Deployment

### Build
```bash
cd apps/backend
npm install
npx prisma generate
npx nest build
```

### Start
```bash
# Production
node dist/main.js

# Or with PM2
pm2 start dist/main.js --name zerify-api
```

### Database Migration
```bash
# Development
npx prisma migrate dev --name description

# Production (apply pending migrations)
npx prisma migrate deploy
```

### Health Check
```
GET /api/v1/health
Response: { "status": "ok", "service": "zerify-api", "timestamp": "..." }
```

---

## 3. Frontend Deployment

### Build
```bash
cd apps/frontend
npm install
npm run build
```

### Start
```bash
# Production
npm start

# Or with PM2
pm2 start npm --name zerify-web -- start
```

### Environment
Ensure `NEXT_PUBLIC_API_URL` points to your production backend URL.

---

## 4. Docker (Recommended)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/prisma ./prisma
RUN npx prisma generate
COPY apps/backend ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "4000:4000"
    env_file:
      - apps/backend/.env
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000/api/v1

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: zerify
      POSTGRES_USER: zerify
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

---

## 5. Production Checklist

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] `JWT_SECRET` is a strong random string (min 32 chars)
- [ ] CORS restricted to production frontend URL
- [ ] `helmet()` middleware enabled
- [ ] `express-rate-limit` enabled on auth endpoints
- [ ] `forbidNonWhitelisted: true` in ValidationPipe
- [ ] `.env` not committed to version control
- [ ] HTTPS enabled (via reverse proxy)

### Database
- [ ] Production database URL uses SSL (`sslmode=require`)
- [ ] All migrations applied (`prisma migrate deploy`)
- [ ] Database backups configured
- [ ] Connection pooling enabled (Neon handles this)

### Payments
- [ ] Cashfree environment set to `production`
- [ ] Webhook URL accessible from Cashfree servers
- [ ] Webhook signature verification enabled
- [ ] Idempotency keys used for all mutations

### Monitoring
- [ ] Application logs configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Database monitoring
- [ ] Payment webhook monitoring

### Performance
- [ ] Static assets cached (Next.js `_next/static`)
- [ ] API response caching where appropriate
- [ ] Database query optimization (indexes, no N+1)
- [ ] Image optimization (Cloudinary transformations)

---

## 6. Reverse Proxy (Nginx)

### Backend
```nginx
server {
    listen 443 ssl http2;
    server_name api.zerify.app;

    ssl_certificate /etc/letsencrypt/live/api.zerify.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.zerify.app/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend
```nginx
server {
    listen 443 ssl http2;
    server_name zerify.app;

    ssl_certificate /etc/letsencrypt/live/zerify.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zerify.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 7. Scaling Considerations

### Current Architecture
- **Single-server**: Backend and frontend on same machine
- **Serverless DB**: Neon PostgreSQL with auto-scaling
- **CDN**: Cloudinary for static assets and images

### Scaling Path
1. **Horizontal scaling**: Add load balancer + multiple backend instances
2. **Session store**: Redis for WebSocket session affinity
3. **Queue system**: BullMQ (installed) for background jobs
4. **Cache layer**: Redis for frequently accessed data
5. **Microservices**: Split payment/messaging into separate services

### Database Scaling
- Neon handles connection pooling automatically
- Monitor query performance with `EXPLAIN ANALYZE`
- Add indexes for new query patterns
- Consider read replicas for analytics queries

---

## 8. Backup & Recovery

### Database Backups
- Neon provides automatic backups
- Configure point-in-time recovery (PITR)
- Test restore procedure regularly

### Application Backups
- Version control (Git) for all code
- Environment variables in secure vault
- Cloudinary assets are CDN-backed (no backup needed)

### Recovery Steps
1. Restore database from backup
2. Deploy application code
3. Set environment variables
4. Run migrations if needed
5. Verify health check endpoint
6. Test critical flows (auth, payment, messaging)

---

## 9. Monitoring & Alerting

### Key Metrics to Monitor
- **API response time**: p50, p95, p99
- **Error rate**: 4xx, 5xx responses
- **Database connections**: Active connections, pool usage
- **Payment success rate**: Successful vs failed transactions
- **WebSocket connections**: Active connections, message throughput
- **Memory usage**: Node.js heap usage

### Recommended Tools
- **APM**: New Relic, Datadog, or Sentry
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, LogDNA
- **Errors**: Sentry

---

## 10. CI/CD Pipeline

### Recommended Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to production
        run: # Your deployment command
```

### Deployment Steps
1. Push to `main` branch
2. CI runs tests
3. Build artifacts
4. Deploy to staging
5. Run integration tests
6. Deploy to production
7. Monitor health checks
