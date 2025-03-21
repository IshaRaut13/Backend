import Contact from "../models/contactModel.js";

// Submit a contact request
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    res.status(201).json({ success: true, message: "Contact request submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact inquiries (Admin View)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
