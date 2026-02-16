export interface HttpResponse<T = any> {
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
