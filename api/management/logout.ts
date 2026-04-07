import { clearSessionCookie } from "./_lib/auth.ts"; // Added .ts extension

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", clearSessionCookie());

  return res.status(200).json({
    ok: true,
    message: "Logged out successfully",
  });
}
