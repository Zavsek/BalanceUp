using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

public sealed class FirebaseAuthService
{
    private readonly FirebaseAuth _firebaseAuth;
    public FirebaseAuthService()
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile("firebase-config.json"),
            ProjectId = "balanceup-85fcc"
        });

        _firebaseAuth = FirebaseAuth.DefaultInstance;
    }
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
