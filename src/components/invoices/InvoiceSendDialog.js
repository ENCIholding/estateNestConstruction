import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
export const InvoiceSendDialog = ({ open, onOpenChange, invoiceNumber, clientEmail, onSend }) => {
    const [emailData, setEmailData] = useState({
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
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-5 w-5" }), "Send Invoice via Email"] }), _jsx(DialogDescription, { children: "The invoice will be attached as a PDF to the email" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "from", children: "From" }), _jsx(Input, { id: "from", value: "hello@estatenest.capital", disabled: true, className: "bg-muted" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "to", children: "To (separate multiple emails with commas)" }), _jsx(Input, { id: "to", value: emailData.to.join(", "), onChange: (e) => setEmailData({
                                        ...emailData,
                                        to: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                                    }), placeholder: "client@example.com, another@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cc", children: "CC (optional)" }), _jsx(Input, { id: "cc", value: emailData.cc?.join(", ") || "", onChange: (e) => setEmailData({
                                        ...emailData,
                                        cc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                                    }), placeholder: "cc@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "bcc", children: "BCC (optional)" }), _jsx(Input, { id: "bcc", value: emailData.bcc?.join(", ") || "", onChange: (e) => setEmailData({
                                        ...emailData,
                                        bcc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                                    }), placeholder: "bcc@example.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "subject", children: "Subject" }), _jsx(Input, { id: "subject", value: emailData.subject, onChange: (e) => setEmailData({ ...emailData, subject: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "body", children: "Message Body" }), _jsx(Textarea, { id: "body", value: emailData.body, onChange: (e) => setEmailData({ ...emailData, body: e.target.value }), rows: 12, className: "font-mono text-sm" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSend, className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), "Send Invoice"] })] })] })] }) }));
};
