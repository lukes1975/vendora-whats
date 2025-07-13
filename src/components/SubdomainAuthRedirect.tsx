import { useEffect } from "react";
import { redirectToMainDomain } from "@/utils/subdomain";

/**
 * Component to redirect users to main domain for authentication
 */
const SubdomainAuthRedirect = () => {
  useEffect(() => {
    // Redirect to main domain login page
    redirectToMainDomain('/login');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default SubdomainAuthRedirect;