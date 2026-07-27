import { describe, expect, it } from 'vitest';
import { toAcpSpawnCommand } from './acp-runtime-spawn';

describe('toAcpSpawnCommand', () => {
  it.each([
    '.js',
    '.mjs',
    '.cjs',
  ])('runs a %s package bin through the current Node binary', (extension) => {
    const binaryPath = `/pkg/dist/index${extension}`;

    expect(toAcpSpawnCommand(binaryPath)).toEqual({
      command: process.execPath,
      args: [binaryPath],
      commandLabel: `${process.execPath} ${binaryPath}`,
    });
  });

  // Windows CreateProcess cannot execute a shebang script, so spawning the bin
  // path directly throws `spawn UNKNOWN` and no ACP adapter ever starts.
  it('does not spawn a Windows-style .js bin path directly', () => {
    const binaryPath = String.raw`C:\pkg\node_modules\@scope\agent-acp\dist\index.js`;

    expect(toAcpSpawnCommand(binaryPath).command).toBe(process.execPath);
    expect(toAcpSpawnCommand(binaryPath).args).toEqual([binaryPath]);
  });

  it('matches script extensions case-insensitively', () => {
    expect(toAcpSpawnCommand('/pkg/dist/INDEX.JS').command).toBe(process.execPath);
  });

  it('keeps a real executable as the command', () => {
    expect(toAcpSpawnCommand('/usr/local/bin/agent-acp')).toEqual({
      command: '/usr/local/bin/agent-acp',
      args: [],
      commandLabel: '/usr/local/bin/agent-acp',
    });
  });

  it('appends extra args after a node script path', () => {
    expect(toAcpSpawnCommand('/pkg/cli.mjs', ['internal', 'adapter'])).toEqual({
      command: process.execPath,
      args: ['/pkg/cli.mjs', 'internal', 'adapter'],
      commandLabel: `${process.execPath} /pkg/cli.mjs internal adapter`,
    });
  });

  it('appends extra args after a plain executable', () => {
    expect(toAcpSpawnCommand('agent-acp', ['--stdio'])).toEqual({
      command: 'agent-acp',
      args: ['--stdio'],
      commandLabel: 'agent-acp --stdio',
    });
  });
});
