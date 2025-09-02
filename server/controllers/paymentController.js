const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// get all payments
exports.getPayments = async (req, res) => {
  try {
    // sort by paymentDate in descending order (newest first)
    const payments = await Payment.find({}).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// get payments for a specific lead
exports.getPaymentsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }
    
    // strict query by leadId, sort newest first
    const payments = await Payment.find({ leadId: leadId.toString() }).sort({ paymentDate: -1 });
    console.log(`Found ${payments.length} payments for lead ${leadId}`);
    
    res.json(payments);
  } catch (error) {
    console.error(`Error fetching payments for lead ${req.params.leadId}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// create a new payment
exports.createPayment = async (req, res) => {
  try {
    // make sure we have a payment date that's normalized to avoid timezone issues
    let paymentData = req.body;
    
    // convert paymentDate string to a Date object if it's not already 
    if (typeof paymentData.paymentDate === 'string') {
      // parse the date parts to ensure date is created correctly without timezone shifts
      const dateParts = paymentData.paymentDate.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // month is 0-indexed in JS Date
      const day = parseInt(dateParts[2]);
      
      // create date with UTC to avoid any timezone issues
      const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
      paymentData.paymentDate = dateObj;
    }
    
    // create new payment
    const payment = new Payment(paymentData);
    const createdPayment = await payment.save();
    
    // update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.status(201).json(createdPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // make sure we have a payment date that's normalized to avoid timezone issues
    let paymentData = req.body;
    
    // convert paymentDate string to a Date object if it's not already
    if (typeof paymentData.paymentDate === 'string') {
      // parse the date parts to ensure date is created correctly without timezone shifts
      const dateParts = paymentData.paymentDate.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // month is 0-indexed in JS Date
      const day = parseInt(dateParts[2]);
      
      // create date with UTC to avoid any timezone issues
      const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
      paymentData.paymentDate = dateObj;
    }
    
    // update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    // update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const leadId = payment.leadId;
    
    // delete payment
    await Payment.deleteOne({ _id: req.params.id });
    
    // update lead's paid amount and payment status
    await updateLeadPaymentInfo(leadId);
    
    res.json({ message: 'Payment removed' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// helper function to update lead payment info
async function updateLeadPaymentInfo(leadId) {
  try {
    // get all payments for the lead
    const payments = await Payment.find({ leadId });
    
    // calculate total paid amount
    const paidAmount = payments.reduce((total, payment) => total + payment.amount, 0);
    
    // get the lead
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // calculate remaining balance
    const totalBudget = lead.totalBudget || 0;
    const remainingBalance = totalBudget - paidAmount;
    
    // update lead with payment-related fields
    await Lead.findByIdAndUpdate(leadId, { 
      paidAmount,
      remainingBalance
    });
    
    return { paidAmount, remainingBalance };
  } catch (error) {
    console.error('Error updating lead payment info:', error);
    throw error;
  }
}