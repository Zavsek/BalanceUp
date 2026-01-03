import { Gender } from "./Dtos/registerRequest";

interface User{
    id: string;
    username: string;
    profilePictureUrl: string | null;
    gender: Gender;
    createdAt: string;
}
export default User;