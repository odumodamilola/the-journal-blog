export type ContactInput = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};
export type ContactErrors = Partial<
  Record<keyof ContactInput | "website", string>
>;
export function validateContact(value: unknown): {
  data: ContactInput;
  errors: ContactErrors;
} {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const text = (key: string) =>
    typeof source[key] === "string" ? (source[key] as string).trim() : "";
  const data = {
    full_name: text("full_name"),
    email: text("email").toLowerCase(),
    subject: text("subject"),
    message: text("message"),
  };
  const errors: ContactErrors = {};
  if (data.full_name.length < 2 || data.full_name.length > 100)
    errors.full_name = "Use a name between 2 and 100 characters.";
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email address.";
  if (data.subject.length < 2 || data.subject.length > 160)
    errors.subject = "Use a subject between 2 and 160 characters.";
  if (data.message.length < 20 || data.message.length > 5000)
    errors.message = "Write a message between 20 and 5,000 characters.";
  if (text("website")) errors.website = "Unable to accept this submission.";
  return { data, errors };
}
