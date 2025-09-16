export const validate = ({
  name,
  email,
  username,
  newPassword,
  confirmPassword,
  currentPassword,
  setErrors,
}) => {
  const errors = {};

  // Name
  if (!name?.trim()) errors.name = "Name is required";

  // Email
  if (!email?.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email.trim())) {
      errors.email = "Invalid email";
    }
  }

  // Username
  if (!username?.trim()) {
    errors.username = "Username is required";
  } else if (username.trim().length < 3) {
    errors.username = "Username must be ≥ 3 chars";
  }

  if (newPassword) {
    if (!currentPassword)
      errors.currentPassword = "Enter your current password";
    if (!confirmPassword) errors.confirmPassword = "Confirm the new password";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (newPassword.length < 6) errors.newPassword = "At least 6 characters";
  }

  setErrors?.(errors);
  return Object.keys(errors).length === 0;
};
