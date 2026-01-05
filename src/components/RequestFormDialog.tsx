import { useState } from "react";
import Dialog,{  DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input  from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface RequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestType: string;
}

const RequestFormDialog = ({
  open,
  onOpenChange,
  requestType
}: RequestFormDialogProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const [isVerified, setIsVerified] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    if (!isVerified && !handleVerification()) return;

    const subject = encodeURIComponent(
      `${requestType} Request - ${formData.firstName} ${formData.lastName}`
    );

    const body = encodeURIComponent(
      `Name: ${formData.firstName} ${formData.lastName}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n\n` +
        `Message:\n${formData.message}`
    );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            {requestType}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              maxLength={1000}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestFormDialog;
