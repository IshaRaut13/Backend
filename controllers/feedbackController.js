import Feedback from "../models/feedbackModel.js";

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { userId, message, rating } = req.body;

    if (!userId || !message || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const feedback = new Feedback({ userId, message, rating });
    await feedback.save();

    res.status(201).json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
