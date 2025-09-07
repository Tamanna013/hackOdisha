import { useState } from 'react';
import { X } from 'lucide-react';
import type { UserPreferences } from '../../types';
import { useMemory } from '../../hooks/useMemory';

interface PreferencesModalProps {
  onClose: () => void;
}

export const PreferencesModal = ({ onClose }: PreferencesModalProps) => {
  const { memory, updateUserPreferences } = useMemory("default-user-id");
  const [formData, setFormData] = useState<UserPreferences>(memory.userPreferences);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const interests = checked 
        ? [...prev.interests, value]
        : prev.interests.filter(i => i !== value);
      
      return { ...prev, interests };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Preferences</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Conversation Style</label>
            <select
              name="conversationStyle"
              value={formData.conversationStyle}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="humorous">Humorous</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="space-y-2">
              {['technology', 'music', 'travel', 'sports', 'books', 'movies', 'science', 'art'].map(interest => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={handleInterestsChange}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{interest}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};