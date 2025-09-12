import { Button } from "./ui/button";
import {
  Calendar,
  Settings,
  User,
  Bell,
  Search,
  Menu,
  Building,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-sky-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">Resourcely</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              className="text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button
              variant="ghost"
              className="text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-black hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}


