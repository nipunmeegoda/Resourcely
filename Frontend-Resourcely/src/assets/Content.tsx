import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { SitemarkIcon } from './CustomIcons';
import type { JSX } from 'react';

// Define the item type
interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Items for the resource management app
const items: FeatureItem[] = [
  {
    icon: <EventAvailableIcon sx={{ color: 'text.secondary' }} />,
    title: 'Book Lecture Halls',
    description:
      'Easily reserve lecture halls for classes or student events with real-time availability.',
  },
  {
    icon: <MeetingRoomIcon sx={{ color: 'text.secondary' }} />,
    title: 'View Available Rooms',
    description:
      'Check which classrooms, labs, or study rooms are free and plan your schedule efficiently.',
  },
  {
    icon: <LocalLibraryIcon sx={{ color: 'text.secondary' }} />,
    title: 'Study Area Reservations',
    description:
      'Reserve quiet study areas or group spaces to ensure a productive learning environment.',
  },
  {
    icon: <GroupWorkIcon sx={{ color: 'text.secondary' }} />,
    title: 'Collaboration & Team Booking',
    description:
      'Coordinate with classmates and book rooms for group projects, presentations, and workshops.',
  },
];

const Content: React.FC = (): JSX.Element => {
  return (
    <Stack
      sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
    >
      {/* Optional logo or icon */}
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <SitemarkIcon />
      </Box>

      {/* Loop through items */}
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}

          <Box sx={{ textAlign: 'left' }}>
            <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

export default Content;
