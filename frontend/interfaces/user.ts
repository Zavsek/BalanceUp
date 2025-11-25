enum Gender{
    Male = 1,
    Female = 2,
    Other = 3
}

interface user{
    id: number;
    userName: string;
    profilePictureUrl: string | null;
    gender: Gender;
}
export default user;