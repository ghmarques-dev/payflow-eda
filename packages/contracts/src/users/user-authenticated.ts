export interface UserAuthenticatedEventPayload {
  user_id: string;
  email: string;
}

export const USER_AUTHENTICATED_EVENT_TYPE = 'user.authenticated' as const;
