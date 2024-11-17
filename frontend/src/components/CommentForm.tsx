// frontend/src/components/CommentForm.tsx
import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { AspectEntry } from '../types/form';

interface CommentFormProps {
  comment: string;
  aspects: AspectEntry[];
  generalSentiment: 'positive' | 'negative' | 'neutral';
  commentId: string;  // Add this prop to create unique IDs
  onCommentChange: (value: string) => void;
  onAspectChange: (id: string, field: 'aspect' | 'sentiment', value: string) => void;
  onAddAspect: () => void;
  onRemoveAspect: (id: string) => void;
  onGeneralSentimentChange: (value: 'positive' | 'negative' | 'neutral') => void;
  onRemoveComment?: () => void;
}

export function CommentForm({
  comment,
  aspects,
  generalSentiment,
  commentId,
  onCommentChange,
  onAspectChange,
  onAddAspect,
  onRemoveAspect,
  onGeneralSentimentChange,
  onRemoveComment,
}: CommentFormProps) {
  return (
    <div className="space-y-6">
      {/* Comment Text Section */}
      <div className="flex justify-between items-start">
        <label htmlFor={`comment-${commentId}`} className="block text-sm font-medium text-gray-700 mb-2">
          Comment Text
        </label>
        {onRemoveComment && (
          <button
            type="button"
            onClick={onRemoveComment}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <textarea
        id={`comment-${commentId}`}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Example: 'I love the new features of your product, but delivery took too long.'"
        rows={4}
        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        required
      />

      {/* Aspects Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aspects and Sentiments</h3>
          <Button
            type="button"
            variant="secondary"
            icon={PlusCircle}
            onClick={onAddAspect}
          >
            Add Aspect
          </Button>
        </div>

        <div className="space-y-4">
          {aspects.map((aspect) => (
            <div key={aspect.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={aspect.aspect}
                  onChange={(e) => onAspectChange(aspect.id, 'aspect', e.target.value)}
                  placeholder="Enter aspect (e.g., 'delivery speed', 'product quality')"
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-4">
                {['positive', 'neutral', 'negative'].map((sentiment) => (
                  <div key={sentiment} className="flex items-center">
                    <input
                      type="radio"
                      id={`aspect-${commentId}-${aspect.id}-${sentiment}`}
                      name={`sentiment-${commentId}-${aspect.id}`}
                      value={sentiment}
                      checked={aspect.sentiment === sentiment}
                      onChange={(e) => onAspectChange(aspect.id, 'sentiment', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`aspect-${commentId}-${aspect.id}-${sentiment}`}
                      className="ml-2 text-sm text-gray-700 capitalize"
                    >
                      {sentiment}
                    </label>
                  </div>
                ))}
              </div>

              {aspects.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveAspect(aspect.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Sentiment Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Sentiment</h3>
        <div className="flex gap-6">
          {['positive', 'neutral', 'negative'].map((sentiment) => (
            <div key={sentiment} className="flex items-center">
              <input
                type="radio"
                id={`general-${commentId}-${sentiment}`}
                name={`general-sentiment-${commentId}`}
                value={sentiment}
                checked={generalSentiment === sentiment}
                onChange={(e) => onGeneralSentimentChange(e.target.value as typeof generalSentiment)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor={`general-${commentId}-${sentiment}`}
                className="ml-2 text-sm text-gray-700 capitalize"
              >
                {sentiment}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}