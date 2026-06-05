import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function useSubmitContactForm() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      if (!actor) throw new Error("Actor not initialized");
      // Stubbed: backend doesn't have submitContactForm yet
      // Public form - no auth required
      console.log("[ContactForm] Submitted:", data);
      return { success: true };
    },
  });
}

// Backward compatibility aliases
export const useSubmitContact = useSubmitContactForm;
export const useContactForm = useSubmitContactForm;
