import { Application } from "@prisma/client";

/**
 * Checks if an application has been waiting for 14 or more days
 * without moving past APPLIED or INTERVIEWING stage.
 */
export function isFollowUpNeeded(app: Application): boolean {
  if (app.status === "OFFER" || app.status === "REJECTED") {
    return false;
  }

  const dateAppliedTime = new Date(app.dateApplied).getTime();
  const now = new Date().getTime();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  return now - dateAppliedTime >= fourteenDaysMs;
}

export function getFollowUpDays(app: Application): number {
  const dateAppliedTime = new Date(app.dateApplied).getTime();
  const now = new Date().getTime();
  const days = Math.floor((now - dateAppliedTime) / (1000 * 60 * 60 * 24));
  return days;
}
