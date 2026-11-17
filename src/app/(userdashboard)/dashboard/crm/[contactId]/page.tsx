import { CrmContactDetails } from "../_components/CrmContactDetails";

export default async function CrmContactDetailsPage({
  params,
}: {
  params: { contactId: string } | Promise<{ contactId: string }>;
}) {
  const resolved = await Promise.resolve(params);
  return <CrmContactDetails contactId={resolved?.contactId} />;
}
