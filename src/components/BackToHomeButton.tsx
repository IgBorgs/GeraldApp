import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackToHomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button variant="outline" onClick={() => navigate("/")}>
        ← Back to Home Page
      </Button>
    </div>
  );
};

export default BackToHomeButton;