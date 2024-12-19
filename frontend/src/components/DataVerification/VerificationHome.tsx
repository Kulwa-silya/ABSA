import React, { useState, useEffect } from "react";
import { PostDTO } from "../../types/api";
import { api } from "../../services/api";
import { PostReview } from "./PostReview";
import { VerificationProvider } from "../../contexts/VerificationContext";
import { ClipboardCheck, Filter, Download } from "lucide-react";

const ITEMS_PER_PAGE = 10;

interface FilterState {
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function VerificationHome() {
  const [unreviewedPosts, setUnreviewedPosts] = useState<PostDTO[]>([]);
  const [reviewedPosts, setReviewedPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<PostDTO | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const [unreviewed, reviewed] = await Promise.all([
        api.getUnreviewedPosts(),
        api.getReviewedPosts(),
      ]);
      setUnreviewedPosts(unreviewed);
      setReviewedPosts(reviewed);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (post: PostDTO) => {
    setSelectedPost(post);
  };

  const handleBackToList = async () => {
    setSelectedPost(null);
    await fetchPosts();
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "verification_data.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const filterPosts = (posts: PostDTO[]) => {
    return posts.filter((post) => {
      if (
        filters.source &&
        !post.source.toLowerCase().includes(filters.source.toLowerCase())
      ) {
        return false;
      }
      if (filters.dateRange) {
        const postDate = new Date(post.created_at!);
        if (
          postDate < filters.dateRange.start ||
          postDate > filters.dateRange.end
        ) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredUnreviewed = filterPosts(unreviewedPosts);
  const filteredReviewed = filterPosts(reviewedPosts);
  const allFilteredPosts = [...filteredUnreviewed, ...filteredReviewed];

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = allFilteredPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allFilteredPosts.length / ITEMS_PER_PAGE);

  if (selectedPost) {
    return (
      <VerificationProvider>
        <PostReview initialPost={selectedPost} onBack={handleBackToList} />
      </VerificationProvider>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Social Media Data Verification
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Verify aspects from comments too see if their correct
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500">
            Pending Reviews
          </div>
          <div className="mt-2 text-3xl font-semibold text-yellow-600">
            {unreviewedPosts.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500">
            Verified Posts
          </div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {reviewedPosts.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500">Total Posts</div>
          <div className="mt-2 text-3xl font-semibold text-indigo-600">
            {allFilteredPosts.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500">
            Completion Rate
          </div>
          <div className="mt-2 text-3xl font-semibold text-indigo-600">
            {Math.round(
              (reviewedPosts.length / (allFilteredPosts.length || 1)) * 100,
            )}
            %
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-lg shadow-sm mb-8 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Filter by source"
                value={filters.source || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, source: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        start: new Date(e.target.value),
                        end: prev.dateRange?.end || new Date(),
                      },
                    }))
                  }
                />
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        start: prev.dateRange?.start || new Date(),
                        end: new Date(e.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Caption
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Comments
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Date Created
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-gray-500"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-3 py-4 text-sm">
                        {post.status === "unreviewed" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {post.source}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="max-w-lg line-clamp-2">
                          {post.caption}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {post.comments?.length || 0} comments
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {new Date(post.created_at!).toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-sm">
                        {post.status === "unreviewed" ? (
                          <button
                            onClick={() => handleVerifyClick(post)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyClick(post)}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, allFilteredPosts.length)}
              </span>{" "}
              of <span className="font-medium">{allFilteredPosts.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === i + 1
                      ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
