using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace AutoServiceHub.Tests.Helpers;

public static class UserManagerMockHelper
{
    public static Mock<UserManager<AppUser>> Create()
    {
        var store = new Mock<IUserStore<AppUser>>();

        return new Mock<UserManager<AppUser>>(
            store.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!);
    }
}