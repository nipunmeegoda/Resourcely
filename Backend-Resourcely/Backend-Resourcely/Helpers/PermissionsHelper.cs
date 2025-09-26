using Backend_Resourcely.Models;

namespace Backend_Resourcely.Helpers
{
    public static class PermissionsHelper
    {
        // Simple role-based permissions for resource types
        // Student: can book Regular resources only
        // Teacher: can book Regular and Lab resources  
        // Admin: can book all resource types (Regular, Lab, Special)
        
        public static bool CanUserBookResourceType(string userRole, string resourceType)
        {
            return userRole?.ToLower() switch
            {
                "admin" => true, // Admin can book everything
                "teacher" => resourceType?.ToLower() != "special", // Teacher can book Regular and Lab, but not Special
                "student" => resourceType?.ToLower() == "regular", // Student can only book Regular resources
                _ => resourceType?.ToLower() == "regular" // Default users can only book Regular resources
            };
        }

        public static string[] GetAvailableResourceTypes(string userRole)
        {
            return userRole?.ToLower() switch
            {
                "admin" => new[] { "Regular", "Lab", "Special" },
                "teacher" => new[] { "Regular", "Lab" },
                "student" => new[] { "Regular" },
                _ => new[] { "Regular" }
            };
        }

        public static bool IsValidResourceType(string resourceType)
        {
            var validTypes = new[] { "Regular", "Lab", "Special" };
            return validTypes.Contains(resourceType, StringComparer.OrdinalIgnoreCase);
        }
    }
}