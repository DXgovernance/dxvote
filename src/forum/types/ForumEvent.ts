// We could generate these from the json-schema in scripts/create-model
export type ForumEventInput = {
  title?: string;
  author?: string;
  content?: string;
  parent?: string;
  type?: 'post' | 'comment' | 'like';
};

export type ForumEvent = Partial<ForumEventInput> & {
  id: string;
  author: string;
  created_at: string;
  updated_at: string;
};

