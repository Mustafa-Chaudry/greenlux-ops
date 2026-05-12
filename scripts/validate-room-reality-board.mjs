import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const pagePath = join(root, "src/app/admin/occupancy/page.tsx");
const snapshotPath = join(root, "src/lib/occupancy/snapshot.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("room reality board renders the required staff-facing states", () => {
  const source = sourceAt(pagePath, "src/app/admin/occupancy/page.tsx");

  for (const label of [
    "Room Reality Board",
    "Room Reality Card",
    "Ready for guest",
    "Guest:",
    "Arriving today",
    "Departing today",
    "Payment pending",
    "ID pending",
    "Maintenance active",
    "Cleaning required",
    "Outstanding balance",
  ]) {
    assert.match(source, new RegExp(label), `${label} label missing`);
  }
});

test("room reality board keeps existing operational paths and data source", () => {
  const source = sourceAt(pagePath, "src/app/admin/occupancy/page.tsx");

  assert.match(source, /fetchOccupancySnapshot/, "must reuse occupancy snapshot");
  assert.match(source, /snapshot\.units/, "must render rooms from the live occupancy snapshot");
  assert.match(source, /snapshot\.summary\.totalUnits/, "must expose the live room count");
  assert.match(source, /`\/admin\/guest-records\/\$\{stay\.id\}`/, "current or upcoming stays must link to guest records");

  for (const href of ["/admin/guest-records/", "/admin/maintenance", "/admin/occupancy"]) {
    assert.match(source, new RegExp(href.replaceAll("/", "\\/")), `${href} link missing`);
  }

  assert.doesNotMatch(source, /seed|fake|mock/i, "must not use fake room data");
});

test("room reality board has explicit priority sorting and snapshot turnover signals", () => {
  const pageSource = sourceAt(pagePath, "src/app/admin/occupancy/page.tsx");
  const snapshotSource = sourceAt(snapshotPath, "src/lib/occupancy/snapshot.ts");

  assert.match(pageSource, /roomRealityPriority/, "must sort rooms by operational urgency");
  assert.match(pageSource, /roomRealityCards/, "must build a card model before rendering");
  assert.match(snapshotSource, /turnoverNeeded/, "snapshot must expose cleaning or turnover inference");
  assert.match(snapshotSource, /arrivalToday/, "snapshot must expose arrivals today");
  assert.match(snapshotSource, /departureToday/, "snapshot must expose departures today");
});
