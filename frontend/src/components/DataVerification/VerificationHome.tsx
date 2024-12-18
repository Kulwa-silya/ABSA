import React, { useState, useEffect } from "react";
import { PostDTO } from "../../types/api";
import { api } from "../../services/api";
import { PostReview } from "./PostReview";
import { ClipboardCheck } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export function VerificationHome() {
  const [unreviewedPosts, setUnreviewedPosts] = useState<PostDTO[]>([]);
  const [reviewedPosts, setReviewedPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDTO | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
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

    fetchPosts();
  }, []);

  const handleVerifyClick = (post: PostDTO) => {
    setSelectedPost(post);
  };

  const handleSaveReview = async (updatedPost: PostDTO) => {
    try {
      await api.reviewPost(updatedPost.id!);
      setUnreviewedPosts((current) =>
        current.filter((post) => post.id !== updatedPost.id),
      );
      setReviewedPosts((current) => [...current, updatedPost]);
      setSelectedPost(null); // Go back to list
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  if (selectedPost) {
    return (
      <PostReview
        post={selectedPost}
        onSave={handleSaveReview}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const allPosts = [...unreviewedPosts, ...reviewedPosts];
  const paginatedPosts = allPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Social Media Data Verification
        </h1>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Pending {unreviewedPosts.length} posts
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Verified {reviewedPosts.length} posts
          </span>
        </div>
      </div>

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
                        <div className="max-w-lg">
                          <div className="line-clamp-1">{post.caption}</div>
                          {post.caption.length > 100 && (
                            <button className="text-indigo-600 text-sm hover:text-indigo-900">
                              Show more
                            </button>
                          )}
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
                          <span className="text-gray-400">Verified</span>
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
                {Math.min(endIndex, allPosts.length)}
              </span>{" "}
              of <span className="font-medium">{allPosts.length}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
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
