
import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { storageService } from '../services/storage';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send this to backend
    console.log({ rating, feedback });
    
    // Save timestamp so user isn't prompted immediately again
    storageService.saveRatingPromptDate();
    
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
      setFeedback('');
    }, 2000);
  };

  const handleClose = () => {
      // Even if they close without rating, we update the timestamp 
      // so we don't annoy them on every single page load, but checks daily.
      storageService.saveRatingPromptDate();
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 relative animate-scale-in">
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
            {submitted ? (
                <div className="py-8 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                    <p className="text-gray-500 dark:text-gray-400">Your feedback helps us improve.</p>
                </div>
            ) : (
                <>
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rate your experience</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        How has NUESA Scholas helped you today?
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(rating)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star 
                                        size={32} 
                                        className={`transition-colors ${star <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="relative mb-6">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Any suggestions? (Optional)"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none h-24"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={rating === 0}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${rating === 0 ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'}`}
                        >
                            Submit Feedback
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
