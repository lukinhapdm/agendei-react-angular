import { queryOptions } from '@tanstack/react-query';
import { getOwnProfile } from './profile.repository';

export const profileKeys = {
  own: (userId: string) => ['profile', userId] as const,
};

export const ownProfileQuery = (userId: string) =>
  queryOptions({ queryKey: profileKeys.own(userId), queryFn: () => getOwnProfile(userId) });
