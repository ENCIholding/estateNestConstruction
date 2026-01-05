import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Dialog, { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
const RequestFormDialog = ({ open, onOpenChange, requestType }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
    });
    const [isVerified, setIsVerified] = useState(false);
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    const validatePhone = (phone) => {
        const re = /^[\d\s\-()+]+$/;
        return re.test(phone) && phone.replace(/\D/g, "").length >= 10;
    };
    const handleVerification = () => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const userAnswer = prompt(`Human Verification: What is ${a} + ${b}?`);
        if (userAnswer && parseInt(userAnswer, 10) === a + b) {
            setIsVerified(true);
            return true;
        }
        toast({
            title: "Verification Failed",
            description: "Please answer the verification question correctly.",
            variant: "destructive"
        });
        return false;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast({
                title: "Error",
                description: "Please enter your full name.",
                variant: "destructive"
            });
            return;
        }
        if (!validateEmail(formData.email)) {
            toast({
                title: "Error",
                description: "Please enter a valid email address.",
                variant: "destructive"
            });
            return;
        }
        if (!validatePhone(formData.phone)) {
            toast({
                title: "Error",
                description: "Please enter a valid phone number (at least 10 digits).",
                variant: "destructive"
            });
            return;
        }
        if (!formData.message.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message.",
                variant: "destructive"
            });
            return;
        }
        if (!isVerified && !handleVerification())
            return;
        const subject = encodeURIComponent(`${requestType} Request - ${formData.firstName} ${formData.lastName}`);
        const body = encodeURIComponent(`Name: ${formData.firstName} ${formData.lastName}\n` +
            `Email: ${formData.email}\n` +
            `Phone: ${formData.phone}\n\n` +
            `Message:\n${formData.message}`);
        window.location.href = `mailto:hello@estatenest.capital?subject=${subject}&body=${body}`;
        toast({
            title: "Success",
            description: "Your request has been prepared. Please send the email."
        });
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            message: ""
        });
        setIsVerified(false);
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-2xl gradient-text", children: requestType }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name *" }), _jsx(Input, { id: "firstName", value: formData.firstName, onChange: (e) => setFormData({ ...formData, firstName: e.target.value }), required: true, maxLength: 50 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name *" }), _jsx(Input, { id: "lastName", value: formData.lastName, onChange: (e) => setFormData({ ...formData, lastName: e.target.value }), required: true, maxLength: 50 })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true, maxLength: 255 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), required: true, maxLength: 20 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "message", children: "Message *" }), _jsx(Textarea, { id: "message", value: formData.message, onChange: (e) => setFormData({ ...formData, message: e.target.value }), required: true, maxLength: 1000, rows: 4 })] }), _jsx(Button, { type: "submit", className: "w-full", children: "Submit Request" })] })] }) }));
};
export default RequestFormDialog;
