import Sentry from '@sentry/serverless';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sanityClient from '../../config/utils/sanityClient.js';
import { getCommitRef, isProduction } from '../../config/functions/index.js';

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV,
  release: `the-number-ninja@${getCommitRef()}`,
  beforeSend(event) {
    if (!isProduction()) {
      return null;
    }
    return event;
  },
  tracesSampleRate: 1.0,
});

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.js', '.vbs', '.vbe', '.jse', '.ws', '.wsf', '.ps1',
  '.sh', '.bash',
  '.jar', '.jnlp',
  '.php', '.asp', '.aspx', '.jsp', '.hta',
  '.lnk', '.url',
  '.reg',
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isBlockedExtension(extension) {
  return BLOCKED_EXTENSIONS.includes(extension.toLowerCase());
}

export function isValidUUID(str) {
  return UUID_REGEX.test(str);
}

export function getExtension(filename) {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
}

export function validateRequest(body) {
  const { clientId, batchId, filename, contentType } = body;

  if (!clientId) {
    return { valid: false, error: 'Missing required field: clientId' };
  }

  if (!batchId) {
    return { valid: false, error: 'Missing required field: batchId' };
  }

  if (!isValidUUID(batchId)) {
    return { valid: false, error: 'Invalid batch ID format' };
  }

  if (!filename) {
    return { valid: false, error: 'Missing required field: filename' };
  }

  if (!contentType) {
    return { valid: false, error: 'Missing required field: contentType' };
  }

  const extension = getExtension(filename);
  if (isBlockedExtension(extension)) {
    return { valid: false, error: `File type not allowed: ${extension}` };
  }

  return { valid: true };
}

async function getClientByClientId(clientId) {
  const filter = `*[
    _type == "client" &&
    !(_id in path("drafts.**")) &&
    clientId == $clientId
  ][0] { name }`;

  return sanityClient.fetch(filter, { clientId });
}

function respond(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
    headers: { 'Content-Type': 'application/json' },
  };
}

export const handler = Sentry.AWSLambda.wrapHandler(async function (event) {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return respond(400, { error: 'Invalid JSON body' });
  }

  const validation = validateRequest(body);
  if (!validation.valid) {
    return respond(400, { error: validation.error });
  }

  const { clientId, batchId, filename, contentType, note } = body;

  let client;
  try {
    client = await getClientByClientId(clientId);
  } catch (err) {
    console.error('Sanity error:', err);
    Sentry.captureException(err);
    return respond(500, { error: 'Unable to verify client' });
  }

  if (!client) {
    return respond(404, { error: 'Client not found' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const sanitizedClientName = client.name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const s3Key = `${sanitizedClientName}/${today}-${batchId}/${filename}`;

  const s3Client = new S3Client({
    region: process.env.S3_UPLOAD_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const metadata = {
    'original-name': filename,
    'client-name': client.name,
  };

  if (note) {
    metadata.note = Buffer.from(note).toString('base64');
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_UPLOAD_BUCKET,
    Key: s3Key,
    ContentType: contentType,
    Metadata: metadata,
  });

  let signedUrl;
  try {
    signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  } catch (err) {
    console.error('S3 signing error:', err);
    Sentry.captureException(err);
    return respond(500, { error: 'Unable to generate upload URL' });
  }

  return respond(200, {
    url: signedUrl,
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
  });
});
