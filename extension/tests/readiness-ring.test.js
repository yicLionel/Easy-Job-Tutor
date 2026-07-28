import test from "node:test";
import assert from "node:assert/strict";
import { readinessTone } from "../src/sidepanel/readiness-ring.js";

test("readiness ring uses the requested score bands", () => {
  assert.equal(readinessTone(70).className, "good");
  assert.equal(readinessTone(69).className, "mid");
  assert.equal(readinessTone(41).className, "mid");
  assert.equal(readinessTone(40).className, "low");
  assert.equal(readinessTone(null).className, "unavailable");
});
