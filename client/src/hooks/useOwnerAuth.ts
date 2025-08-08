import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useOwnerAuth() {
  const [ownerKey, setOwnerKey] = useState<string>(() => 
    localStorage.getItem("ownerKey") || ""
  );

  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/check", ownerKey],
    queryFn: async () => {
      const response = await fetch("/api/auth/check", {
        headers: ownerKey ? { "x-auth-key": ownerKey } : {},
      });
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    localStorage.setItem("ownerKey", ownerKey);
  }, [ownerKey]);

  const setKey = (key: string) => {
    setOwnerKey(key);
  };

  const clearKey = () => {
    setOwnerKey("");
    localStorage.removeItem("ownerKey");
  };

  return {
    isOwner: data?.isOwner || false,
    isLoading,
    ownerKey,
    setKey,
    clearKey,
  };
}