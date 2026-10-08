import Image from "next/image";
import { agents } from "./agentData";
export function AgentWorkflow() {
  return (
    <section className="overflow-hidden rounded-2xl bg-white p-4">
      <h2 className="text-center text-xl font-medium">
        Agent‑to‑Agent Workflow Orchestration
      </h2>
      <div className="mt-4 flex flex-col items-center">
        <div className="relative z-10 flex w-[125px] flex-col items-center px-4 pb-4">
          <Image
            src="/laura.png"
            alt="Laura"
            width={1000}
            height={1000}
            className="size-[93px] rounded-full border border-[#8B93B8] object-cover"
          />
          <span className="-mt-5 w-full rounded-[12px] bg-[#5B7FF0] px-4 py-2 text-center text-sm font-medium text-white">
            Laura
          </span>
          <span className="mt-[5px] whitespace-nowrap text-xs font-medium">
            Chief of Staff
          </span>
        </div>
        <div
          className="relative -mt-[76px] hidden h-[92px] w-full max-w-[704px] lg:block"
          aria-hidden="true"
        >
          <Image
            src="/agents/arrow-inner-left.svg"
            alt=""
            width={56}
            height={7}
            className="absolute left-[250px] top-[40px] w-[98px] rotate-[128.76deg]"
          />
          <Image
            src="/agents/arrow-inner-right.svg"
            alt=""
            width={57}
            height={7}
            className="absolute left-[357px] top-[40px] w-[100px] rotate-[50.53deg]"
          />
          <Image
            src="/agents/arrow-mid-left.svg"
            alt=""
            width={146}
            height={7}
            className="absolute left-[83px] top-[10px] w-[290px] rotate-[147.66deg]"
          />
          <Image
            src="/agents/arrow-mid-right.svg"
            alt=""
            width={147}
            height={7}
            className="absolute left-[380px] top-[25px] w-[240px] rotate-[30.62deg]"
          />
          <Image
            src="/agents/arrow-outer-left.svg"
            alt=""
            width={258}
            height={7}
            className="absolute left-[-100px] top-[7px] w-[450px] rotate-[161.74deg]"
          />
          <Image
            src="/agents/arrow-outer-right.svg"
            alt=""
            width={256}
            height={7}
            className="absolute left-[357px] top-[10px] rotate-[18.47deg] w-[450px]"
          />
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:mt-0 lg:grid-cols-6 lg:gap-4">
          {agents.map((agent) => (
            <article
              key={agent.id}
              className="min-w-0 text-center lg:border-r lg:border-dashed lg:border-[#E4EAF8] lg:last:border-r-0"
            >
              <Image
                src={agent.image}
                alt={agent.name}
                width={1000}
                height={1000}
                className="mx-auto w-[80px] h-[70px] rounded-[12px] object-cover"
              />
              <p className="mt-2 font-medium">{agent.name}</p>
              <p className="mt-1 text-xs" style={{ color: agent.color }}>
                {agent.role}
              </p>
              <div className="mt-4 px-1 text-sm">
                <p className="mx-auto max-w-[90px] leading-[18px]">
                  Task
                  <br />
                  Completed:{" "}
                  <strong
                    className={`block ${
                      agent.id === "dexter"
                        ? "text-[#EF4444]"
                        : "text-[#10B981]"
                    }`}
                  >
                    {agent.tasks}
                  </strong>
                </p>
                <hr className="mx-auto my-2 w-[80px] border-[#E4EAF8]" />
                <p className="leading-[18px]">
                  {agent.resultLabel === "Success Rate" ? (
                    <>
                      Success
                      <br />
                      Rate:
                    </>
                  ) : (
                    <>{agent.resultLabel} :</>
                  )}{" "}
                  <strong className="block text-[#10B981]">
                    {agent.result}
                  </strong>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
