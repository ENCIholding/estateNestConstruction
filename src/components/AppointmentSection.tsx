import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Popover, { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AppointmentSection() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !selectedDate ||
      !selectedTime
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredDate: format(selectedDate, "PPP"),
        preferredTime: selectedTime,
        message: formData.message,
        _subject: `Appointment Request - ${formData.name}`,
      };

      const response = await fetch("https://formspree.io/f/xojpnvbz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit appointment request.");
      }

      toast({
        title: "Appointment request sent",
        description: "Your request has been submitted successfully. We'll follow up by email or phone.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setSelectedDate(undefined);
      setSelectedTime("");
    } catch {
      toast({
        title: "Submission failed",
        description: "Something went wrong while sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <section
      id="appointment"
      className="scroll-mt-32 bg-muted/30 pb-20 pt-10 md:scroll-mt-36 md:pt-14"
    >
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="text-4xl font-bold md:text-5xl">
            <span className="gradient-text">Schedule</span>
            <span className="text-enc-text-primary"> a consultation</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
            Use this form to start a conversation about a project, diligence package, or construction requirement.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2 xl:gap-10">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-enc-text-primary">
                  <Phone className="h-6 w-6 text-enc-orange" />
                  Get in touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="mt-1 h-5 w-5 text-enc-orange" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Email</h3>
                      <a
                        href="mailto:hello@estatenest.capital"
                        className="text-enc-text-secondary hover:text-enc-orange"
                      >
                        hello@estatenest.capital
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="mt-1 h-5 w-5 text-enc-orange" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Phone</h3>
                      <p className="text-enc-text-secondary">780-860-3191</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="mt-1 h-5 w-5 text-enc-orange" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Business hours</h3>
                      <p className="text-enc-text-secondary">Monday to Friday: 9:00 AM to 5:00 PM</p>
                      <p className="text-enc-text-secondary">Saturday: 10:00 AM to 2:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-warm p-6 text-white">
                  <h3 className="font-semibold">What this form is for</h3>
                  <ul className="mt-3 space-y-1 text-sm text-white/90">
                    <li>- Project and construction intake discussions</li>
                    <li>- Client or lender diligence follow-up</li>
                    <li>- Planning, documentation, and scope clarification</li>
                    <li>- Direct contact through a monitored business inbox</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-enc-text-primary">
                  <CalendarIcon className="h-6 w-6 text-enc-orange" />
                  Book appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(event) => handleInputChange("name", event.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => handleInputChange("phone", event.target.value)}
                        placeholder="780-XXX-XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Preferred date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date.getDay() === 0}
                            initialFocus
                            className={cn("pointer-events-auto p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Preferred time *</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(event) => handleInputChange("message", event.target.value)}
                      placeholder="Tell us about your project or what you need help reviewing..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-warm text-white hover:shadow-glow disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send appointment request"}
                  </Button>

                  <p className="text-center text-xs text-enc-text-secondary">
                    * Required fields. We'll review your request and confirm the next step by email or phone.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
