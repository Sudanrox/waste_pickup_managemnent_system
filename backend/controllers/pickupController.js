export const getPickupSchedule = (req, res) => {
  const { wardId } = req.params;
  res.json({
    wardId,
    nextPickup: "2025-10-30T07:00:00Z",
    status: "scheduled",
  });
};

export const reportMissedPickup = (req, res) => {
  const { wardId, issue } = req.body;
  res.json({ message: `Issue reported for Ward ${wardId}: ${issue}` });
};
