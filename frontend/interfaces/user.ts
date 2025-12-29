import { Gender } from "./Dtos/registerRequest";

interface user{
    id: string;
    username: string;
    profilePictureUrl: string | null;
    gender: Gender;
    createdAt: string;
}
export default user;