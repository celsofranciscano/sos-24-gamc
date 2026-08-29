import { redirect } from "next/navigation";

type RouteParams = { params: Promise<{ emergencyCode: string }> };

export default async function HistoryDetailPage({ params }: RouteParams) {
  const { emergencyCode } = await params;
  redirect(`/citizen/emergency/${emergencyCode}`);
}
