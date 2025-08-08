const Faq = require('../models/Faq');

// Create FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await Faq.create({ question, answer });
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all FAQs
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.status(200).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.status(200).json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
