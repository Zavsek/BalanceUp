export type Gender = "Male"|"Female"|"Other"
interface registerRequest {
  email: string;
  password: string;
  username: string;
  gender: Gender;
}
export default registerRequest;