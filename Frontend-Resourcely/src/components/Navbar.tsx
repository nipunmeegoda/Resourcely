import { Button } from "./ui/button";
import { Search, Bell, User, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-blue-200 px-8 py-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-blue-600">📚 Resourcely</h1>
        </div>

        <div className="flex items-center">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-l-md rounded-r-none">
            Dashboard
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-none border-l border-l-blue-400">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-r-md rounded-l-none border-l border-l-blue-400">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50 px-3 py-2"
          >
            <User className="w-4 h-4 mr-1" />A
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50 px-3 py-2"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
