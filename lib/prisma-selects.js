// Shared Prisma select/include patterns used across server actions
// Centralizes common field selections to reduce duplication

export const userBasicSelect = {
  id: true,
  username: true,
  name: true,
  picture: true,
};

export const userMinimalSelect = {
  id: true,
  name: true,
  picture: true,
};

export const creatorSelect = {
  select: userBasicSelect,
};

export const userWithDeptLevelSelect = {
  id: true,
  username: true,
  name: true,
  picture: true,
  department: { select: { name: true, initial: true } },
  level: { select: { name: true } },
};

export const postCountSelect = {
  likes: true,
  comments: true,
  views: true,
};
