import * as React from 'react';
import { BookOpen, Calendar, Users, Building } from 'lucide-react';
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
    icon: <Calendar className="h-6 w-6 text-gray-500" />,
    title: 'Book Lecture Halls',
    description:
      'Easily reserve lecture halls for classes or student events with real-time availability.',
  },
  {
    icon: <Building className="h-6 w-6 text-gray-500" />,
    title: 'View Available Rooms',
    description:
      'Check which classrooms, labs, or study rooms are free and plan your schedule efficiently.',
  },
  {
    icon: <BookOpen className="h-6 w-6 text-gray-500" />,
    title: 'Study Area Reservations',
    description:
      'Reserve quiet study areas or group spaces to ensure a productive learning environment.',
  },
  {
    icon: <Users className="h-6 w-6 text-gray-500" />,
    title: 'Collaboration & Team Booking',
    description:
      'Coordinate with classmates and book rooms for group projects, presentations, and workshops.',
  },
];

const Content: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-col self-center gap-6 max-w-md">
      {/* Loop through items */}
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          {item.icon}
          <div className="text-left">
            <h3 className="font-medium text-gray-900 mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Content;
