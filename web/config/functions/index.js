import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

function isProduction() {
  return process.env.ENV === 'production';
}

function generateDummyEmail(email) {
  const hasher = crypto.createHmac('md5', '0041015581');
  const prefix = hasher.update(email).digest('hex');
  return `${prefix}@thenumber.ninja`;
}

function getCommitRef() {
  try {
    // Try different possible locations for build.json
    const possiblePaths = [
      './build.json',
      '../build.json',
      '../../build.json',
      process.cwd() + '/build.json',
    ];

    for (const path of possiblePaths) {
      try {
        const buildInformation = JSON.parse(readFileSync(path, 'utf8'));
        if ('commitRef' in buildInformation) {
          return buildInformation['commitRef'];
        }
      } catch (_e) {
        // Try next path
        continue;
      }
    }
  } catch (_e) {
    // All paths failed
  }

  console.warn(
    'No commit reference found for this function. This is fine if we are running the code locally.'
  );
  return 'unknown';
}

export { generateDummyEmail, getCommitRef, isProduction };
