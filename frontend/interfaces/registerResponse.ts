import { Gender } from "./registerRequest";

interface registerResponse {
    token :string;
    localId:string;
    username:string;
    gender:Gender;
    profilePictureUrl: string;
    createdAt:string
}
export default registerResponse;