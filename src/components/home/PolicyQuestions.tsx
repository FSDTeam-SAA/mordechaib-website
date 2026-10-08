import Image from "next/image";

const PolicyQuestions = () => {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="container mx-auto">
        <div
          className="relative overflow-hidden rounded-xl bg-[#88A6F8] bg-cover bg-center px-4 py-10 text-center sm:rounded-3xl sm:px-8 sm:py-16 lg:py-20"
          style={{ backgroundImage: "url('/policy.png')" }}
        >
          <div className="relative z-10 mx-auto max-w-[900px]">
            <h2 className="text-[20px] font-bold leading-tight text-white sm:text-5xl lg:text-[48px]">
             Your AI Chief of Staff is Ready ?
            </h2>
            <p className="mx-auto mt-3  text-[12px] leading-relaxed text-white sm:mt-5 sm:text-lg">
              Join 1,200+ small business owners who let Noltra.ai handle the admin so they can focus on growth.
            </p>
            <a
              href="mailto:mordy@noltra.ai"
              className="mx-auto mt-6 inline-flex h-12 max-w-full items-center justify-center gap-2 rounded-[12px] bg-white px-6 text-sm font-semibold text-[#0E1224] shadow-sm sm:mt-8 sm:h-14 sm:gap-3 sm:px-8 sm:text-base"
            >
              
              Get Started
            </a>
            <Image
              src="/arrow.png"
              width={100}
              height={1000}
              sizes="100vw"
              alt="Noltra policy"
              className="absolute left-[30%] top-[110px] hidden sm:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PolicyQuestions;
