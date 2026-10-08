import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

const ContactMeeting = () => {
  return (
    <section id="contact" className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-28">
      <div className="container mx-auto grid gap-9 sm:gap-12 lg:grid-cols-[0.82fr_1fr] lg:items-start">
        <div className="max-w-[672px]">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF01A] px-3 py-1.5 text-[11px] font-medium text-[#5B7FF0] sm:mb-5 sm:py-2 sm:text-sm">
            <MessageSquare size={12} />
            Contact us
          </div>

          <h2 className="text-[28px] font-bold leading-tight text-[#0E1224] sm:text-5xl lg:text-[60px] lg:leading-[1.2]">
            Connect with -
            <br />
            our team
          </h2>

          <p className="mt-3 w-full text-[13px] leading-relaxed text-[#0E1224] sm:mt-4 sm:text-lg lg:text-[20px]">
            We’re here to help! Whether you have a question about our services, need
            assistance with your account, or want to provide feedback , our team is ready
            to assist you
          </p>
        </div>

        <form className="w-full">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-[#00163D] sm:text-[32px]">Book A Meeting</h3>
            <p className="mt-1 text-[13px] text-[#00000099] sm:text-base">
              We typically respond within one business day.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-5">
            <label className="text-base font-normal text-[#00163D]">
              Full Name
              <Input
                placeholder="Enter full name....."
                className="mt-2 h-12 rounded-xl border-0 font-normal bg-[#F5F7FF] px-4 text-xs shadow-none placeholder:text-[#00163D99]"
              />
            </label>
            <label className="text-base font-normal text-[#00163D]">
              Email Address
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="mt-2 h-12 rounded-xl border-0 font-normal bg-[#F5F7FF] px-4 text-xs shadow-none placeholder:text-[#00163D99]"
              />
            </label>
            <label className="text-base font-normal text-[#00163D]">
              Company
              <Input
                placeholder="Enter company name....."
                className="mt-2 h-12 rounded-xl border-0 font-normal bg-[#F5F7FF] px-4 text-xs shadow-none placeholder:text-[#00163D99]"
              />
            </label>
            <label className="text-base font-normal text-[#00163D]">
              Your Role
              <Input
                placeholder="Enter your role....."
                className="mt-2 h-12 rounded-xl border-0 font-normal bg-[#F5F7FF] px-4 text-xs shadow-none placeholder:text-[#00163D99]"
              />
            </label>
          </div>

          <label className="mt-4 block text-base font-normal text-[#00163D]">
            Message
            <textarea
              placeholder="Tell us about your customer service needs....."
              className="mt-2 min-h-[135px] w-full resize-none rounded-xl border-0 bg-[#F5F7FF] px-4 py-3 text-base text-[#00163D99] shadow-none outline-none placeholder:text-[#7b86a5] focus-visible:ring-1 focus-visible:ring-[#5d7ff2]"
            />
          </label>

          <label className="mt-6 flex items-start gap-2 text-[13px] font-normal leading-relaxed text-[#000000] sm:mt-7 sm:items-center sm:text-base">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-[#a8b2ca] accent-[#5d7ff2]"
            />
            I agree for Noltra.ai to contact me about my enquiry.
          </label>

          <Button className="mt-6 h-12 w-full rounded-[12px] bg-[#5B7FF0] text-base font-medium text-white hover:bg-[#5B7FF0]/90">
            Book A Meeting
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactMeeting;
