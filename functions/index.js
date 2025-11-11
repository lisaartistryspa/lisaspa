

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");
const cors = require("cors"); // Import cors

admin.initializeApp();
const db = admin.firestore();

// === CONFIGURATION ===
const PAYSTACK_SECRET = "sk_test_de5767a385f75dfa77a316487af8b5d9b3dca65f";
const SENDGRID_API_KEY = "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"; // optional
const TWILIO_SID = "ACfb15fac396c773272b53c83359d011c2"; // optional
const TWILIO_AUTH = "c9b2a64c7510446a2e38e477737cadb5"; // optional
const TWILIO_PHONE = "+1 329 218 1974"; // optional

sgMail.setApiKey(SENDGRID_API_KEY);
const client = twilio(TWILIO_SID, TWILIO_AUTH);

// Initialize CORS middleware
const corsHandler = cors({ origin: true }); // Allow all origins for development

// === PAYSTACK WEBHOOK ===
exports.paystackWebhook = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const event = req.body;

      if (event.event === "charge.success") {
        const data = event.data;
        const ref = data.reference;
        const email = data.customer.email;
        const amount = data.amount / 100;

        // Mark booking as paid
        const bookingRef = db.collection("bookings").doc(ref);
        await bookingRef.update({
          paymentStatus: "paid",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send Email
        if (SENDGRID_API_KEY && email) {
          try {
            await sgMail.send({
              to: email,
              from: "lisaartistryspa@gmail.com",
              subject: "Your Spa Booking is Confirmed",
              text: `Your payment of ₦${amount} has been received. See you soon!`,
            });
          } catch (emailError) {
            console.error("SendGrid error:", emailError);
          }
        }

        // Send SMS
        if (TWILIO_SID && TWILIO_AUTH) {
          try {
            await client.messages.create({
              body: `Your payment of ₦${amount} is confirmed. We look forward to seeing you!`,
              from: TWILIO_PHONE,
              to: "+234XXXXXXXXXX", // replace dynamically if stored
            });
          } catch (smsError) {
            console.error("Twilio error:", smsError);
          }
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
});


exports.verify = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { reference, bookingId } = req.body;
      const PAYSTACK_SECRET = "sk_test_de5767a385f75dfa77a316487af8b5d9b3dca65f";

      console.log("🔍 Verifying reference:", reference);

      const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });

      console.log("✅ Paystack verify response:", verifyResponse.data);

      const data = verifyResponse.data.data;

      if (data && data.status === "success") {
        await db.collection("bookings").doc(bookingId).update({
          paymentStatus: "paid",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({ status: "success", message: "Payment verified successfully" });
      } else {
        console.warn("⚠️ Paystack returned non-success:", data.status);
        return res.status(200).json({ status: "pending", message: "Payment not yet confirmed" });
      }

    } catch (error) {
      console.error("❌ Verification error:", error.response?.data || error.message);
      return res.status(500).json({
        status: "error",
        message: "Verification failed",
        details: error.response?.data || error.message
      });
    }
  });
});










