import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(repoRoot, "docs/post-detail/stages/stage4/data/validation-targets.json");
const defaultReportPath = path.join(repoRoot, "output/post-detail-stage4-live-validation.json");

function option(name, fallback = "") {
  const prefix = `--${name}=`;
  const value = process.argv.find((entry) => entry.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function normalizeBaseUrl(value) {
  const parsed = new URL(value);
  return parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
}

function targetUrl(baseUrl, permalink) {
  return new URL(String(permalink).replace(/^\//u, ""), baseUrl).href;
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/giu, "")
    .replace(/<style\b[\s\S]*?<\/style>/giu, "")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function htmlIds(html) {
  return new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/giu)].map((match) => match[1]));
}

function fragmentTargets(html) {
  const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']#([^"']+)["'][^>]*>/giu)]
    .map((match) => match[1])
    .filter(Boolean);
  return [...new Set(links)];
}

function decodeFragment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "JungH200000-stage4-validator/1.0" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateTarget(target, baseUrl, timeoutMs) {
  const url = targetUrl(baseUrl, target.permalink);
  const errors = [];
  const warnings = [];
  let status = 0;
  let finalUrl = url;

  try {
    const response = await fetchWithTimeout(url, timeoutMs);
    status = response.status;
    finalUrl = response.url;
    const html = await response.text();

    if (!response.ok) errors.push(`HTTP ${response.status}`);
    if (!/\blayout--single-editorial\b/u.test(html)) errors.push("layout--single-editorial class missing");
    if (!/<main\b[^>]*\bclass\s*=\s*["'][^"']*\beditorial-post\b/iu.test(html)) errors.push("editorial-post main missing");
    if (!/<section\b[^>]*\bclass\s*=\s*["'][^"']*\beditorial-prose\b/iu.test(html)) errors.push("editorial-prose body missing");

    const pageTitle = html.match(/<h1\b[^>]*\bid\s*=\s*["']page-title["'][^>]*>([\s\S]*?)<\/h1>/iu);
    if (!pageTitle || stripTags(pageTitle[1]).length === 0) errors.push("page title missing or empty");

    if (target.toc) {
      if (!/\beditorial-post__toc\b/u.test(html)) errors.push("desktop TOC missing");
      if (!/\beditorial-post__toc-mobile\b/u.test(html)) errors.push("mobile TOC missing");
      const ids = htmlIds(html);
      const missingFragmentTargets = fragmentTargets(html).filter((fragment) => {
        const decoded = decodeFragment(fragment);
        return !ids.has(fragment) && !ids.has(decoded);
      });
      if (missingFragmentTargets.length > 0) {
        warnings.push(`Fragment targets not found: ${missingFragmentTargets.slice(0, 5).join(", ")}`);
      }
    }

    if (/Liquid error|Jekyll::Errors|Build Warning:/iu.test(html)) errors.push("build error text found in HTML");
  } catch (error) {
    errors.push(error?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : String(error?.message ?? error));
  }

  return {
    scope: target.scope,
    file: target.file,
    permalink: target.permalink,
    requestedUrl: url,
    finalUrl,
    status,
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

async function mapWithConcurrency(values, concurrency, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, run));
  return results;
}

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const baseUrl = normalizeBaseUrl(option("base-url", manifest.siteUrl));
const scope = option("scope", "all");
const concurrency = Number(option("concurrency", "8"));
const timeoutMs = Number(option("timeout-ms", "15000"));
const reportPath = path.resolve(repoRoot, option("report", path.relative(repoRoot, defaultReportPath)));

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) throw new Error("concurrency must be an integer from 1 to 20");
if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) throw new Error("timeout-ms must be an integer of at least 1000");
const availableScopes = [...new Set(manifest.targets.map((target) => target.scope))];
if (scope !== "all" && !availableScopes.includes(scope)) {
  throw new Error(`scope must be all or one of: ${availableScopes.join(", ")}`);
}

const targets = scope === "all" ? manifest.targets : manifest.targets.filter((target) => target.scope === scope);
if (targets.length === 0) throw new Error(`No validation targets for scope: ${scope}`);

const startedAt = new Date().toISOString();
const results = await mapWithConcurrency(targets, concurrency, (target) => validateTarget(target, baseUrl, timeoutMs));
const failed = results.filter((result) => !result.passed);
const warned = results.filter((result) => result.warnings.length > 0);
const report = {
  schemaVersion: 1,
  startedAt,
  finishedAt: new Date().toISOString(),
  baseUrl,
  scope,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  warned: warned.length,
  results,
};

if (!hasFlag("no-report")) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({
  baseUrl,
  scope,
  total: report.total,
  passed: report.passed,
  failed: report.failed,
  warned: report.warned,
  reportPath: hasFlag("no-report") ? null : reportPath,
  failures: failed.slice(0, 20).map((result) => ({ url: result.requestedUrl, errors: result.errors })),
}, null, 2));

if (failed.length > 0) process.exitCode = 1;
