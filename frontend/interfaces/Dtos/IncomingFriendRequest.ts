import UserCard from "./UserCard";

interface IncomingFriendRequest{
    requestId:string;
    fromUserId:string;
    sentAt:string //ISO date only
    user:UserCard;
}
export default IncomingFriendRequest;