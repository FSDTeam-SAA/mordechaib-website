import { CrmContactsTable } from "./_components/CrmContactsTable";
import { CrmStatCards } from "./_components/CrmStatCards";

export default function CrmPage() {
  return (
    <div className="min-h-[calc(100vh-83px)] p-4 text-[#0E1224]">
      <CrmStatCards />
      <CrmContactsTable />
    </div>
  );
}
