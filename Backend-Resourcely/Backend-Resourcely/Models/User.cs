using System;
using System.Collections.Generic;

namespace Backend_Resourcely.Models;

public class User   //single nor plural only for one user
{

    public int Id { get; set; }
    public string Email { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string PasswordSalt { get; set; }
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; }
    
    // Navigation property
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    
}
