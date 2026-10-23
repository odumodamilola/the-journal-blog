"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { validateContact, type ContactErrors } from "@/lib/contact";
export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    const checked = validateContact(input);
    setErrors(checked.errors);
    setMessage("");
    if (Object.keys(checked.errors).length) {
      form
        .querySelector<HTMLInputElement>(
          `[name="${Object.keys(checked.errors)[0]}"]`,
        )
        ?.focus();
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        setMessage(result.error || "We could not save your message.");
      } else {
        setSuccess(true);
        setMessage(result.message);
        form.reset();
      }
    } catch {
      setMessage(
        "We could not connect. Your message has not been saved; please try again.",
      );
    } finally {
      setPending(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <form onSubmit={submit} className="editorial-form" noValidate>
      <div
        ref={feedback}
        tabIndex={-1}
        className={message ? "form-status" : ""}
        role={success ? "status" : "alert"}
      >
        {success && (
          <CheckCircle2
            size={20}
            className="mb-3 text-primary"
            aria-hidden="true"
          />
        )}
        {message}
      </div>
      {!success && (
        <>
          <fieldset disabled={pending} className="space-y-5">
            {(
              [
                ["full_name", "Full name", "text", 100, "Your name"],
                ["email", "Email address", "email", 254, "you@example.com"],
                ["subject", "Subject", "text", 160, "What’s on your mind?"],
              ] as const
            ).map(([name, label, type, max, placeholder]) => (
              <div key={name}>
                <label htmlFor={`contact-${name}`}>{label}</label>
                <input
                  id={`contact-${name}`}
                  name={name}
                  type={type}
                  required
                  maxLength={max}
                  minLength={name === "email" ? undefined : 2}
                  autoComplete={
                    name === "full_name"
                      ? "name"
                      : name === "email"
                        ? "email"
                        : "off"
                  }
                  placeholder={placeholder}
                  className="field"
                  aria-invalid={!!errors[name]}
                  aria-describedby={errors[name] ? `error-${name}` : undefined}
                />
                {errors[name] && (
                  <p className="form-error" id={`error-${name}`}>
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                minLength={20}
                maxLength={5000}
                required
                placeholder="Share a thought, ask a question, or suggest a story…"
                className="field"
                aria-invalid={!!errors.message}
                aria-describedby={
                  errors.message ? "error-message" : "contact-privacy"
                }
              />
              {errors.message && (
                <p className="form-error" id="error-message">
                  {errors.message}
                </p>
              )}
            </div>
            <div className="sr-only" aria-hidden="true">
              <label>
                Leave this field empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button className="editorial-button w-full" disabled={pending}>
              {pending ? "Saving your message…" : "Send a note"}
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </fieldset>
          <p id="contact-privacy" className="text-xs muted leading-6">
            Your name, email and message are stored in the editor’s private
            inbox so they can respond. Do not include passwords or sensitive
            information. No newsletter signup or automatic email delivery.
          </p>
        </>
      )}
      {success && (
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setMessage("");
          }}
          className="text-link"
        >
          Write another note <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
