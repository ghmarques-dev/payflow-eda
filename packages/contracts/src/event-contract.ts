import {
  CREATED_USER_EVENT_TYPE,
  type CreatedUserEventPayload,
} from './users/created-user';
import {
  USER_AUTHENTICATED_EVENT_TYPE,
  type UserAuthenticatedEventPayload,
} from './users/user-authenticated';

export const EVENT_TYPES = {
  CREATED_USER: CREATED_USER_EVENT_TYPE,
  USER_AUTHENTICATED: USER_AUTHENTICATED_EVENT_TYPE,
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface EventContractMap {
  [CREATED_USER_EVENT_TYPE]: CreatedUserEventPayload;
  [USER_AUTHENTICATED_EVENT_TYPE]: UserAuthenticatedEventPayload;
}

export type EventPayload<E extends EventType = EventType> = EventContractMap[E];
