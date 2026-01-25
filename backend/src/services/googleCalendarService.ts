import { google } from 'googleapis';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const buildClient = async (tenantId: string) => {
  const token = await prisma.oAuthToken.findFirst({
    where: { tenantId, provider: 'google' }
  });
  if (!token) {
    throw new Error('Google OAuth token missing');
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiry.getTime()
  });

  return oauth2;
};

export const googleCalendarService = {
  async getBusySlots({ tenantId, start, end }: { tenantId: string; start: string; end: string }) {
    try {
      const auth = await buildClient(tenantId);
      const calendar = google.calendar({ version: 'v3', auth });
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          items: [{ id: 'primary' }]
        }
      });

      const busy = response.data.calendars?.primary?.busy ?? [];
      return busy.map((range) => ({
        start: range.start ?? start,
        end: range.end ?? end
      }));
    } catch (error) {
      logger.warn('Unable to fetch busy slots', { error });
      return [];
    }
  },

  async createEvent({
    tenantId,
    summary,
    description,
    start,
    end,
    attendees
  }: {
    tenantId: string;
    summary: string;
    description: string;
    start: string;
    end: string;
    attendees: { email?: string; displayName?: string }[];
  }) {
    const auth = await buildClient(tenantId);
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
        attendees
      }
    });

    return response.data.id ?? null;
  }
};

export const googleAuthUrl = () => {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

export const exchangeGoogleCode = async (code: string) => {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2.getToken(code);
  return tokens;
};
