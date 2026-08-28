import { SkeletonCards, SkeletonHeading, SkeletonRows } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonHeading />
      <SkeletonCards />
      <div className="mt-6">
        <SkeletonRows rows={5} />
      </div>
    </>
  );
}
