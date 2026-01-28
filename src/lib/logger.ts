import * as winston from 'winston';
import * as path from 'path';

// Only run on server side
const isServer = typeof window === 'undefined';

// Logger configuration
const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');
const logLevel = process.env.LOG_LEVEL || 'info';
const maxFiles = process.env.LOG_MAX_FILES || '30d';
const maxSize = process.env.LOG_MAX_SIZE || '20m';

// Custom format for console output (colorized)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
  }),
);

// Custom format for file output (JSON for parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create transports array dynamically
function createTransports(): winston.transport[] {
  const transportsList: winston.transport[] = [];

  if (!isServer) {
    return transportsList;
  }

  // Console transport (always active)
  transportsList.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );

  // File transports (only on server) - dynamically import
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DailyRotateFile = require('winston-daily-rotate-file');
    
    transportsList.push(
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'frontend-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: maxSize,
        maxFiles: maxFiles,
        format: fileFormat,
      })
    );

    transportsList.push(
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'frontend-error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: maxSize,
        maxFiles: maxFiles,
        level: 'error',
        format: fileFormat,
      })
    );
  } catch {
    console.warn('winston-daily-rotate-file not available, using console only');
  }

  return transportsList;
}

// Create logger instance
const transports = createTransports();
const winstonLogger = isServer && transports.length > 0
  ? winston.createLogger({
      level: logLevel,
      defaultMeta: { service: 'awnash-frontend' },
      transports,
    })
  : null;

// Logger interface that works on both client and server
export interface Logger {
  log: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  http: (message: string, meta?: Record<string, unknown>) => void;
}

// Context-aware logger factory
function createLogger(context?: string): Logger {
  const addContext = (meta?: Record<string, unknown>) => ({
    context,
    ...meta,
  });

  if (isServer && winstonLogger) {
    return {
      log: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.info(message, addContext(meta));
      },
      info: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.info(message, addContext(meta));
      },
      warn: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.warn(message, addContext(meta));
      },
      error: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.error(message, addContext(meta));
      },
      debug: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.debug(message, addContext(meta));
      },
      http: (message: string, meta?: Record<string, unknown>) => {
        winstonLogger.http(message, addContext(meta));
      },
    };
  }

  // Client-side fallback using console
  const formatMessage = (level: string, message: string, meta?: Record<string, unknown>) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${contextStr} ${message}${metaStr}`;
  };

  return {
    log: (message: string, meta?: Record<string, unknown>) => {
      console.log(formatMessage('info', message, meta));
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      console.info(formatMessage('info', message, meta));
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn(formatMessage('warn', message, meta));
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      console.error(formatMessage('error', message, meta));
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      console.debug(formatMessage('debug', message, meta));
    },
    http: (message: string, meta?: Record<string, unknown>) => {
      console.log(formatMessage('http', message, meta));
    },
  };
}

// Default logger instance
export const logger = createLogger();

// Export factory function for context-aware loggers
export function getLogger(context?: string): Logger {
  return createLogger(context);
}

// Export for API routes to log requests
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  meta?: Record<string, unknown>
) {
  const apiLogger = createLogger('API');
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  const message = `${method} ${path} ${statusCode} ${duration}ms`;
  
  if (level === 'error') {
    apiLogger.error(message, meta);
  } else if (level === 'warn') {
    apiLogger.warn(message, meta);
  } else {
    apiLogger.http(message, meta);
  }
}
