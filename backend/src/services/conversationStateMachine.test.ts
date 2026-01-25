import { describe, expect, it, vi } from 'vitest';
import { conversationStateMachine } from './conversationStateMachine.js';
import { ConversationState } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { availabilityService } from './availabilityService.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    service: {
      findFirst: vi.fn()
    }
  }
}));

vi.mock('./availabilityService.js', () => ({
  availabilityService: {
    getAvailableSlots: vi.fn()
  }
}));

describe('conversationStateMachine', () => {
  it('moves from collecting_service to collecting_date when service is found', async () => {
    (prisma.service.findFirst as any).mockResolvedValue({ id: 'service-1' });

    const result = await conversationStateMachine.handleMessage(
      'tenant-1',
      'contact-1',
      ConversationState.collecting_service,
      {},
      'Consulta'
    );

    expect(result.nextState).toBe(ConversationState.collecting_date);
    expect(result.context.serviceId).toBe('service-1');
  });

  it('proposes slots after collecting name', async () => {
    (availabilityService.getAvailableSlots as any).mockResolvedValue([
      '2024-08-20 09:00',
      '2024-08-20 10:00'
    ]);

    const result = await conversationStateMachine.handleMessage(
      'tenant-1',
      'contact-1',
      ConversationState.collecting_name,
      { serviceId: 'service-1', date: '2024-08-20', timePreference: 'any' },
      'Andrea'
    );

    expect(result.nextState).toBe(ConversationState.proposing_slots);
    expect(result.context.proposedSlots?.length).toBe(2);
  });
});
