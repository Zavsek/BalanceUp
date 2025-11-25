interface friendRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  sentAt: string; // ISO date string (DateOnly in backend)
}

export default friendRequest;
