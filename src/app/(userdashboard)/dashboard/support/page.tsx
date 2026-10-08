import { SupportRequestForm } from "./_components/SupportRequestForm";
import { SupportRequestsTable } from "./_components/SupportRequestsTable";

const SupportPage = () => {
  return (
    <div className="space-y-4 p-4 pb-8">
      <SupportRequestForm />
      <SupportRequestsTable />
    </div>
  );
};

export default SupportPage;
