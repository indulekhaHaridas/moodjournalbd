const moods = require('../model/moodModel');


//Controller to add a new mood entry
exports.addMoodController = async (req, res) => {
  console.log('inside addMoodController');

  const { mood, text } = req.body;
  console.log(mood, text);

  const email = req.payload; // from jwtMiddleware
  console.log(email);

  if (!mood || !mood.emoji || !mood.label || !text) {
    return res.status(400).json('All fields are required');
  }

  const moodScores = {
    Happy: 6,
    Calm: 5,
    Angry: 4,
    Anxious: 3,
    Sad: 2,
    Tired: 1
  };

  const score = moodScores[mood.label] || 3; // default if no match

  try {
    // ✅ Step 1: Check if user already added a mood today
    const start = new Date();
    start.setHours(0, 0, 0, 0);  // Today at 00:00:00
    const end = new Date();
    end.setHours(23, 59, 59, 999);  // Today at 23:59:59

    const todayMood = await moods.findOne({
      userMail: email,
      date: { $gte: start, $lte: end }
    });

    if (todayMood) {
      return res.status(400).json("You’ve already added today’s mood.");
    }

    // ✅ Step 2: Save new mood entry
    const newMood = new moods({
      mood: {
        emoji: mood.emoji,
        label: mood.label
      },
      score,  // Save score
      text,
      userMail: email
    });

    await newMood.save();
    res.status(200).json(newMood);
  } catch (error) {
    console.error('Error adding mood:', error);
    res.status(500).json(error);
  }
};



//to get moods
exports.getMoodController = async (req, res) => {
  const email = req.payload;
  console.log('Email from JWT:', email);

  if (!email) {
    return res.status(401).json('Unauthorized: Email not found in token');
  }

  try {
    const userMoods = await moods.find({ userMail: email });
    console.log('Moods found:', userMoods);
    res.status(200).json(userMoods);
  } catch (error) {
    console.error("Error fetching moods:", error);
    res.status(500).json('Internal server error');
  }
};



//to delete mood
exports.deleteMoodController = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await moods.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Mood not found' });
    }
    res.status(200).json({ message: 'Mood deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//to update mood
exports.updateMoodController = async (req, res) => {
  const { id } = req.params;
  const { mood, text } = req.body;
  const email = req.payload;

  if (!mood || !mood.emoji || !mood.label || !text) {
    return res.status(400).json('All fields are required');
  }

  const moodScores = {
    Happy: 6,
    Calm: 5,
    Angry: 4,
    Anxious: 3,
    Sad: 2,
    Tired:1
  };

  const score = moodScores[mood.label] || 3;

  try {
    const updatedMood = await moods.findOneAndUpdate(
      { _id: id, userMail: email },
      {
        $set: {
          mood: {
            emoji: mood.emoji,
            label: mood.label
          },
          score,  // ✅ Update score as well
          text
        }
      },
      { new: true }
    );

    if (!updatedMood) {
      return res.status(404).json('Mood not found or unauthorized');
    }

    res.status(200).json(updatedMood);
  } catch (error) {
    console.error('Error updating mood:', error);
    res.status(500).json('Internal server error');
  }
};



exports.userMoodAnalysisController = async (req, res) => {
  const email = req.payload;           // set by your jwtMiddleware

  try {
    // 1️⃣ pull this user's moods
    const docs = await moods.find({ userMail: email });

    // 2️⃣ build maps
    const pieMap = { Happy:0, Calm:0, Angry:0, Anxious:0, Sad:0, Tired:0 };
    const lineMap = {};   // { 'YYYY‑MM‑DD': { Happy:0, Calm:0, ... } }

    docs.forEach((m) => {
      const label = m.mood.label;
      const day   = new Date(m.date).toISOString().slice(0,10); // YYYY‑MM‑DD

      // pie counts
      pieMap[label] = (pieMap[label] || 0) + 1;

      // line counts
      if (!lineMap[day]) {
        lineMap[day] = { day, Happy:0, Calm:0, Angry:0, Anxious:0, Sad:0, Tired:0 };
      }
      lineMap[day][label] += 1;
    });

    // 3️⃣ convert maps → arrays
    const lineData = Object.values(lineMap).sort((a,b)=>a.day.localeCompare(b.day));
    const pieData  = Object.entries(pieMap)
                           .map(([name,value])=>({ name, value }))
                           .filter(p=>p.value>0);

    res.status(200).json({ lineData, pieData });
  } catch (err) {
    console.error("Analysis build failed:", err);
    res.status(500).json({ error: "Could not build analysis" });
  }
};

// ────────────────────────────────────────────────
// ADMIN  →  total number of journal entries
// GET /journals-count
exports.journalCountController = async (req, res) => {
  try {
    const count = await moods.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Couldn't fetch journal count" });
  }
};

// ADMIN  →  average mood score across all entries
// GET /average-mood
exports.avgMoodController = async (req, res) => {
  try {
    const agg = await moods.aggregate([
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);
    res.json({ avg: agg[0]?.avg || 0 });
  } catch (err) {
    res.status(500).json({ error: "Couldn't compute average mood" });
  }
};

// ADMIN  →  count of “anomalies” (score ≤ 2)
// GET /anomalies-count
exports.anomalyCountController = async (req, res) => {
  try {
    const count = await moods.countDocuments({ score: { $lte: 2 } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Couldn't fetch anomaly count" });
  }
};






