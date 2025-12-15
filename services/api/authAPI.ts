// Minimal Auth API stub for password changes (ready to swap to Supabase later)

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(_data: ChangePasswordInput): Promise<{ success: boolean }> {
  // Simulate a fast success; replace with Supabase auth update.
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}


