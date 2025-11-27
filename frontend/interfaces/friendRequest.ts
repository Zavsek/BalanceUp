interface friendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  sentAt: string; // ISO date string (DateOnly in backend)
}

export default friendRequest;
