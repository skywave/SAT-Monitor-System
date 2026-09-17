import { EventNormalizer } from './event-normalizer';

describe('EventNormalizer', () => {
  let normalizer: EventNormalizer;

  beforeEach(() => {
    normalizer = new EventNormalizer();
  });

  it('should normalize trunk status event (30010)', () => {
    const rawEvent: any = {
      type: 30010,
      msg: JSON.stringify({ trunk_name: 'trunk1', kind: 'SIP', status: 1, registered_ip: '192.168.1.1' }),
      pbxId: 'pbx1',
      sn: 'sn1'
    };

    const normalized = normalizer.normalize(rawEvent);
    expect(normalized).toBeDefined();
    expect(normalized?.eventType).toBe('trunk_status_changed');
    expect(normalized?.data.status_text).toBe('idle');
  });

  it('should return null for unhandled event type', () => {
    const rawEvent: any = {
      type: 99999,
      msg: JSON.stringify({}),
      pbxId: 'pbx1',
      sn: 'sn1'
    };

    const normalized = normalizer.normalize(rawEvent);
    expect(normalized).toBeNull();
  });

  it('should return null for invalid JSON in msg', () => {
    const rawEvent: any = {
      type: 30010,
      msg: '{ invalid json }',
      pbxId: 'pbx1',
      sn: 'sn1'
    };

    const normalized = normalizer.normalize(rawEvent);
    expect(normalized).toBeNull();
  });
});
