import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";
const Contracts = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Client Information
        corporation_name: "",
        director_name: "",
        client_address: "",
        client_email: "",
        client_phone: "",
        // Lawyer (Management)
        lawyer_name: "",
        lawyer_email: "",
        lawyer_phone: "",
        // Realtor Buyer
        realtor_buyer_name: "",
        realtor_buyer_email: "",
        realtor_buyer_phone: "",
        // Realtor Seller (Management)
        realtor_seller_name: "",
        realtor_seller_email: "",
        realtor_seller_phone: "",
        notes: ""
    });
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Supabase not configured → redirect to login
                if (!supabase) {
                    navigate("/management-login");
                    return;
                }
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error) {
                    throw error;
                }
                if (!session) {
                    navigate("/management-login");
                }
            }
            catch (err) {
                console.error("Auth check failed:", err);
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleSave = async () => {
        setLoading(true);
        try {
            // In future, save to database
            toast.success("Contract information saved successfully");
        }
        catch (error) {
            console.error("Error saving contract:", error);
            toast.error("Failed to save contract information");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [_jsx(FileText, { className: "h-8 w-8 text-enc-orange" }), "Contract Information"] }), _jsx("p", { className: "text-muted-foreground", children: "Manage project contract details" })] }), _jsxs(Button, { onClick: handleSave, disabled: loading, className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), "Save Contract"] })] }), _jsxs("div", { className: "grid gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Client Information" }) }), _jsxs(CardContent, { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "corporation_name", children: "Corporation Name" }), _jsx(Input, { id: "corporation_name", name: "corporation_name", value: formData.corporation_name, onChange: handleChange, placeholder: "Enter corporation name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "director_name", children: "Director Name" }), _jsx(Input, { id: "director_name", name: "director_name", value: formData.director_name, onChange: handleChange, placeholder: "Enter director name" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "client_address", children: "Address" }), _jsx(Textarea, { id: "client_address", name: "client_address", value: formData.client_address, onChange: handleChange, placeholder: "Enter full address", rows: 2 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "client_email", children: "Email" }), _jsx(Input, { id: "client_email", name: "client_email", type: "email", value: formData.client_email, onChange: handleChange, placeholder: "client@example.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "client_phone", children: "Phone" }), _jsx(Input, { id: "client_phone", name: "client_phone", type: "tel", value: formData.client_phone, onChange: handleChange, placeholder: "(780) 000-0000" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Lawyer (Management)" }) }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lawyer_name", children: "Lawyer Name" }), _jsx(Input, { id: "lawyer_name", name: "lawyer_name", value: formData.lawyer_name, onChange: handleChange, placeholder: "Enter lawyer name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lawyer_email", children: "Lawyer Email" }), _jsx(Input, { id: "lawyer_email", name: "lawyer_email", type: "email", value: formData.lawyer_email, onChange: handleChange, placeholder: "lawyer@lawfirm.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lawyer_phone", children: "Lawyer Phone" }), _jsx(Input, { id: "lawyer_phone", name: "lawyer_phone", type: "tel", value: formData.lawyer_phone, onChange: handleChange, placeholder: "(780) 000-0000" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Realtor (Buyer)" }) }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_buyer_name", children: "Realtor Name" }), _jsx(Input, { id: "realtor_buyer_name", name: "realtor_buyer_name", value: formData.realtor_buyer_name, onChange: handleChange, placeholder: "Enter realtor name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_buyer_email", children: "Realtor Email" }), _jsx(Input, { id: "realtor_buyer_email", name: "realtor_buyer_email", type: "email", value: formData.realtor_buyer_email, onChange: handleChange, placeholder: "realtor@agency.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_buyer_phone", children: "Realtor Phone" }), _jsx(Input, { id: "realtor_buyer_phone", name: "realtor_buyer_phone", type: "tel", value: formData.realtor_buyer_phone, onChange: handleChange, placeholder: "(780) 000-0000" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Realtor Seller (Management)" }) }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_seller_name", children: "Realtor Name" }), _jsx(Input, { id: "realtor_seller_name", name: "realtor_seller_name", value: formData.realtor_seller_name, onChange: handleChange, placeholder: "Enter realtor name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_seller_email", children: "Realtor Email" }), _jsx(Input, { id: "realtor_seller_email", name: "realtor_seller_email", type: "email", value: formData.realtor_seller_email, onChange: handleChange, placeholder: "realtor@agency.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "realtor_seller_phone", children: "Realtor Phone" }), _jsx(Input, { id: "realtor_seller_phone", name: "realtor_seller_phone", type: "tel", value: formData.realtor_seller_phone, onChange: handleChange, placeholder: "(780) 000-0000" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Additional Notes" }) }), _jsx(CardContent, { children: _jsx(Textarea, { name: "notes", value: formData.notes, onChange: handleChange, placeholder: "Enter any additional contract notes or details...", rows: 4 }) })] })] })] }) }));
};
export default Contracts;
