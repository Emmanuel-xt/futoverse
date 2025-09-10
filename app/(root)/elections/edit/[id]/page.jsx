import { getCandidateForEdit } from "@lib/actions/election";
import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CandidateEditForm } from "@components/elections/candidate-edit";

export default async function CandidateEditPage({ params }) {
  // TODO: Replace with actual user ID from auth
  const userId = 1;

  const result = await getCandidateForEdit(params.id, userId);

  if (!result.success) {
    redirect("/elections");
  }

  const candidate = result.data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/elections">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">
          Edit Candidate Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Update your candidacy information. Changes will require re-approval
          before being published.
        </p>
      </div>

      <CandidateEditForm candidate={candidate} />
    </div>
  );
}
