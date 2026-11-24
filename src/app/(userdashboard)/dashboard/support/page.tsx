import { SupportRequestForm } from "./_components/SupportRequestForm";
import { SupportRequestsTable } from "./_components/SupportRequestsTable";

const SupportPage = () => {
  return (
    <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4">
      <SupportRequestForm />
      <SupportRequestsTable />
    </div>
  );
};

export default SupportPage;
