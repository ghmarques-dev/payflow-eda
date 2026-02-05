export interface CreatedUserEventPayload {
  user_id: string;
  email: string;
  name: string;
  occurred_at: Date;
}

export const CREATED_USER_EVENT_TYPE = 'user.created' as const;
