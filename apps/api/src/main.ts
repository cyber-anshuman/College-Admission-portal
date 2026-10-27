import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { AppModule } from './app.module';

export function validateConfig() {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const nodeEnv = process.env.NODE_ENV;
  let trustProxy = process.env.TRUST_PROXY;

  const PLACEHOLDER_JWT = 'super_secret_admission_jwt_key_2026_change_in_production';
  const PLACEHOLDER_REFRESH = 'super_secret_admission_refresh_key_2026_change_in_production';

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables are both required.');
  }

  if (jwtSecret.length < 32) {
    throw new Error(`FATAL: JWT_SECRET must be at least 32 characters long (got ${jwtSecret.length}).`);
  }

  if (jwtRefreshSecret.length < 32) {
    throw new Error(`FATAL: JWT_REFRESH_SECRET must be at least 32 characters long (got ${jwtRefreshSecret.length}).`);
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be distinct, separate secrets.');
  }

  if (nodeEnv === 'production') {
    if (jwtSecret === PLACEHOLDER_JWT || jwtRefreshSecret === PLACEHOLDER_REFRESH) {
      throw new Error('FATAL: Cannot use .env.example placeholder secrets in production environment.');
    }
    if (!trustProxy) {
      if (process.env.VERCEL) {
        process.env.TRUST_PROXY = '1';
        trustProxy = '1';
      } else {
        throw new Error('FATAL: TRUST_PROXY environment variable is required in production.');
      }
    }
  }

  if (trustProxy === 'true') {
    throw new Error('FATAL: TRUST_PROXY cannot be "true". Specify a hop count (e.g. 1 or 2) or CIDR list to prevent IP spoofing.');
  }
}

export async function createNestApp(expressInstance?: Express): Promise<INestApplication> {
  validateConfig();

  const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = corsOriginEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const nestOptions = {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.startsWith('http://localhost:')
        ) {
          return callback(null, true);
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
  };

  const app = expressInstance
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressInstance), nestOptions)
    : await NestFactory.create(AppModule, nestOptions);

  const trustProxyEnv = process.env.TRUST_PROXY;
  if (trustProxyEnv) {
    const val = !isNaN(Number(trustProxyEnv)) ? Number(trustProxyEnv) : trustProxyEnv;
    (app.getHttpAdapter().getInstance() as any).set('trust proxy', val);
  }

  // Cookie parser middleware
  app.use(cookieParser());

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });

  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof (httpAdapter.getInstance() as any)?.get === 'function') {
    (httpAdapter.getInstance() as any).get('/', (_req: any, res: any) => {
      res.json({
        name: 'Lamrin Tech Skills University Punjab Admissions Management API',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: `/${apiPrefix}/health/live`,
          readiness: `/${apiPrefix}/health/ready`,
          docs: `/${apiPrefix}/docs`,
        },
      });
    });
  }

  // Helmet with selective Swagger CSP relaxation
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || !isProduction;

  const standardHelmet = helmet();
  const docsHelmet = helmet({ contentSecurityPolicy: false });

  app.use((req: any, res: any, next: any) => {
    if (enableSwagger && req.path?.startsWith(`/${apiPrefix}/docs`)) {
      return docsHelmet(req, res, next);
    }
    return standardHelmet(req, res, next);
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI specification
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('College Admission Management System API')
      .setDescription(
        'REST API for admissions workflow: authentication, student registry, quota allocation, document verification, payments and audit.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Admission System API Docs',
    });
  }

  return app;
}

let cachedServer: Express | null = null;

// Vercel Serverless Function entrypoint
export default async function handler(req: any, res: any) {
  try {
    if (!cachedServer) {
      const expressApp = express();
      const app = await createNestApp(expressApp);
      await app.init();
      cachedServer = expressApp;
    }
    return (cachedServer as any)(req, res);
  } catch (err: any) {
    console.error('SERVERLESS HANDLER INITIALIZATION ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        error: 'SERVERLESS_INITIALIZATION_ERROR',
        message: err.message || String(err),
      });
    }
  }
}

// Standalone server bootstrap for local development
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createNestApp();
  const port = parseInt(process.env.PORT || '4000', 10);
  const apiPrefix = process.env.API_PREFIX || 'api';

  await app.listen(port);

  logger.log(`🚀 API Server running on: http://localhost:${port}/${apiPrefix}`);
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || !isProduction;
  if (enableSwagger) {
    logger.log(`📚 OpenAPI Docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  }
}

// Only invoke standalone bootstrap when NOT running on Vercel Serverless and NOT in unit tests
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  bootstrap();
}

