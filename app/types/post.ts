export interface Post {
  title: string
  date: string
  path: string
  description?: string
  tags?: string[]
}

export interface PartialPost extends Partial<Post> {}