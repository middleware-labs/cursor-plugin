#!/usr/bin/env node
// Structural checks for this single-plugin repository, based on the Cursor
// plugin submission checklist (https://cursor.com/docs/reference/plugins).
// Run from the repository root: node scripts/validate.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const errors = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const kebabPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const sharedReference = path.join("references", "mcp-settings.md");

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readJson(relative) {
  let raw;
  try {
    raw = await fs.readFile(path.join(root, relative), "utf8");
  } catch {
    errors.push(`${relative} is missing`);
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relative} is not valid JSON: ${error.message}`);
    return null;
  }
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return null;
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return null;
  }
  const fields = {};
  for (const line of normalized.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator > 0 && !line.startsWith(" ")) {
      fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
  }
  return fields;
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return normalized !== ".." && !normalized.startsWith("../");
}

async function validateManifest() {
  const manifest = await readJson(".cursor-plugin/plugin.json");
  if (!manifest) {
    return null;
  }
  if (typeof manifest.name !== "string" || !pluginNamePattern.test(manifest.name)) {
    errors.push('plugin.json "name" must be lowercase kebab-case (alphanumerics, hyphens, periods)');
  }
  if (typeof manifest.version !== "string" || !semverPattern.test(manifest.version)) {
    errors.push('plugin.json "version" must be a semantic version such as 1.0.0');
  }
  if (typeof manifest.description !== "string" || manifest.description.length === 0) {
    errors.push('plugin.json "description" is required for marketplace submission');
  }
  for (const field of ["logo", "rules", "agents", "skills", "commands", "hooks", "mcpServers"]) {
    const value = manifest[field];
    const paths = typeof value === "string" ? [value] : Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
    for (const entry of paths) {
      if (/^https?:\/\//.test(entry)) {
        continue;
      }
      if (!isSafeRelativePath(entry)) {
        errors.push(`plugin.json "${field}" path "${entry}" must be relative without ".."`);
      } else if (!(await exists(path.join(root, entry)))) {
        errors.push(`plugin.json "${field}" references missing path "${entry}"`);
      }
    }
  }
  return manifest;
}

async function validateMcp(manifest) {
  const mcpPath = typeof manifest?.mcpServers === "string" ? manifest.mcpServers : "mcp.json";
  const mcp = await readJson(mcpPath);
  if (!mcp) {
    return;
  }
  const servers = mcp.mcpServers;
  if (!servers || typeof servers !== "object" || Object.keys(servers).length === 0) {
    errors.push(`${mcpPath} must define at least one server under "mcpServers"`);
    return;
  }
  for (const [name, server] of Object.entries(servers)) {
    if (typeof server.url !== "string" || !server.url.startsWith("https://")) {
      errors.push(`${mcpPath}: server "${name}" must have an https "url"`);
      continue;
    }
    const url = new URL(server.url);
    if (url.searchParams.has("exclude_tools") && url.searchParams.get("exclude_tools") === "") {
      errors.push(`${mcpPath}: server "${name}" has an empty exclude_tools parameter; remove it instead`);
    }
  }
  // Every ${VAR} placeholder must be declared in the manifest's variables schema.
  const declared = new Set(Object.keys(manifest?.variables?.properties ?? {}));
  const placeholders = JSON.stringify(mcp).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-[^}]*)?\}/g);
  for (const [, variable] of placeholders) {
    if (!["CURSOR_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"].includes(variable) && !declared.has(variable)) {
      errors.push(`${mcpPath} uses \${${variable}} but plugin.json "variables" does not declare it`);
    }
  }
}

async function validateSkills() {
  const skillsDir = path.join(root, "skills");
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const references = new Map();
  for (const entry of entries.filter((e) => e.isDirectory())) {
    const skillDir = path.join(skillsDir, entry.name);
    const skillFile = path.join("skills", entry.name, "SKILL.md");
    if (!(await exists(path.join(root, skillFile)))) {
      errors.push(`${skillFile} is missing`);
      continue;
    }
    const frontmatter = parseFrontmatter(await fs.readFile(path.join(root, skillFile), "utf8"));
    if (!frontmatter) {
      errors.push(`${skillFile} is missing YAML frontmatter`);
      continue;
    }
    if (!frontmatter.name || !kebabPattern.test(frontmatter.name)) {
      errors.push(`${skillFile} "name" must be lowercase kebab-case`);
    } else if (frontmatter.name !== entry.name) {
      errors.push(`${skillFile} "name" (${frontmatter.name}) must match its directory (${entry.name})`);
    }
    if (!frontmatter.description) {
      errors.push(`${skillFile} is missing "description"`);
    }
    const referencePath = path.join(skillDir, sharedReference);
    if (await exists(referencePath)) {
      references.set(entry.name, await fs.readFile(referencePath, "utf8"));
    }
  }
  // The shared reference is copied into each skill; the copies must not drift.
  const distinct = new Set(references.values());
  if (distinct.size > 1) {
    errors.push(`skills/*/${sharedReference} copies differ (${[...references.keys()].join(", ")}); keep them identical`);
  }
}

async function main() {
  const manifest = await validateManifest();
  await validateMcp(manifest);
  await validateSkills();
  if (!(await exists(path.join(root, "README.md")))) {
    errors.push("README.md is missing");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log("Validation passed.");
}

await main();
