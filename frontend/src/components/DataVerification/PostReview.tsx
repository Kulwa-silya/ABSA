// frontend/src/components/DataVerification/PostReview.tsx
import React, { useEffect } from "react";
import { ArrowLeft, Save, Undo, Redo, Plus, Trash } from "lucide-react";
import { PostDTO } from "../../types/api";
import { useVerification } from "../../contexts/VerificationContext";
import { generateUUID } from "../../utils/uuid";

interface PostReviewProps {
  initialPost: PostDTO;
  onBack: () => void;
}

export function PostReview({ initialPost, onBack }: PostReviewProps) {
  const {
    state: { post, isSaving, error, currentIndex, history },
    setPost,
    updatePost,
    undo,
    redo,
    saveChanges,
  } = useVerification();

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handleSave = async () => {
    if (!post) return;
    try {
      await saveChanges(post);
      onBack(); // Return to list after successful save
    } catch (error) {
      // Error is handled by the context
      console.error("Failed to save:", error);
    }
  };

  const handleAddAspect = (commentIndex: number) => {
    if (!post) return;

    const updatedPost = { ...post };
    const newAspect = {
      aspect_name: "",
      aspect_text: "",
      sentiment: "neutral" as const,
    };

    updatedPost.comments[commentIndex].aspects.push(newAspect);
    updatePost(updatedPost);
  };

  const handleRemoveAspect = (commentIndex: number, aspectIndex: number) => {
    if (!post) return;

    const updatedPost = { ...post };
    updatedPost.comments[commentIndex].aspects.splice(aspectIndex, 1);
    updatePost(updatedPost);
  };

  const handleCommentTextChange = (commentIndex: number, text: string) => {
    if (!post) return;

    const updatedPost = { ...post };
    updatedPost.comments[commentIndex].text = text;
    updatePost(updatedPost);
  };

  const handleAspectChange = (
    commentIndex: number,
    aspectIndex: number,
    field: "aspect_name" | "sentiment",
    value: string,
  ) => {
    if (!post) return;

    const updatedPost = { ...post };
    updatedPost.comments[commentIndex].aspects[aspectIndex][field] = value;
    updatePost(updatedPost);
  };

  const handleGeneralSentimentChange = (
    commentIndex: number,
    sentiment: "positive" | "neutral" | "negative",
  ) => {
    if (!post) return;

    const updatedPost = { ...post };
    updatedPost.comments[commentIndex].general_sentiment = sentiment;
    updatePost(updatedPost);
  };

  if (!post) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to List
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={undo}
            disabled={currentIndex === 0}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md disabled:opacity-50"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={currentIndex === history.length - 1}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md disabled:opacity-50"
          >
            <Redo className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Post Details */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Post Details</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <div className="text-base text-gray-900">{post.source}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <div className="text-base text-gray-900 whitespace-pre-wrap">
              {post.caption}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      {post.comments.map((comment, commentIndex) => (
        <div key={comment.id} className="bg-white shadow rounded-lg mb-6">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Comment {commentIndex + 1}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Comment Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment Text
              </label>
              <textarea
                value={comment.text}
                onChange={(e) =>
                  handleCommentTextChange(commentIndex, e.target.value)
                }
                className="w-full min-h-[100px] p-3 border-2 border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            {/* Aspects */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Aspects
                </label>
                <button
                  onClick={() => handleAddAspect(commentIndex)}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Aspect
                </button>
              </div>

              {comment.aspects.map((aspect, aspectIndex) => (
                <div
                  key={aspect.id}
                  className="flex items-center gap-4 mb-4 bg-white p-4 rounded-md"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={aspect.aspect_name}
                      onChange={(e) =>
                        handleAspectChange(
                          commentIndex,
                          aspectIndex,
                          "aspect_name",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border-2 border-gray-300 rounded-md"
                      placeholder="Enter aspect"
                    />
                  </div>
                  <select
                    value={aspect.sentiment}
                    onChange={(e) =>
                      handleAspectChange(
                        commentIndex,
                        aspectIndex,
                        "sentiment",
                        e.target.value,
                      )
                    }
                    className="w-40 p-2 border-2 border-gray-300 rounded-md bg-white"
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                  <button
                    onClick={() =>
                      handleRemoveAspect(commentIndex, aspectIndex)
                    }
                    className="p-2 text-red-600 hover:text-red-800 rounded-md"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* General Sentiment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                General Sentiment
              </label>
              <div className="flex gap-6">
                {["positive", "neutral", "negative"].map((sentiment) => (
                  <label key={sentiment} className="relative flex items-center">
                    <input
                      type="radio"
                      name={`sentiment-${comment.id}`}
                      value={sentiment}
                      checked={comment.general_sentiment === sentiment}
                      onChange={() =>
                        handleGeneralSentimentChange(
                          commentIndex,
                          sentiment as "positive" | "neutral" | "negative",
                        )
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {sentiment}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
