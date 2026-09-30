import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoadmapTestContext } from "@/lib/roadmap";
import { createRoadmapTestPaper } from "@/lib/roadmap-test";
import { RoadmapExam } from "./roadmap-exam";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure Roadmap Test",
};

export default async function RoadmapTestPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const context = await getRoadmapTestContext(courseId);
  if (!context) notFound();

  const paper = context.course.status === "in_progress"
    ? await createRoadmapTestPaper(context.course, context.careerTitle, context.userId)
    : { questions: [], token: "", sourceSummary: context.course.description };

  return (
    <RoadmapExam
      courseId={context.course.id}
      courseTitle={context.course.title}
      courseStatus={context.course.status}
      questions={paper.questions}
      paperToken={paper.token}
      sourceSummary={paper.sourceSummary}
    />
  );
}
