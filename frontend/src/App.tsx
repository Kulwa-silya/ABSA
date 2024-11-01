import React, { useState } from "react";
import { PlusCircle, Send } from "lucide-react";
import { StepIndicator } from "./components/StepIndicator";
import { Button } from "./components/Button";
import { CommentForm } from "./components/CommentForm";
import { FormData, Comment } from "./types/form";
import { PostDTO } from "./types/api";
import { usePost } from "./hooks/usePost";

const STEPS = ["Post Caption", "Comments", "Review"];

function App() {
  const { createPost, loading, error } = usePost();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    postCaption: "",
    comments: [
      {
        id: "1",
        text: "",
        aspects: [{ id: "1", aspect: "", sentiment: "neutral" }],
        generalSentiment: "neutral",
      },
    ],
  });

  const validatePostCaption = () => formData.postCaption.trim().length > 0;

  const validateComments = () => {
    return formData.comments.every(
      (comment) =>
        comment.text.trim().length > 0 &&
        comment.aspects.every((aspect) => aspect.aspect.trim().length > 0),
    );
  };

  const handlePostCaptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, postCaption: value }));
  };

  const handleAddComment = () => {
    setFormData((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: crypto.randomUUID(),
          text: "",
          aspects: [
            { id: crypto.randomUUID(), aspect: "", sentiment: "neutral" },
          ],
          generalSentiment: "neutral",
        },
      ],
    }));
  };

  const handleRemoveComment = (commentId: string) => {
    if (formData.comments.length <= 1) {
      alert("You must have at least one comment");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.filter((comment) => comment.id !== commentId),
    }));
  };

  const handleCommentChange = (commentId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId ? { ...comment, text: value } : comment,
      ),
    }));
  };

  const handleAddAspect = (commentId: string) => {
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              aspects: [
                ...comment.aspects,
                { id: crypto.randomUUID(), aspect: "", sentiment: "neutral" },
              ],
            }
          : comment,
      ),
    }));
  };

  const handleRemoveAspect = (commentId: string, aspectId: string) => {
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              aspects:
                comment.aspects.length > 1
                  ? comment.aspects.filter((aspect) => aspect.id !== aspectId)
                  : comment.aspects,
            }
          : comment,
      ),
    }));
  };

  const handleAspectChange = (
    commentId: string,
    aspectId: string,
    field: "aspect" | "sentiment",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              aspects: comment.aspects.map((aspect) =>
                aspect.id === aspectId ? { ...aspect, [field]: value } : aspect,
              ),
            }
          : comment,
      ),
    }));
  };

  const handleGeneralSentimentChange = (
    commentId: string,
    value: "positive" | "negative" | "neutral",
  ) => {
    setFormData((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, generalSentiment: value }
          : comment,
      ),
    }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Add this to prevent form submission

    // Validate current step before proceeding
    if (currentStep === 0 && !validatePostCaption()) {
      alert("Please enter a post caption");
      return;
    }

    if (currentStep === 1 && !validateComments()) {
      alert("Please fill in all comment fields and aspects");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); // Add this to prevent form submission
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitData = async () => {
    const postData: Omit<PostDTO, "id" | "created_at"> = {
      caption: formData.postCaption,
      comments: formData.comments.map((comment) => ({
        text: comment.text,
        general_sentiment: comment.generalSentiment,
        aspects: comment.aspects.map((aspect) => ({
          aspect_name: aspect.aspect,
          aspect_text: "",
          sentiment: aspect.sentiment,
        })),
      })),
    };

    await createPost(postData);
    alert("Post created successfully!");
    setFormData({
      postCaption: "",
      comments: [
        {
          id: "1",
          text: "",
          aspects: [{ id: "1", aspect: "", sentiment: "neutral" }],
          generalSentiment: "neutral",
        },
      ],
    });
    setCurrentStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === STEPS.length - 1) {
      try {
        await handleSubmitData();
      } catch (err) {
        alert("Error creating post: " + (err as Error).message);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <label
              htmlFor="postCaption"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Post Caption
            </label>
            <textarea
              id="postCaption"
              value={formData.postCaption}
              onChange={(e) => handlePostCaptionChange(e.target.value)}
              placeholder="Example: 'Check out our amazing summer sale! Discounts up to 50%!'"
              rows={4}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            {formData.comments.map((comment: Comment, index) => (
              <div key={comment.id} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comment {index + 1}
                </h3>
                <CommentForm
                  comment={comment.text}
                  aspects={comment.aspects}
                  generalSentiment={comment.generalSentiment}
                  onCommentChange={(value) =>
                    handleCommentChange(comment.id, value)
                  }
                  onAspectChange={(aspectId, field, value) =>
                    handleAspectChange(comment.id, aspectId, field, value)
                  }
                  onAddAspect={() => handleAddAspect(comment.id)}
                  onRemoveAspect={(aspectId) =>
                    handleRemoveAspect(comment.id, aspectId)
                  }
                  onGeneralSentimentChange={(value) =>
                    handleGeneralSentimentChange(comment.id, value)
                  }
                  onRemoveComment={() => handleRemoveComment(comment.id)}
                />
              </div>
            ))}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                icon={PlusCircle}
                onClick={handleAddComment}
              >
                Add Another Comment
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Post Caption
              </h3>
              <p className="whitespace-pre-wrap">{formData.postCaption}</p>
            </div>
            {formData.comments.map((comment, index) => (
              <div key={comment.id} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comment {index + 1}
                </h3>
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Aspects:</h4>
                    <ul className="list-disc list-inside">
                      {comment.aspects.map((aspect) => (
                        <li key={aspect.id}>
                          {aspect.aspect}:{" "}
                          <span className="capitalize">{aspect.sentiment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      General Sentiment:
                    </h4>
                    <p className="capitalize">{comment.generalSentiment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Social Media Comment Quality Assurance Form
        </h1>

        {error && (
          <div
            className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error.message}</span>
          </div>
        )}

        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <form onSubmit={handleSubmit} className="space-y-8">
          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
            >
              Back
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button type="submit" icon={Send} disabled={loading}>
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} disabled={loading}>
                Next
              </Button>
            )}
          </div>
        </form>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">Submitting...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
