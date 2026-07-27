#!/usr/bin/env bash
# scripts/validate-skills.sh — validates all SKILL.md files against the Agent Skills standard
# (https://agentskills.io/)
#
# Required fields:
#   - name (kebab-case, unique)
#   - description (50-1024 chars)
#
# Usage: bash scripts/validate-skills.sh [path]
# If no path given, validates the entire repo.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
START_PATH="${1:-$ROOT_DIR}"

# Use Node.js for reliable YAML frontmatter parsing (no yq/python3 dep needed)
node -e "
const fs = require('fs');
const path = require('path');

const startPath = process.argv[1];
const rootDir = process.argv[2];

function findSkillFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'source' || entry.name === '.git') continue;
      results.push(...findSkillFiles(full));
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      results.push(full);
    }
  }
  return results;
}

const skillFiles = findSkillFiles(startPath);
const seen = new Map();
let ok = 0;
let failed = 0;

for (const file of skillFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);

  // Parse YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.log('FAIL ' + relPath + ' — no YAML frontmatter');
    failed++;
    continue;
  }

  const fm = fmMatch[1];

  // Extract name
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract description (single-line or multi-line with |)
  let desc = '';
  const descSingleMatch = fm.match(/^description:\s*(.+)$/m);
  if (descSingleMatch) {
    desc = descSingleMatch[1].trim();
  } else {
    // Multi-line: description: | then indented lines
    const descBlockMatch = fm.match(/^description:\s*\|\s*\n((?:[ ]+.+\n?)+)/m);
    if (descBlockMatch) {
      desc = descBlockMatch[1].split('\n').map(l => l.trim()).filter(Boolean).join(' ');
    }
  }

  const issues = [];

  if (!name) {
    issues.push('missing name');
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    issues.push('name not kebab-case: ' + name);
  } else if (seen.has(name)) {
    issues.push('duplicate name (first seen: ' + seen.get(name) + ')');
  }
  seen.set(name, relPath);

  if (!desc) {
    issues.push('missing description');
  } else {
    const descLen = desc.length;
    if (descLen < 50) issues.push('description too short (' + descLen + ' < 50 chars)');
    if (descLen > 1024) issues.push('description too long (' + descLen + ' > 1024 chars)');
  }

  if (issues.length === 0) {
    console.log('PASS ' + relPath + ' (name=' + name + ', desc=' + desc.length + ' chars)');
    ok++;
  } else {
    console.log('FAIL ' + relPath + ' — ' + issues.join('; '));
    failed++;
  }
}

console.log('');
console.log(ok + '/' + (ok + failed) + ' SKILL.md files valid');
if (failed > 0) {
  process.exit(1);
}
" "$START_PATH" "$ROOT_DIR"