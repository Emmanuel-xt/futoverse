import { Button } from "@components/ui/button";
import { CandidateRegistrationForm } from "@components/elections/candidates-registration-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CandidateRegistrationPage() {
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
          Register as Candidate
        </h1>
        <p className="text-muted-foreground mt-2">
          Submit your candidacy for the Student Union Government elections. Your
          profile will be reviewed before being published.
        </p>
      </div>

      <CandidateRegistrationForm />
    </div>
  );
}
