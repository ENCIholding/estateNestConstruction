import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input  from "@/components/ui/input";
import Label  from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import Popover,{  PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Select,{  SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const AppointmentSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section 
      id="appointment"
      className="py-20 bg-muted/30"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Schedule</span>
            <span className="text-enc-text-primary"> Appointment</span>
          </h2>
          <p className="text-xl text-enc-text-secondary max-w-3xl mx-auto">
            Ready to discuss your real estate investment or construction project? Book a consultation with our experts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary flex items-center gap-3">
                  <Phone className="w-6 h-6 text-enc-orange" />
                  Get In Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-enc-orange mt-1" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Email</h3>
                      <p className="text-enc-text-secondary">hello@estatenest.capital</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-enc-orange mt-1" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Phone</h3>
                      <p className="text-enc-text-secondary">780-860-3191</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-enc-orange mt-1" />
                    <div>
                      <h3 className="font-semibold text-enc-text-primary">Business Hours</h3>
                      <p className="text-enc-text-secondary">Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p className="text-enc-text-secondary">Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-warm rounded-lg text-white">
                  <h3 className="font-semibold mb-2">Why Choose Estate Nest Capital?</h3>
                  <ul className="space-y-1 text-sm text-white/90">
                    <li>• Edmonton-based with local market expertise</li>
                    <li>• Comprehensive real estate solutions</li>
                    <li>• Professional construction services</li>
                    <li>• Strategic investment guidance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Form */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-enc-orange" />
                  Book Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="780-XXX-XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
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
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Preferred Time *</Label>
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
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your project or any specific requirements..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-warm text-white hover:shadow-glow"
                  >
                    Send Appointment Request
                  </Button>

                  <p className="text-xs text-enc-text-secondary text-center">
                    * Required fields. We'll contact you within 24 hours to confirm your appointment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;