import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";

interface PendingBooking {
  id: number;
  userId: string;
  userName: string;
  resourceId: number;
  resourceName: string;
  resourceType: string;
  resourceLocation: string;
  bookingAt: string;
  endAt: string;
  reason: string;
  capacity: number;
  contact: string;
  status: string;
  createdAt: string;
}

const BookingApprovalDashboard: React.FC = () => {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    bookingId: number | null;
  }>({
    open: false,
    bookingId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get admin email from localStorage (assuming it's stored there)
  const adminEmail =
    JSON.parse(localStorage.getItem("auth") || "{}").user?.email ||
    "admin@resourcely.com";

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending bookings");
      }
      const data = await response.json();
      setPendingBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/bookings/approve/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approverEmail: adminEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve booking");
      }

      await response.json();
      setSuccessMessage("Booking approved successfully!");
      await fetchPendingBookings(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve booking"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const rejectBooking = async () => {
    if (!rejectDialog.bookingId) return;

    try {
      setActionLoading(rejectDialog.bookingId);
      const response = await fetch(
        `/api/bookings/reject/${rejectDialog.bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approverEmail: adminEmail,
            rejectionReason: rejectionReason || "No reason provided",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject booking");
      }

      await response.json();
      setSuccessMessage("Booking rejected successfully!");
      setRejectDialog({ open: false, bookingId: null });
      setRejectionReason("");
      await fetchPendingBookings(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject booking");
      setRejectDialog({ open: false, bookingId: null });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Booking Approval Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pending Booking Requests ({pendingBookings.length})
          </Typography>

          {pendingBookings.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No pending booking requests at the moment.
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchPendingBookings}
                sx={{ mt: 2 }}
              >
                Refresh
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.userName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {booking.userId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.resourceName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {booking.resourceType}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="textSecondary"
                          >
                            {booking.resourceLocation}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDateTime(booking.bookingAt)}
                          </Typography>
                          <Typography variant="body2">
                            to {formatDateTime(booking.endAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ maxWidth: 200, wordBreak: "break-word" }}
                        >
                          {booking.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.capacity} people
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ maxWidth: 150, wordBreak: "break-word" }}
                        >
                          {booking.contact}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Approve Booking">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => approveBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                            >
                              {actionLoading === booking.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <ApproveIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Booking">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                setRejectDialog({
                                  open: true,
                                  bookingId: booking.id,
                                })
                              }
                              disabled={actionLoading === booking.id}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, bookingId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Booking Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Please provide a reason for rejecting this booking request:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Resource not available, insufficient justification, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialog({ open: false, bookingId: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={rejectBooking}
            color="error"
            variant="contained"
            disabled={actionLoading !== null}
          >
            {actionLoading !== null ? "Rejecting..." : "Reject Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingApprovalDashboard;
