enum gender{
    Male = 1,
    Female = 2,
    Other = 3
}
interface loginRequest {
  email: string;
  password: string;
  username: string;
  gender: gender;
}
export default loginRequest;