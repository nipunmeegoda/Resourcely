import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Schedule as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from "@mui/icons-material";

interface UserBooking {
  id: number;
  resourceName: string;
  resourceType: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

const UserBookingStatus: React.FC = () => {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      // This would get bookings for the currently logged-in user
      const response = await fetch("/api/bookings/user"); // Assuming user context from auth

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      Pending: {
        color: "warning" as const,
        icon: <PendingIcon fontSize="small" />,
      },
      Approved: {
        color: "success" as const,
        icon: <ApprovedIcon fontSize="small" />,
      },
      Rejected: {
        color: "error" as const,
        icon: <RejectedIcon fontSize="small" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDate = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleDateString();
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getBookingStats = () => {
    const stats = bookings.reduce(
      (acc, booking) => {
        const status = booking.status.toLowerCase() as keyof typeof acc;
        if (status in acc && status !== "total") {
          acc[status]++;
        }
        acc.total++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, total: 0 }
    );
    return stats;
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

  const stats = getBookingStats();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Booking Status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Booking Statistics */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Bookings
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pending
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="success.main">
              {stats.approved}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Approved
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="error.main">
              {stats.rejected}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Rejected
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Booking History
          </Typography>

          {bookings.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No bookings found. Start by booking a resource to see your
                status here.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Resource</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.resourceName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {booking.resourceType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(booking.startTime)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.location}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(booking.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(booking)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Resource Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedBooking.resourceName}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedBooking.resourceType}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {selectedBooking.location}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Booking Schedule
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(selectedBooking.startTime)}
                </Typography>
                <Typography variant="body2">
                  <strong>Start Time:</strong>{" "}
                  {formatTime(selectedBooking.startTime)}
                </Typography>
                <Typography variant="body2">
                  <strong>End Time:</strong>{" "}
                  {formatTime(selectedBooking.endTime)}
                </Typography>
                <Typography variant="body2">
                  <strong>Requested:</strong>{" "}
                  {formatDateTime(selectedBooking.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Status Information
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {getStatusChip(selectedBooking.status)}
                </Box>

                {selectedBooking.status === "Approved" &&
                  selectedBooking.approvedBy && (
                    <>
                      <Typography variant="body2">
                        <strong>Approved by:</strong>{" "}
                        {selectedBooking.approvedBy}
                      </Typography>
                      {selectedBooking.approvedAt && (
                        <Typography variant="body2">
                          <strong>Approved at:</strong>{" "}
                          {formatDateTime(selectedBooking.approvedAt)}
                        </Typography>
                      )}
                    </>
                  )}

                {selectedBooking.status === "Rejected" &&
                  selectedBooking.rejectionReason && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="error.main"
                        fontWeight="medium"
                      >
                        Rejection Reason:
                      </Typography>
                      <Typography variant="body2">
                        {selectedBooking.rejectionReason}
                      </Typography>
                    </Box>
                  )}

                {selectedBooking.status === "Pending" && (
                  <Typography variant="body2" color="textSecondary">
                    Your booking request is waiting for admin approval. You will
                    be notified once a decision is made.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserBookingStatus;
