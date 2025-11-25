enum gender{
    Male = 1,
    Female = 2,
    Other = 3
}

interface user{
    id: string;
    userName: string;
    profilePictureUrl: string | null;
    gender: gender;
    createdAt: string;
}
export default user;