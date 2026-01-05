import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import Popover, { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
const AppointmentSection = () => {
    const [selectedDate, setSelectedDate] = useState();
    const [selectedTime, setSelectedTime] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const timeSlots = [
        "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
    ];
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !selectedDate || !selectedTime) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields and select a date and time.",
                variant: "destructive"
            });
            return;
        }
        // Create email body
        const emailBody = `
New Appointment Request

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Date: ${format(selectedDate, "PPP")}
Time: ${selectedTime}

Message: ${formData.message}
    `.trim();
        // Create mailto link
        const mailtoLink = `mailto:hello@estatenest.capital?subject=Appointment Request - ${formData.name}&body=${encodeURIComponent(emailBody)}`;
        // Open email client
        window.location.href = mailtoLink;
        // Show success message
        toast({
            title: "Appointment Request Sent",
            description: "Your email client has been opened. Please send the email to complete your appointment request.",
        });
        // Reset form
        setFormData({
            name: "",
            email: "",
            phone: "",
            message: ""
        });
        setSelectedDate(undefined);
        setSelectedTime("");
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (_jsx("section", { id: "appointment", className: "py-20 bg-muted/30", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: [_jsx("span", { className: "gradient-text", children: "Schedule" }), _jsx("span", { className: "text-enc-text-primary", children: " Appointment" })] }), _jsx("p", { className: "text-xl text-enc-text-secondary max-w-3xl mx-auto", children: "Ready to discuss your real estate investment or construction project? Book a consultation with our experts." })] }), _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "grid lg:grid-cols-2 gap-12", children: [_jsxs(Card, { className: "card-hover", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-2xl text-enc-text-primary flex items-center gap-3", children: [_jsx(Phone, { className: "w-6 h-6 text-enc-orange" }), "Get In Touch"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Mail, { className: "w-5 h-5 text-enc-orange mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-enc-text-primary", children: "Email" }), _jsx("p", { className: "text-enc-text-secondary", children: "hello@estatenest.capital" })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Phone, { className: "w-5 h-5 text-enc-orange mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-enc-text-primary", children: "Phone" }), _jsx("p", { className: "text-enc-text-secondary", children: "780-860-3191" })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Clock, { className: "w-5 h-5 text-enc-orange mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-enc-text-primary", children: "Business Hours" }), _jsx("p", { className: "text-enc-text-secondary", children: "Monday - Friday: 9:00 AM - 5:00 PM" }), _jsx("p", { className: "text-enc-text-secondary", children: "Saturday: 10:00 AM - 2:00 PM" })] })] })] }), _jsxs("div", { className: "p-6 bg-gradient-warm rounded-lg text-white", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Why Choose Estate Nest Capital?" }), _jsxs("ul", { className: "space-y-1 text-sm text-white/90", children: [_jsx("li", { children: "\u2022 Edmonton-based with local market expertise" }), _jsx("li", { children: "\u2022 Comprehensive real estate solutions" }), _jsx("li", { children: "\u2022 Professional construction services" }), _jsx("li", { children: "\u2022 Strategic investment guidance" })] })] })] })] }), _jsxs(Card, { className: "card-hover", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-2xl text-enc-text-primary flex items-center gap-3", children: [_jsx(CalendarIcon, { className: "w-6 h-6 text-enc-orange" }), "Book Appointment"] }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Full Name *" }), _jsx(Input, { id: "name", type: "text", value: formData.name, onChange: (e) => handleInputChange("name", e.target.value), placeholder: "Your full name", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", value: formData.phone, onChange: (e) => handleInputChange("phone", e.target.value), placeholder: "780-XXX-XXXX", required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email Address *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), placeholder: "your.email@example.com", required: true })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Preferred Date *" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), selectedDate ? format(selectedDate, "PPP") : "Pick a date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: setSelectedDate, disabled: (date) => date < new Date() || date.getDay() === 0, initialFocus: true, className: cn("p-3 pointer-events-auto") }) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Preferred Time *" }), _jsxs(Select, { value: selectedTime, onValueChange: setSelectedTime, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select time" }) }), _jsx(SelectContent, { children: timeSlots.map((time) => (_jsx(SelectItem, { value: time, children: time }, time))) })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "message", children: "Message" }), _jsx(Textarea, { id: "message", value: formData.message, onChange: (e) => handleInputChange("message", e.target.value), placeholder: "Tell us about your project or any specific requirements...", rows: 4 })] }), _jsx(Button, { type: "submit", className: "w-full bg-gradient-warm text-white hover:shadow-glow", children: "Send Appointment Request" }), _jsx("p", { className: "text-xs text-enc-text-secondary text-center", children: "* Required fields. We'll contact you within 24 hours to confirm your appointment." })] }) })] })] }) })] }) }));
};
export default AppointmentSection;
