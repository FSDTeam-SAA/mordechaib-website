import VerifyEmailForm from "./_components/EmailverificationFrom";


type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div>
      <VerifyEmailForm email={email} />
    </div>
  );
}

export default VerifyEmailPage;
