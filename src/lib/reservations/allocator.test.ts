import {describe, expect, it} from "vitest";
import {allocateTable} from "./allocator";

const units = [
  {id: "two", capacity: 2, tableIds: ["T1"]},
  {id: "four", capacity: 4, tableIds: ["T2"]},
  {id: "combined", capacity: 8, tableIds: ["T2", "T3"]},
];
const startsAt = new Date("2026-10-10T21:00:00.000Z");

describe("allocateTable", () => {
  it("chooses the smallest fitting table", () => expect(allocateTable(2, startsAt, 120, units, [])?.id).toBe("two"));
  it("avoids tables occupied by overlapping reservations", () => expect(allocateTable(2, startsAt, 120, units, [{startsAt, endsAt: new Date(startsAt.getTime() + 60_000), tableIds: ["T1"]}])?.id).toBe("four"));
  it("does not block a table when time ranges only touch", () => expect(allocateTable(2, startsAt, 120, units, [{startsAt: new Date(startsAt.getTime() - 7_200_000), endsAt: startsAt, tableIds: ["T1"]}])?.id).toBe("two"));
  it("returns null when no unit can fit", () => expect(allocateTable(9, startsAt, 120, units, [])).toBeNull());
});
