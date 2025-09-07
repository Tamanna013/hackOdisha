// components/UserSettingsPanel.tsx
import { useState } from 'react';

interface UserSettingsPanelProps {
  memory: any;
  onUpdatePreferences: (updates: any) => void;
  onUpdateEmotionalState: (emotion: string) => void;
}

export const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({
  memory,
  onUpdatePreferences,
  onUpdateEmotionalState
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(memory.userPreferences.name);
  const [style, setStyle] = useState(memory.userPreferences.conversationStyle);

  const handleSave = () => {
    onUpdatePreferences({
      name,
      conversationStyle: style
    });
    setIsOpen(false);
  };

  return (
    <div className="settings-panel">
      <button onClick={() => setIsOpen(!isOpen)}>⚙️ Settings</button>
      
      {isOpen && (
        <div className="settings-content">
          <h3>User Settings</h3>
          
          <label>
            Your Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Conversation Style:
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="humorous">Humorous</option>
            </select>
          </label>

          <label>
            Current Mood:
            <select
              onChange={(e) => onUpdateEmotionalState(e.target.value)}
            >
              <option value="neutral">Neutral</option>
              <option value="happy">Happy</option>
              <option value="excited">Excited</option>
              <option value="curious">Curious</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </label>

          <button onClick={handleSave}>Save Changes</button>
        </div>
      )}
    </div>
  );
};