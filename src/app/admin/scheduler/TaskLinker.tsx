import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  deadline: string;
  assignedTo: { id: string; name: string };
}

interface Draft {
  id: string;
  title: string;
  slug: string;
}

export default function TaskLinker({ task, onLinked }: { task: Task; onLinked: () => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task?.assignedTo?.id) {
      axios
        .get(`/api/posts?allDraftsForUser=true&authorId=${task.assignedTo.id}`)
        .then(res => setDrafts(res.data.posts))
        .catch(() => toast.error('Failed to load drafts'));
    }
  }, [task]);

  const handleLink = async () => {
    if (!selectedDraft) {
      toast.error('Select a draft to link');
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`/api/admin/tasks/${task.id}/link-post`, { postId: selectedDraft });
      toast.success('Draft linked and scheduled!');
      onLinked();
    } catch {
      toast.error('Failed to link draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-900">
      <h3 className="font-bold mb-2">Link Draft to Task</h3>
      <div className="mb-2">
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedDraft}
          onChange={e => setSelectedDraft(e.target.value)}
        >
          <option value="">Select a draft</option>
          {drafts.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>
      </div>
      <button
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        onClick={handleLink}
        disabled={loading}
      >
        Link & Schedule
      </button>
    </div>
  );
}
