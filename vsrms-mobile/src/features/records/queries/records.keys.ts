export const recordKeys = {
  all:      () => ['records']                                       as const,
  lists:    () => [...recordKeys.all(), 'list']                     as const,
  vehicle:  (id: string) => [...recordKeys.all(), 'vehicle', id]   as const,
  workshop: (id: string) => [...recordKeys.all(), 'workshop', id]  as const,
  detail:   (id: string) => [...recordKeys.all(), id]              as const,
};
