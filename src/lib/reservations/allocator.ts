import type {ExistingAssignment, TableUnit} from "./types";

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

export function allocateTable(
  partySize: number,
  startsAt: Date,
  durationMinutes: number,
  units: TableUnit[],
  existing: ExistingAssignment[],
) {
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  const occupied = new Set(
    existing
      .filter((assignment) => overlaps(startsAt, endsAt, assignment.startsAt, assignment.endsAt))
      .flatMap((assignment) => assignment.tableIds),
  );

  return [...units]
    .filter((unit) => unit.capacity >= partySize)
    .sort((a, b) => a.capacity - b.capacity || a.tableIds.length - b.tableIds.length)
    .find((unit) => unit.tableIds.every((tableId) => !occupied.has(tableId))) ?? null;
}
