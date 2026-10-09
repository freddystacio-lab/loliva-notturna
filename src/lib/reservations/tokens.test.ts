import {afterEach,beforeEach,describe,expect,it} from "vitest";
import {createReservationSession,verifyReservationSession} from "./tokens";

describe("reservation access session",()=>{
  const previous=process.env.RESERVATION_TOKEN_SECRET;
  beforeEach(()=>{process.env.RESERVATION_TOKEN_SECRET="test-secret-with-sufficient-entropy";});
  afterEach(()=>{process.env.RESERVATION_TOKEN_SECRET=previous;});
  it("accepts a signed session for the same reservation",()=>{const session=createReservationSession("ABC123");expect(session).not.toBeNull();expect(verifyReservationSession("ABC123",session!)).toBe(true);});
  it("rejects a session for a different reservation",()=>{const session=createReservationSession("ABC123");expect(verifyReservationSession("OTHER",session!)).toBe(false);});
  it("rejects a modified signature",()=>{const session=createReservationSession("ABC123")!;expect(verifyReservationSession("ABC123",`${session}x`)).toBe(false);});
});
