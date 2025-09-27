import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface Resource {
  id: number;
  name: string;
  type: string;
  description: string;
  capacity: number;
  blockId: number;
  blockName: string;
  floorName: string;
  buildingName: string;
  isRestricted: boolean;
  restrictedToRoles: string;
}

interface Block {
  id: number;
  name: string;
  floorName: string;
  buildingName: string;
}

interface CreateResourceFormData {
  name: string;
  type: string;
  description: string;
  capacity: number;
  blockId: number;
  isRestricted: boolean;
  restrictedToRoles: string;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CreateResourceFormData>({
    name: "",
    type: "",
    description: "",
    capacity: 1,
    blockId: 0,
    isRestricted: false,
    restrictedToRoles: "",
  });

  const resourceTypes = [
    "Meeting Room",
    "Lab",
    "Auditorium",
    "Conference Room",
    "Study Room",
    "Computer Lab",
    "Workshop",
    "Library",
    "Classroom",
  ];

  const userRoles = [
    "Student",
    "Lecturer",
    "Admin",
    "Staff",
    "Researcher",
    "Guest",
  ];

  useEffect(() => {
    fetchResources();
    fetchBlocks();
  }, []);

  const fetchResources = async () => {
    try {
      // This would need to be updated to get all resources for admin view
      const response = await fetch("/api/resources/all"); // New endpoint for admin
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blocks"); // Assuming this endpoint exists
      if (response.ok) {
        const data = await response.json();
        setBlocks(data);
      }
    } catch (err) {
      console.error("Failed to fetch blocks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.type ||
      formData.blockId === 0 ||
      formData.capacity < 1
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          restrictedToRoles: formData.isRestricted
            ? formData.restrictedToRoles
            : "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create resource");
      }

      const newResource = await response.json();
      setResources((prev) => [...prev, newResource]);
      setSuccess("Resource created successfully!");
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create resource"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      capacity: 1,
      blockId: 0,
      isRestricted: false,
      restrictedToRoles: "",
    });
  };

  const handleRoleToggle = (role: string) => {
    const currentRoles = formData.restrictedToRoles
      .split(",")
      .filter((r) => r.trim());
    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    setFormData((prev) => ({
      ...prev,
      restrictedToRoles: updatedRoles.join(","),
    }));
  };

  const getRoleChips = (rolesString: string) => {
    if (!rolesString) return null;
    const roles = rolesString.split(",").filter((r) => r.trim());
    return roles.map((role) => (
      <Chip
        key={role}
        label={role.trim()}
        size="small"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Resource Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Resource
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resources ({resources.length})
          </Typography>

          {resources.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No resources found. Create your first resource to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Restrictions</TableCell>
                    <TableCell>Allowed Roles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {resource.name}
                          </Typography>
                          {resource.description && (
                            <Typography variant="caption" color="textSecondary">
                              {resource.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{resource.type}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {resource.buildingName} &gt; {resource.floorName} &gt;{" "}
                          {resource.blockName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {resource.capacity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={resource.isRestricted ? "Restricted" : "Open"}
                          color={resource.isRestricted ? "warning" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {resource.isRestricted ? (
                          <Box>{getRoleChips(resource.restrictedToRoles)}</Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            All users
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Resource Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Resource Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                fullWidth
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Resource Type"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  {resourceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Capacity *"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 0,
                  }))
                }
                fullWidth
                required
                inputProps={{ min: 1 }}
              />

              <FormControl fullWidth required>
                <InputLabel>Block</InputLabel>
                <Select
                  value={formData.blockId}
                  label="Block"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      blockId: e.target.value as number,
                    }))
                  }
                >
                  {blocks.map((block) => (
                    <MenuItem key={block.id} value={block.id}>
                      {block.buildingName} &gt; {block.floorName} &gt;{" "}
                      {block.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isRestricted}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isRestricted: e.target.checked,
                        restrictedToRoles: e.target.checked
                          ? prev.restrictedToRoles
                          : "",
                      }))
                    }
                  />
                }
                label="Restrict access to specific roles"
              />

              {formData.isRestricted && (
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Select roles that can access this resource:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {userRoles.map((role) => (
                      <FormControlLabel
                        key={role}
                        control={
                          <Checkbox
                            checked={formData.restrictedToRoles
                              .split(",")
                              .includes(role)}
                            onChange={() => handleRoleToggle(role)}
                            size="small"
                          />
                        }
                        label={role}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating..." : "Create Resource"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ResourceManagement;
