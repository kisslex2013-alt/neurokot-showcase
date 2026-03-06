import Link from 'next/link';
import NewCaseIntake from '@/components/new-case-intake';

export default function NewCasePage() {
  return (
    <>
      <div className="mx-auto mt-6 max-w-4xl px-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to showcase
        </Link>
      </div>
      <NewCaseIntake />
    </>
  );
}
