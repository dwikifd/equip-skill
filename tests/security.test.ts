import assert from 'node:assert';
import { cloneRepo } from '../src/git.js';
import { tmpdir } from 'os';
import { join } from 'path';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
  Promise.resolve().then(async () => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.log(`✗ ${name}`);
      console.error(`  ${(err as Error).message}`);
      failed++;
    }
  });
}

// Security Tests

test('Argument Injection: URL starting with dash throws', async () => {
    try {
        await cloneRepo('-oProxyCommand=calc.exe');
        throw new Error('Should have thrown error');
    } catch (e) {
        assert.match((e as Error).message, /Invalid git URL/);
    }
});

test('Argument Injection: Ref starting with dash throws', async () => {
    try {
        await cloneRepo('https://github.com/owner/repo', '--upload-pack=touch /tmp/pwned');
        throw new Error('Should have thrown error');
    } catch (e) {
        assert.match((e as Error).message, /Invalid git ref/);
    }
});

// We can't easily test symlink skipping here without mocking or real git operations,
// but we verified it with manual reproduction script previously.

// Summary logic needs to wait for async tests
setTimeout(() => {
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}, 1000);
