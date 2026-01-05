import { useState } from "react";
import Dialog,{ DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input  from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  clientEmail: string;
  onSend: (emailData: EmailData) => void;
}

export interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
}

export const InvoiceSendDialog = ({ 
  open, 
  onOpenChange, 
  invoiceNumber, 
  clientEmail,
  onSend 
}: InvoiceSendDialogProps) => {
  const [emailData, setEmailData] = useState<EmailData>({
    to: clientEmail ? [clientEmail] : [],
    cc: [],
    bcc: [],
    subject: `Invoice #${invoiceNumber} – Estate Nest Capital Inc.`,
    body: `Dear Client,

Please find attached Invoice #${invoiceNumber} for your review.

Payment Details:
ATB Bank: Institution 219, Transit 08359, Account 00698705279
E-Transfer: hello@estatenest.capital

Terms: Net 14 days

If you have any questions, please don't hesitate to contact us.

Best regards,
Estate Nest Capital Inc.
hello@estatenest.capital
780-860-3191`
  });

  const handleSend = () => {
    if (emailData.to.length === 0) {
      toast.error("Please enter at least one recipient email");
      return;
    }
    onSend(emailData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invoice via Email
          </DialogTitle>
          <DialogDescription>
            The invoice will be attached as a PDF to the email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="from">From</Label>
            <Input 
              id="from" 
              value="hello@estatenest.capital" 
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="to">To (separate multiple emails with commas)</Label>
            <Input 
              id="to" 
              value={emailData.to.join(", ")}
              onChange={(e) => setEmailData({
                ...emailData, 
                to: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
              })}
              placeholder="client@example.com, another@example.com"
            />
          </div>

          <div>
            <Label htmlFor="cc">CC (optional)</Label>
            <Input 
              id="cc" 
              value={emailData.cc?.join(", ") || ""}
              onChange={(e) => setEmailData({
                ...emailData, 
                cc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
              })}
              placeholder="cc@example.com"
            />
          </div>

          <div>
            <Label htmlFor="bcc">BCC (optional)</Label>
            <Input 
              id="bcc" 
              value={emailData.bcc?.join(", ") || ""}
              onChange={(e) => setEmailData({
                ...emailData, 
                bcc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
              })}
              placeholder="bcc@example.com"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="body">Message Body</Label>
            <Textarea 
              id="body" 
              value={emailData.body}
              onChange={(e) => setEmailData({...emailData, body: e.target.value})}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white">
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
