const sgMail = require('@sendgrid/mail');
const cron = require('node-cron');
const Habit = require('../models/Habit');
const User = require('../models/User');

// --- The Core Upgrade ---
// We now use the official SendGrid library.
// It automatically knows to look for your API key in the .env file.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- NEW: A collection of fun and motivational messages ---
const motivationalMessages = [
  "Consistency is key! You've got this.",
  "Another step closer to your goal. Let's do it!",
  "Your future self will thank you for this.",
  "Small progress is still progress. Keep going!",
  "Don't break the chain! Your streak is counting on you."
];

const scheduleReminders = () => {
  console.log('Scheduler started: Checking for reminders to send every minute.');
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      const habitsToRemind = await Habit.find({
        reminderEnabled: true,
        reminderTime: currentTime,
        isArchived: { $ne: true }
      });

      if (habitsToRemind.length === 0) {
        return;
      }

      console.log(`Found ${habitsToRemind.length} habits needing a reminder at ${currentTime}.`);

      for (const habit of habitsToRemind) {
        const user = await User.findById(habit.userId);
        if (!user) continue;

        // --- UPDATED: The email is now more motivational and fun! ---
        // Randomly select one of the motivational messages.
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

        const msg = {
          to: user.email,
          from: process.env.EMAIL_FROM, // Your verified sender email
          subject: `✨ Time for your habit: ${habit.title}!`,
          html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #8b5cf6; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">HabitJoy Reminder</h1>
              </div>
              <div style="padding: 24px; font-size: 16px; line-height: 1.6; color: #333;">
                <h2 style="font-size: 20px; margin-top: 0;">Hey ${user.username},</h2>
                <p>This is your friendly nudge to take a moment for yourself and complete your habit:</p>
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                  <strong style="font-size: 18px; color: #4f46e5;">${habit.title}</strong>
                </div>
                <p style="text-align: center; font-style: italic; color: #6b7280;">"${randomMessage}"</p>
                <p>Keep building that momentum. You're doing an amazing job!</p>
                <br/>
                <p>Best,</p>
                <p><strong>The HabitJoy Team</strong></p>
              </div>
              <div style="background-color: #f9fafb; color: #9ca3af; padding: 16px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">You are receiving this because you set a reminder in the HabitJoy app.</p>
              </div>
            </div>
          `
        };

        // Send the email using the new, official SendGrid method.
        await sgMail.send(msg);
        console.log(`Reminder sent for habit "${habit.title}" to ${user.email}`);
      }
    } catch (err) {
      // The @sendgrid/mail library can provide more detailed error messages.
      console.error('Error in reminder cron job:', err);
      if (err.response) {
        console.error(err.response.body);
      }
    }
  });
};

module.exports = { scheduleReminders };
