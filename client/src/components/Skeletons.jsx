import React from 'react';

const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

const SkeletonRoadmap = () => (
  <div className="max-w-4xl mx-auto py-10 px-4">
    {/* Profile card skeleton */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-10 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="flex gap-3">
        <div className="h-6 bg-gray-200 rounded-full w-32"></div>
        <div className="h-6 bg-gray-200 rounded-full w-28"></div>
      </div>
    </div>
    {/* Stages skeleton */}
    <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
    <div className="space-y-8 ml-6 border-l-2 border-gray-200 pl-12">
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="h-5 bg-gray-200 rounded w-24 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonChecklist = () => (
  <div className="max-w-4xl mx-auto py-10 px-4">
    <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-96 mb-8 animate-pulse"></div>
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonDashboard = () => (
  <div className="max-w-6xl mx-auto py-10 px-4">
    <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm border p-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm border p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-5 bg-gray-200 rounded-full w-24"></div>
            <div className="h-5 bg-gray-200 rounded w-32 ml-auto"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export { SkeletonRoadmap, SkeletonChecklist, SkeletonDashboard };
