import notificationService from '../services/notificationService';
import listingService from '../services/listingService';
import { ListingStatus } from '../models/Listing';

export class ScheduledJobs {
  private intervals: NodeJS.Timeout[] = [];

  start(): void {
    console.log('Starting scheduled jobs...');

    // Run departure date reminders daily at 9 AM
    // For development, run every hour
    const reminderInterval = setInterval(
      async () => {
        try {
          console.log('Running departure date reminder job...');
          await notificationService.sendDepartureDateReminders();
          console.log('Departure date reminder job completed');
        } catch (error) {
          console.error('Error in departure date reminder job:', error);
        }
      },
      60 * 60 * 1000 // 1 hour in development (change to 24 hours in production)
    );

    // Run automatic listing expiration daily
    // For development, run every hour
    const expirationInterval = setInterval(
      async () => {
        try {
          console.log('Running automatic listing expiration job...');
          await this.expireListings();
          console.log('Automatic listing expiration job completed');
        } catch (error) {
          console.error('Error in automatic listing expiration job:', error);
        }
      },
      60 * 60 * 1000 // 1 hour in development (change to 24 hours in production)
    );

    this.intervals.push(reminderInterval, expirationInterval);
  }

  private async expireListings(): Promise<void> {
    const pool = (await import('../config/database')).default;

    // Find all active listings where seller's departure date has passed
    const query = `
      UPDATE listings
      SET status = $1
      WHERE status = $2
        AND seller_id IN (
          SELECT id FROM users
          WHERE departure_date IS NOT NULL
            AND departure_date < CURRENT_DATE
        )
      RETURNING id, title, seller_id
    `;

    const result = await pool.query(query, [ListingStatus.EXPIRED, ListingStatus.ACTIVE]);

    console.log(`Expired ${result.rowCount} listings`);
  }

  stop(): void {
    console.log('Stopping scheduled jobs...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
}

export default new ScheduledJobs();
