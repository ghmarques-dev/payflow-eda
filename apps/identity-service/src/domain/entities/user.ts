export interface User {
  user_id: string;

  name: string;
  email: string;
  password: string;
  refresh_token?: string;

  created_at: Date;
  updated_at: Date;
}
