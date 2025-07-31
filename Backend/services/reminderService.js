const sgMail = require('@sendgrid/mail');
const cron = require('node-cron');
const Habit = require('../models/Habit');
const User = require('../models/User');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      // --- THE FIX: Timezone-Aware Reminder Logic ---

      // 1. Find ALL habits where reminders are enabled.
      // We don't check the time here, because the "correct" time is different for every user.
      const habitsToPotentiallyRemind = await Habit.find({
        reminderEnabled: true,
        isArchived: { $ne: true }
      });

      if (habitsToPotentiallyRemind.length === 0) {
        return; // No active reminders in the whole system.
      }

      const nowUTC = new Date();

      // 2. Loop through each habit and check the time in the user's local timezone.
      for (const habit of habitsToPotentiallyRemind) {
        // If a habit is missing the offset for some reason, we can't process it.
        if (habit.timezoneOffset === null || habit.timezoneOffset === undefined) {
            continue;
        }

        // 3. Calculate the user's current local time.
        // The browser's getTimezoneOffset() is inverted (e.g., India is UTC+5:30, but offset is -330).
        // To get local time from UTC, we must SUBTRACT the offset.
        const userLocalTime = new Date(nowUTC.getTime() - (habit.timezoneOffset * 60000));
        
        // 4. Get the current hour and minute from the user's calculated local time.
        // We use getUTCHours() and getUTCMinutes() on this *new* date object. This is the correct
        // way to get the time components without the server's own timezone interfering.
        const userCurrentHour = userLocalTime.getUTCHours();
        const userCurrentMinute = userLocalTime.getUTCMinutes();
        const userCurrentTime = `${String(userCurrentHour).padStart(2, '0')}:${String(userCurrentMinute).padStart(2, '0')}`;
        
        // 5. Compare the user's current time with their saved reminder time.
        if (userCurrentTime === habit.reminderTime) {
          // If they match, we send the email!
          const user = await User.findById(habit.userId);
          if (!user) continue;

          console.log(`Match found! Sending reminder for "${habit.title}" to ${user.email} for their local time of ${userCurrentTime}.`);

          const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

          const msg = {
            to: user.email,
            from: process.env.EMAIL_FROM,
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

          await sgMail.send(msg);
          console.log(`Reminder sent for habit "${habit.title}" to ${user.email}`);
        }
      }
    } catch (err) {
      console.error('Error in reminder cron job:', err);
      if (err.response) {
        console.error(err.response.body);
      }
    }
  });
};

module.exports = { scheduleReminders };
