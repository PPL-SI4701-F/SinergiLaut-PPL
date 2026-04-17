"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  MessageCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@sinergilaut.id",
    href: "mailto:hello@sinergilaut.id",
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: "+62 811 1234 5678",
    href: "https://wa.me/628111234578",
  },
  { icon: MapPin, label: "Alamat", value: "Jakarta, Indonesia", href: "#" },
  {
    icon: Clock,
    label: "Jam Kerja",
    value: "Senin – Jumat, 08.00 – 17.00 WIB",
    href: "#",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsSent(true);
    toast.success(
      "Pesan berhasil dikirim! Kami akan merespons dalam 1-2 hari kerja.",
    );
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <section className="bg-primary py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <MessageCircle className="h-12 w-12 text-primary-foreground/80 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary-foreground">
              Hubungi Kami
            </h1>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Ada pertanyaan, saran, atau ingin berkolaborasi? Kami senang
              mendengar dari Anda.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Informasi Kontak
                </h2>
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}

                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ikuti kami di sosial media
                  </p>
                  <div className="flex gap-3">
                    {["Instagram", "Twitter", "LinkedIn"].map((s) => (
                      <span
                        key={s}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Kirim Pesan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSent ? (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">
                          Pesan Terkirim!
                        </h3>
                        <p className="text-muted-foreground">
                          Tim kami akan merespons dalam 1-2 hari kerja.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsSent(false);
                            setFormData({
                              name: "",
                              email: "",
                              subject: "",
                              message: "",
                            });
                          }}
                        >
                          Kirim Pesan Lain
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Nama Anda"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="email@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subjek</Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Topik pesan"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Pesan</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Tulis pesan Anda..."
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            "Mengirim..."
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" /> Kirim Pesan
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
