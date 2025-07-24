// interface ServerResponse<T> {
//   success: boolean;
//   message: string;
//   errors: null;
//   data: T;
// }
export interface ServerResponse<T> {
  success: boolean;
  message: string;
  errors: null | Errors;
  data: T;
}

interface Errors {
  [key: string]: string[];
}
