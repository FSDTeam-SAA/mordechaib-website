function PrivacyHero() {
  return (
    <section
      className="relative flex h-[454px] items-center justify-center overflow-hidden px-4 pt-16 text-center"
      style={{ background: "linear-gradient(90deg, #98D0FF 0%, #FFFFFF 100%)" }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[34px] font-extrabold leading-tight tracking-normal text-[#0E1224] sm:text-[42px] lg:text-[46px]">
          Privacy &amp; Policy |{" "}
          <span className="bg-[linear-gradient(180deg,#FF63F2_0%,#5B7FF0_100%)] bg-clip-text text-transparent">
            Noltra
          </span>
        </h1>
        <p className="mt-6 text-xl font-bold leading-tight text-[#969ABB] sm:text-2xl lg:text-[28px]">
          Last update: 29/05/2026
        </p>
      </div>
    </section>
  );
}

export default PrivacyHero;
