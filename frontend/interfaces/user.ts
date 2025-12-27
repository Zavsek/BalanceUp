import { Gender } from "./registerRequest";

interface user{
    id: string;
    userName: string;
    profilePictureUrl: string | null;
    gender: Gender;
    createdAt: string;
}
export default user;