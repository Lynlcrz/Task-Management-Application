// This describes the shape of a Task object throughout your backend
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'active' | 'completed';
  created_at: Date;
  updated_at: Date;
}

// Used when creating — no id/timestamps yet (MySQL generates those)
export interface CreateTaskBody {
  title: string;
  description?: string;
}

// Used when editing — all fields optional (user may only change title OR status)
export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: 'active' | 'completed';
}