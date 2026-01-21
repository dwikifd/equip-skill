import simpleGit from 'simple-git';
import { join, normalize, resolve, sep } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';

/**
 * Validates that a git URL or path does not look like a command line flag.
 * @param url The URL or path to validate
 * @throws Error if the URL is invalid or unsafe
 */
function validateGitUrl(url: string): void {
  if (url.startsWith('-')) {
    throw new Error(`Invalid git URL: ${url}. URLs cannot start with a dash.`);
  }
}

/**
 * Validates that a git ref (branch/tag) does not look like a command line flag.
 * @param ref The ref to validate
 * @throws Error if the ref is invalid or unsafe
 */
function validateGitRef(ref: string): void {
  if (ref.startsWith('-')) {
    throw new Error(`Invalid git ref: ${ref}. Refs cannot start with a dash.`);
  }
}

export async function cloneRepo(url: string, ref?: string): Promise<string> {
  validateGitUrl(url);
  if (ref) {
    validateGitRef(ref);
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'add-skill-'));
  const git = simpleGit();
  const cloneOptions = ref
    ? ['--depth', '1', '--branch', ref]
    : ['--depth', '1'];

  // simple-git handles argument escaping, but we've validated inputs above
  // to ensure they aren't interpreted as flags.
  await git.clone(url, tempDir, cloneOptions);
  return tempDir;
}

export async function cleanupTempDir(dir: string): Promise<void> {
  // Validate that the directory path is within tmpdir to prevent deletion of arbitrary paths
  const normalizedDir = normalize(resolve(dir));
  const normalizedTmpDir = normalize(resolve(tmpdir()));

  if (!normalizedDir.startsWith(normalizedTmpDir + sep) && normalizedDir !== normalizedTmpDir) {
    throw new Error('Attempted to clean up directory outside of temp directory');
  }

  await rm(dir, { recursive: true, force: true });
}
