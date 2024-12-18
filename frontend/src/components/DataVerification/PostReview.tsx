import React, { useState } from "react";
import { PostDTO } from "../../types/api";
import { ArrowLeft, Save, Undo, Redo } from "lucide-react";

interface PostReviewProps {
  post: PostDTO;
  onSave: (updatedPost: PostDTO) => Promise<void>;
  onBack: () => void;
}

export function PostReview({
  post: initialPost,
  onSave,
  onBack,
}: PostReviewProps) {
  const [post, setPost] = useState<PostDTO>(initialPost);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(post);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to List
        </button>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md">
            <Undo className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md">
            <Redo className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

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

      {/* Comments Section */}
      {post.comments?.map((comment, index) => (
        <div key={comment.id} className="bg-white shadow rounded-lg mb-6">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Comment {index + 1}
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
                onChange={(e) => {
                  const updatedComments = [...post.comments];
                  updatedComments[index] = {
                    ...comment,
                    text: e.target.value,
                  };
                  setPost({ ...post, comments: updatedComments });
                }}
                className="w-full min-h-[100px] p-3 border-2 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>

            {/* Aspects */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Aspects
                </label>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  + Add Aspect
                </button>
              </div>

              {comment.aspects.map((aspect, aspectIndex) => (
                <div
                  key={aspect.id}
                  className="flex items-center gap-4 mb-4 bg-white p-4 rounded-md shadow-sm"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={aspect.aspect_name}
                      onChange={(e) => {
                        const updatedComments = [...post.comments];
                        updatedComments[index].aspects[aspectIndex] = {
                          ...aspect,
                          aspect_name: e.target.value,
                        };
                        setPost({ ...post, comments: updatedComments });
                      }}
                      className="w-full p-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter aspect"
                    />
                  </div>
                  <select
                    value={aspect.sentiment}
                    onChange={(e) => {
                      const updatedComments = [...post.comments];
                      updatedComments[index].aspects[aspectIndex] = {
                        ...aspect,
                        sentiment: e.target.value as
                          | "positive"
                          | "neutral"
                          | "negative",
                      };
                      setPost({ ...post, comments: updatedComments });
                    }}
                    className="w-40 p-2 border-2 border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
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
                      onChange={(e) => {
                        const updatedComments = [...post.comments];
                        updatedComments[index] = {
                          ...comment,
                          general_sentiment: e.target.value as
                            | "positive"
                            | "neutral"
                            | "negative",
                        };
                        setPost({ ...post, comments: updatedComments });
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
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
