using FirebaseAdmin.Auth;

public sealed class FirebaseAuthService
{
    public async Task<string> RegisterAsync(string email, string password)
    {
        var args = new UserRecordArgs
        {
            Email = email,
            Password = password
        };

        var user = await FirebaseAuth.DefaultInstance.CreateUserAsync(args);
        return user.Uid;
    }

    public async Task<string?> VerifyIdTokenAsync(string idToken)
    {
        try
        {
            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            return decoded.Uid;
        }
        catch
        {
            return null;
        }
    }
}
