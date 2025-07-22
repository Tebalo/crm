import { sessionService } from "./session-service"


export async function cleanupExpiredSessions() {
  await sessionService.cleanupExpiredSessions()
  console.log('Expired sessions cleaned up')
}

// You can call this periodically or set up as a cron job