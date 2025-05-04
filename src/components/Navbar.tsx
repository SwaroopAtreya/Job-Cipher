
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span 
              onClick={() => navigate("/")}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
            >
              JobCipher
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-text hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-text hover:text-primary transition-colors">
              How it Works
            </a>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="gap-2"
                >
                  <User size={18} />
                  Profile
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                className="bg-primary hover:bg-primary-hover"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-text hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-text hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How it Works
              </a>
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <User size={18} />
                  Profile
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full mt-4 bg-primary hover:bg-primary-hover"
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
