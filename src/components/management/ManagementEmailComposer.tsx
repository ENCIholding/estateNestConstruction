import { useState } from "react";
import { ExternalLink, Loader2, MailPlus, Send, ShieldCheck } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type EmailFormState = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
};

const initialFormState: EmailFormState = {
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "Hello,\n\n",
};

const EMAIL_CONFIDENTIALITY_NOTICE =
  "The contents of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information and may be legally protected from disclosure. If you are not the intended recipient of this message or their agent, or if this message has been addressed to you in error, please immediately alert the sender by reply email and then delete this message and any attachments. If you are not the intended recipient, you are hereby notified that any use, dissemination, copying, or storage of this message or its attachments is strictly prohibited. Please note that any views or opinions presented in this email are solely those of the author and do not necessarily represent those of Estate Nest Capital Inc. Finally, the recipient should check this email and any attachments for the presence of viruses. Estate Nest Capital Inc accepts no liability for any damage caused by any virus transmitted by this email.";

function splitEmails(value: string) {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function buildFallbackMailto(form: EmailFormState) {
  const to = splitEmails(form.to).join(",");
  const cc = splitEmails(form.cc).join(",");
  const bcc = splitEmails(form.bcc).join(",");
  const signature = [
    "",
    "",
    "Estate Nest Capital Inc.",
    "@KS:ks",
    "",
    "Kanwar Sharma, Founder",
    "",
    "HELLO@ESTATENEST.CAPITAL",
    "www.estatenest.capital",
    "",
    EMAIL_CONFIDENTIALITY_NOTICE,
  ].join("\n");
  const body = `${form.body.trimEnd()}${signature}`;
  const params = new URLSearchParams();
  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);
  if (form.subject.trim()) params.set("subject", form.subject.trim());
  if (body.trim()) params.set("body", body);
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

export default function ManagementEmailComposer() {
  const [form, setForm] = useState<EmailFormState>(initialFormState);
  const [sending, setSending] = useState(false);

  const setField = (field: keyof EmailFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.to.trim()) {
      toast.error("Add at least one recipient in the To field.");
      return;
    }

    if (!form.subject.trim()) {
      toast.error("Add an email subject.");
      return;
    }

    if (!form.body.trim()) {
      toast.error("Add an email message.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/management/email/send", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: splitEmails(form.to),
          cc: splitEmails(form.cc),
          bcc: splitEmails(form.bcc),
          subject: form.subject.trim(),
          body: form.body,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Email send failed");
      }

      toast.success(
        `Email sent. A copy was delivered to ${payload?.inboxCopy || "hello@estatenest.capital"}.`
      );
      setForm(initialFormState);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Email send failed"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="dashboard-email-composer" className="dashboard-panel p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
            Communications
          </p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            Send Email From The Dashboard
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Send branded emails from <strong>hello@estatenest.capital</strong>.
            The Estate Nest signature and confidentiality notice are appended
            automatically, and a copy is always sent back to your inbox. This
            composer does not yet file messages back into a project activity log.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Authenticated Send
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dashboard-email-to">To</Label>
              <Input
                id="dashboard-email-to"
                value={form.to}
                onChange={(event) => setField("to", event.target.value)}
                placeholder="client@example.com, partner@example.com"
                disabled={sending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="dashboard-email-cc">CC</Label>
                <Input
                  id="dashboard-email-cc"
                  value={form.cc}
                  onChange={(event) => setField("cc", event.target.value)}
                  placeholder="team@example.com"
                  disabled={sending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dashboard-email-bcc">BCC</Label>
                <Input
                  id="dashboard-email-bcc"
                  value={form.bcc}
                  onChange={(event) => setField("bcc", event.target.value)}
                  placeholder="optional@example.com"
                  disabled={sending}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-email-subject">Subject</Label>
              <Input
                id="dashboard-email-subject"
                value={form.subject}
                onChange={(event) => setField("subject", event.target.value)}
                placeholder="Project update"
                disabled={sending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-email-body">Message</Label>
              <Textarea
                id="dashboard-email-body"
                value={form.body}
                onChange={(event) => setField("body", event.target.value)}
                placeholder="Write your email message here..."
                className="min-h-[240px] rounded-2xl border-border/80 bg-background/80 px-4 py-3"
                disabled={sending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Every send includes your Estate Nest footer and a copy to
              hello@estatenest.capital.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild type="button" variant="outline" className="rounded-full">
                <a href={buildFallbackMailto(form)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open In Mail App
                </a>
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow px-6 text-white shadow-glow hover:opacity-95"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <aside className="dashboard-item p-5">
          <div className="flex items-center gap-3">
            <div className="dashboard-icon h-12 w-12">
              <MailPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Included Signature
              </p>
              <p className="text-xs text-muted-foreground">
                Added automatically to every message
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/80 p-5 shadow-sm">
            <BrandLockup subtitle="@KS:ks" className="max-w-[260px]" />
            <div className="mt-4 space-y-2 text-sm text-foreground">
              <p className="font-semibold">Kanwar Sharma, Founder</p>
              <p className="font-semibold uppercase tracking-[0.1em] text-enc-orange">
                HELLO@ESTATENEST.CAPITAL
              </p>
              <p>www.estatenest.capital</p>
            </div>

            <div className="mt-5 rounded-2xl bg-muted/70 p-4 text-xs leading-6 text-muted-foreground">
              {EMAIL_CONFIDENTIALITY_NOTICE}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
