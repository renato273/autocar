// src/components/DashboardSkeleton.tsx
"use client";
import { Skeleton } from "boneyard-js/react";
import { dashboardBones } from "../lib/dashboard-bones";

interface DashboardSkeletonProps {
  loading: boolean;
  children: React.ReactNode;
}

export default function DashboardSkeleton({ loading, children }: DashboardSkeletonProps) {
  return (
    <Skeleton
      loading={loading}
      initialBones={dashboardBones}
      name="dashboard"
      color="#1e2430"
      darkColor="#1e2430"
      animate="shimmer"
      transition
    >
      {children}
    </Skeleton>
  );
}
