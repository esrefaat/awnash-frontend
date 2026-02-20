import {
  getNotificationTemplates,
  getNotificationTemplate,
  updateNotificationTemplate,
  toggleNotificationTemplate,
  previewNotificationTemplate,
  getTemplateVariables,
  testNotification,
  getChannelLabel,
  getPriorityColor,
  getRecipientLabel,
  formatEventCode,
} from './notificationTemplateService';
import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('notificationTemplateService', () => {
  describe('getNotificationTemplates', () => {
    it('calls correct URL without filters', async () => {
      mockFetchOnce(fetchMock, [{ id: 't1', event_code: 'BOOKING_CREATED' }]);

      const result = await getNotificationTemplates();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/admin\/notifications\/templates$/),
        expect.objectContaining({ method: 'GET', credentials: 'include' }),
      );
      expect(result).toEqual([{ id: 't1', eventCode: 'BOOKING_CREATED' }]);
    });

    it('builds query params from filters', async () => {
      mockFetchOnce(fetchMock, []);

      await getNotificationTemplates({
        eventCode: 'BOOKING_CREATED',
        recipientType: 'owner',
        channel: 'push',
        isActive: true,
      });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('eventCode=BOOKING_CREATED');
      expect(url).toContain('recipientType=owner');
      expect(url).toContain('channel=push');
      expect(url).toContain('isActive=true');
    });
  });

  describe('getNotificationTemplate', () => {
    it('calls correct URL with id', async () => {
      mockFetchOnce(fetchMock, { id: 't1', event_code: 'BOOKING_CREATED', title_en: 'New Booking' });

      const result = await getNotificationTemplate('t1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/admin/notifications/templates/t1'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(expect.objectContaining({ id: 't1', titleEn: 'New Booking' }));
    });
  });

  describe('updateNotificationTemplate', () => {
    it('sends PUT with snake_case body', async () => {
      mockFetchOnce(fetchMock, { id: 't1', title_en: 'Updated' });

      await updateNotificationTemplate('t1', { titleEn: 'Updated', defaultPriority: 'HIGH' });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/admin/notifications/templates/t1'),
        expect.objectContaining({ method: 'PUT' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual(expect.objectContaining({ title_en: 'Updated', default_priority: 'HIGH' }));
    });
  });

  describe('toggleNotificationTemplate', () => {
    it('sends POST with is_active', async () => {
      mockFetchOnce(fetchMock, { id: 't1', is_active: false });

      await toggleNotificationTemplate('t1', false);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/admin/notifications/templates/t1/toggle'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual({ is_active: false });
    });
  });

  describe('previewNotificationTemplate', () => {
    it('sends POST with snake_case request', async () => {
      mockFetchOnce(fetchMock, { title: 'Hello John', body: 'Your booking is confirmed' });

      const result = await previewNotificationTemplate({
        templateId: 't1',
        language: 'en',
        sampleData: { userName: 'John' },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/admin/notifications/preview-template'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(expect.objectContaining({ title: 'Hello John' }));
    });
  });

  describe('getTemplateVariables', () => {
    it('calls correct URL with eventCode', async () => {
      mockFetchOnce(fetchMock, { event_code: 'BOOKING_CREATED', variables: [] });

      const result = await getTemplateVariables('BOOKING_CREATED');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('template-variables?eventCode=BOOKING_CREATED'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(expect.objectContaining({ eventCode: 'BOOKING_CREATED' }));
    });
  });

  describe('testNotification', () => {
    it('sends POST with snake_case params', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Sent' });

      const result = await testNotification({ templateId: 't1', userId: 'u1' });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/admin/notifications/test'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });
  });

  describe('handleResponse - error handling', () => {
    it('throws "Session expired" on 401', async () => {
      mockFetchError(fetchMock, 'Unauthorized', 401);

      await expect(getNotificationTemplates()).rejects.toThrow('Session expired');
    });

    it('throws error message on non-401 failure', async () => {
      mockFetchError(fetchMock, 'Server error', 500);

      await expect(getNotificationTemplates()).rejects.toThrow('Server error');
    });
  });

  describe('helper functions', () => {
    describe('getChannelLabel', () => {
      it.each([
        ['push', 'Push'],
        ['in_app', 'In-App'],
        ['email', 'Email'],
        ['sms', 'SMS'],
        ['whatsapp', 'WhatsApp'],
      ] as const)('returns "%s" -> "%s"', (channel, expected) => {
        expect(getChannelLabel(channel)).toBe(expected);
      });

      it('returns raw value for unknown channel', () => {
        expect(getChannelLabel('unknown' as any)).toBe('unknown');
      });
    });

    describe('getPriorityColor', () => {
      it.each([
        ['CRITICAL', 'bg-red-100 text-red-800'],
        ['HIGH', 'bg-orange-100 text-orange-800'],
        ['MEDIUM', 'bg-yellow-100 text-yellow-800'],
        ['LOW', 'bg-green-100 text-green-800'],
      ] as const)('returns correct classes for %s', (priority, expected) => {
        expect(getPriorityColor(priority)).toBe(expected);
      });

      it('returns gray for unknown priority', () => {
        expect(getPriorityColor('UNKNOWN' as any)).toBe('bg-gray-100 text-gray-800');
      });
    });

    describe('getRecipientLabel', () => {
      it.each([
        ['requester', 'Requester'],
        ['owner', 'Owner'],
        ['driver', 'Driver'],
        ['all', 'All Users'],
      ] as const)('returns "%s" -> "%s"', (type, expected) => {
        expect(getRecipientLabel(type)).toBe(expected);
      });

      it('returns raw value for unknown type', () => {
        expect(getRecipientLabel('unknown' as any)).toBe('unknown');
      });
    });

    describe('formatEventCode', () => {
      it('converts BOOKING_CREATED to "Booking Created"', () => {
        expect(formatEventCode('BOOKING_CREATED')).toBe('Booking Created');
      });

      it('converts PAYMENT_FAILED to "Payment Failed"', () => {
        expect(formatEventCode('PAYMENT_FAILED')).toBe('Payment Failed');
      });

      it('handles single word', () => {
        expect(formatEventCode('TEST')).toBe('Test');
      });
    });
  });
});
