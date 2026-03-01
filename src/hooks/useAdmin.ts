import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      console.log("Checking admin status...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User:", user);
      
      if (!user) {
        console.log("No user found");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();
      
      console.log("Profile check:", profile, error);

      setIsAdmin(!!profile?.is_admin);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
};
