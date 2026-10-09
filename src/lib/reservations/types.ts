export type TableUnit = {id: string; capacity: number; tableIds: string[]};
export type ExistingAssignment = {startsAt: Date; endsAt: Date; tableIds: string[]};

export type ReservationInput = {
  name: string;
  email: string;
  phone: string;
  people: number;
  date: string;
  time: string;
  locale: "es" | "en" | "it";
  notes?: string;
  privacyAccepted: true;
};
