import { useCallback } from 'react';
import { auditService, AuditEvent } from '../services/audit.service';
import { useAuth } from '@/contexts/AuthContext';

export const useAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: string,
    resourceId: string,
    details: object = {}
  ) => {
    if (!user?.email) return;

    const event: AuditEvent = {
      timestamp: new Date().toISOString(),
      userId: user.email,
      action,
      resourceId,
      details: {
        ...details,
        userEmail: user.email
      },
      severity: 'low',
      category: 'data_modification',
      outcome: 'success'
    };

    await auditService.logEvent(event);
  }, [user]);

  return { logAction };
}; 