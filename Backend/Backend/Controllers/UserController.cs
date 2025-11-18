
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    public class UserController
    {
        public static async Task<IResult> UpdateUser(Guid id,
        HttpRequest request,
        AppDbContext context,
        Supabase.Client supabase)
        {
            try
            {
                var user = await context.Users.FindAsync(id);
                if (user == null)
                    return Results.NotFound("User not found");

                var form = await request.ReadFormAsync();

                var username = form["username"].ToString();
                if (string.IsNullOrWhiteSpace(username))
                    return Results.BadRequest("Username cannot be empty.");
                user.Username = username;

                if (!Enum.TryParse<Gender>(form["gender"], out var gender))
                    return Results.BadRequest("Invalid gender value.");
                user.Gender = gender;

                var file = form.Files.GetFile("profilePicture");
                if (file != null && file.Length > 0)
                {
                    var allowedTypes = new[] { ".png", ".jpg", ".jpeg" };
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedTypes.Contains(ext))
                        return Results.BadRequest("Only PNG/JPG files are allowed.");

                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    var bytes = ms.ToArray();

                    var bucket = supabase.Storage.From(Constants.Constants.SupabaseBucket);
                    var fileName = $"{Guid.NewGuid()}{ext}";

                    await bucket.Upload(bytes, fileName, new Supabase.Storage.FileOptions
                    {
                        Upsert = true
                    });

                    user.ProfilePictureUrl = bucket.GetPublicUrl(fileName);
                }

                await context.SaveChangesAsync();

                return Results.Ok(new
                {
                    localId = user.Id,
                    username = user.Username,
                    profilePictureUrl = user.ProfilePictureUrl
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in User Controller " + ex.Message);
            }
        }
        public async Task<IResult> AddFriend(Guid senderId, Guid User2id, AppDbContext context)
        {
            try
            {
                if (await context.Users.FindAsync(senderId, User2id) == null) return TypedResults.BadRequest("Users in request are not valid");
                var Friendship = new Friendship
                {

                    Friend1FK = senderId,
                    Friend2FK = User2id,
                    FriendsSince = DateTime.UtcNow

                };
                await context.Friendships.AddAsync(Friendship);
                context.SaveChangesAsync();
                return TypedResults.Ok("Friendship created");
                
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in USer Controller{ex.Message}");
            }
        }
    }
}
