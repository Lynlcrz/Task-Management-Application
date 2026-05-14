export interface Task {
  id:           number;
  title:        string;
  description:  string | null;
  status:       'active' | 'completed';
  created_at:   string;
  updated_at:   string;
}

export type FilterStatus = 'all' | 'active' | 'completed';

export interface CreateTaskBody {
  title:        string;
  description?: string;
}

export interface UpdateTaskBody {
  title?:       string;
  description?: string;
  status?:      'active' | 'completed';
}