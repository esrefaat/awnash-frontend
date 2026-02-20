import { setupFetchMock, mockFetchOnce, mockFetchReject } from '../../test/helpers/mock-api';
import { invoicesService } from './invoicesService';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

const sampleInvoice = {
  id: 'inv-1',
  invoice_number: 'INV-001',
  amount: 5000,
  tax_amount: 750,
  total_amount: 5750,
  currency: 'SAR',
  status: 'sent',
  issued_at: '2026-02-01',
  due_date: '2026-03-01',
  booking_id: 'b1',
};

// ─── getMyInvoices ──────────────────────────────────────────

describe('invoicesService.getMyInvoices', () => {
  it('returns invoices from data wrapper', async () => {
    mockFetchOnce(fetchMock, { success: true, data: [sampleInvoice] });

    const result = await invoicesService.getMyInvoices();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/invoices`);
    expect(result).toHaveLength(1);
    expect(result[0].invoiceNumber).toBe('INV-001');
  });
});

// ─── getAllInvoices ──────────────────────────────────────────

describe('invoicesService.getAllInvoices', () => {
  it('builds query params from filters', async () => {
    mockFetchOnce(fetchMock, {
      success: true,
      data: [sampleInvoice],
      pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
    });

    const result = await invoicesService.getAllInvoices({
      page: 2, limit: 10, status: 'paid', search: 'INV',
      startDate: '2026-01-01', endDate: '2026-02-28',
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/invoices/admin?');
    expect(url).toContain('page=2');
    expect(url).toContain('status=paid');
    expect(url).toContain('search=INV');
    expect(result.invoices).toHaveLength(1);
  });

  it('sends no query string when filters are empty', async () => {
    mockFetchOnce(fetchMock, {
      success: true, data: [],
      pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
    });

    await invoicesService.getAllInvoices();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/invoices/admin`);
  });
});

// ─── getInvoiceById ─────────────────────────────────────────

describe('invoicesService.getInvoiceById', () => {
  it('extracts data from response', async () => {
    mockFetchOnce(fetchMock, { success: true, data: sampleInvoice });

    const result = await invoicesService.getInvoiceById('inv-1');

    expect(result.id).toBe('inv-1');
    expect(result.totalAmount).toBe(5750);
  });
});

// ─── downloadInvoicePdf ─────────────────────────────────────

describe('invoicesService.downloadInvoicePdf', () => {
  it('returns a Blob from the pdf endpoint', async () => {
    mockFetchOnce(fetchMock, 'pdf-content');

    const result = await invoicesService.downloadInvoicePdf('inv-1');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/invoices/inv-1/pdf`);
    expect(result).toBeInstanceOf(Blob);
  });

  it('throws when response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false, status: 404, blob: jest.fn(),
    });

    await expect(invoicesService.downloadInvoicePdf('missing')).rejects.toThrow('Failed to download PDF');
  });
});

// ─── sendInvoice ────────────────────────────────────────────

describe('invoicesService.sendInvoice', () => {
  it('sends POST to /invoices/:id/send', async () => {
    mockFetchOnce(fetchMock, {
      success: true, message: 'Sent',
      data: { id: 'inv-1', status: 'sent' },
    });

    const result = await invoicesService.sendInvoice('inv-1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/invoices/inv-1/send`);
    expect(opts.method).toBe('POST');
    expect(result.status).toBe('sent');
  });
});

// ─── voidInvoice ────────────────────────────────────────────

describe('invoicesService.voidInvoice', () => {
  it('sends POST with reason', async () => {
    mockFetchOnce(fetchMock, {
      success: true,
      data: { ...sampleInvoice, status: 'cancelled' },
    });

    const result = await invoicesService.voidInvoice('inv-1', 'Duplicate');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/invoices/admin/inv-1/void`);
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body as string);
    expect(body.reason).toBe('Duplicate');
    expect(result.status).toBe('cancelled');
  });
});

// ─── markAsPaid ─────────────────────────────────────────────

describe('invoicesService.markAsPaid', () => {
  it('sends POST to mark-paid endpoint', async () => {
    mockFetchOnce(fetchMock, {
      success: true,
      data: { ...sampleInvoice, status: 'paid' },
    });

    const result = await invoicesService.markAsPaid('inv-1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/invoices/admin/inv-1/mark-paid`);
    expect(opts.method).toBe('POST');
    expect(result.status).toBe('paid');
  });
});

// ─── Utility functions ──────────────────────────────────────

describe('invoicesService utilities', () => {
  describe('getStatusVariant', () => {
    it.each([
      ['paid', 'success'],
      ['sent', 'default'],
      ['draft', 'secondary'],
      ['overdue', 'danger'],
      ['cancelled', 'secondary'],
    ] as const)('%s → %s', (status, variant) => {
      expect(invoicesService.getStatusVariant(status)).toBe(variant);
    });
  });

  describe('getStatusLabel', () => {
    it('returns English labels', () => {
      expect(invoicesService.getStatusLabel('draft')).toBe('Draft');
      expect(invoicesService.getStatusLabel('paid')).toBe('Paid');
    });

    it('returns Arabic labels when RTL', () => {
      expect(invoicesService.getStatusLabel('overdue', true)).toBe('متأخر');
    });
  });

  describe('isOverdue', () => {
    it('returns false for paid invoices regardless of date', () => {
      const invoice = { ...sampleInvoice, status: 'paid' as const, dueDate: '2020-01-01' };
      expect(invoicesService.isOverdue(invoice)).toBe(false);
    });

    it('returns false for cancelled invoices', () => {
      const invoice = { ...sampleInvoice, status: 'cancelled' as const, dueDate: '2020-01-01' };
      expect(invoicesService.isOverdue(invoice)).toBe(false);
    });

    it('returns true when due date is in the past', () => {
      const invoice = { ...sampleInvoice, status: 'sent' as const, dueDate: '2020-01-01' };
      expect(invoicesService.isOverdue(invoice)).toBe(true);
    });

    it('returns false when due date is in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invoice = {
        ...sampleInvoice,
        status: 'sent' as const,
        dueDate: futureDate.toISOString(),
      };
      expect(invoicesService.isOverdue(invoice)).toBe(false);
    });
  });

  describe('getDaysUntilDue', () => {
    it('returns positive number for future due date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const invoice = { ...sampleInvoice, dueDate: future.toISOString() };
      const days = invoicesService.getDaysUntilDue(invoice);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('returns negative number for past due date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const invoice = { ...sampleInvoice, dueDate: past.toISOString() };
      const days = invoicesService.getDaysUntilDue(invoice);
      expect(days).toBeLessThanOrEqual(-4);
    });
  });

  describe('formatCurrency', () => {
    it('formats SAR by default', () => {
      const formatted = invoicesService.formatCurrency(2500);
      expect(formatted).toContain('2,500');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const formatted = invoicesService.formatDate('2026-02-15');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('15');
    });
  });
});
