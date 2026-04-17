import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = {
  EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS: process.env.EMAIL_SMTP_PASS,
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  vi.resetModules();
});

describe("email helpers", () => {
  it("normalizes and deduplicates email recipients", async () => {
    const email = await import("./email");

    expect(
      email.normalizeEmailList([
        "Hello@Example.com",
        "hello@example.com",
        "team@example.com",
      ])
    ).toEqual(["hello@example.com", "team@example.com"]);
  });

  it("builds branded email content with confidentiality footer", async () => {
    const email = await import("./email");
    const content = email.buildEmailContent("Hello team,\n\nProject update attached.", {
      fromAddress: "hello@estatenest.capital",
      logoUrl: "https://www.estatenest.capital/logo.jpg",
    });

    expect(content.text).toContain("Kanwar Sharma, Founder");
    expect(content.text).toContain(
      "The contents of this email message and any attachments are intended solely for the addressee(s)"
    );
    expect(content.html).toContain("Estate Nest Capital Inc.");
    expect(content.html).toContain("https://www.estatenest.capital");
  });

  it("validates SMTP configuration before live sending", async () => {
    process.env.EMAIL_SMTP_USER = "hello@estatenest.capital";
    process.env.EMAIL_SMTP_PASS = "app-password";
    process.env.EMAIL_FROM_ADDRESS = "hello@estatenest.capital";

    const email = await import("./email");

    expect(email.getSmtpConfig()).toEqual(
      expect.objectContaining({
        host: "smtp.gmail.com",
        fromAddress: "hello@estatenest.capital",
        user: "hello@estatenest.capital",
      })
    );
  });
});
