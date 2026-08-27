import mongoose from "mongoose";

import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateGeminiResponse } from "../services/gemini.services.js";
import { buildPrompt } from "../utils/promptBuilder.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeTopic = (value) => String(value || "").trim().toLowerCase();

// Fallback content is used when Gemini is overloaded (503) or returns invalid JSON.
// It must match the UI's expected JSON shape so the frontend never crashes.
const buildFallbackResult = ({
  topic,
  classLevel,
  examType,
  includeDiagram,
  includeChart,
  reason,
}) => {
  const normalized = normalizeTopic(topic);
  const isHci =
    normalized.includes("human-computer interaction") ||
    normalized === "hci" ||
    normalized.includes("hci");

  const subTopics = isHci
    ? {
        "⭐": [
          "Usability (effectiveness, efficiency, satisfaction)",
          "Gulf of Execution vs Gulf of Evaluation",
          "Heuristics (Nielsen)",
          "Feedback and system status",
        ],
        "⭐⭐": [
          "User-centered design (UCD) process",
          "Affordances, signifiers, mappings, constraints",
          "Fitts’s Law (pointing) and Hick’s Law (choice)",
        ],
        "⭐⭐⭐": [
          "Accessibility basics (WCAG, contrast, keyboard)",
          "Cognitive load and mental models",
          "Prototyping and usability testing",
        ],
      }
    : {
        "⭐": [`${topic} definition`, `${topic} key terms`, `${topic} common exam questions`],
        "⭐⭐": [
          `${topic} advantages / disadvantages`,
          `${topic} real-world examples`,
          `${topic} short notes + diagrams (if applicable)`,
        ],
        "⭐⭐⭐": [
          `${topic} case study / application`,
          `${topic} comparisons with related topics`,
        ],
      };

  const revisionPoints = isHci
    ? [
        "Usability = effectiveness + efficiency + satisfaction",
        "Good UI: visibility, feedback, consistency, error prevention",
        "Heuristics: match real world, user control, recognition over recall",
        "Accessibility: keyboard support, contrast, readable labels",
      ]
    : [
        `Write a 2–3 line definition of ${topic}.`,
        "List key terms and one example.",
        "Prepare 3 short questions and 1 long question.",
      ];

  const questions = isHci
    ? {
        short: [
          "Define usability and its components.",
          "State any four Nielsen heuristics.",
          "Differentiate affordance and signifier.",
        ],
        long: [
          "Explain the User-Centered Design (UCD) process with steps.",
          "Discuss common usability problems and how to fix them.",
        ],
        diagram: "Draw the interaction loop: user → interface → system feedback.",
      }
    : {
        short: [`Define ${topic}.`, `List important terms in ${topic}.`, `Give one example of ${topic}.`],
        long: [`Explain ${topic} with diagram/examples.`],
        diagram: `Draw a neat diagram related to ${topic}.`,
      };

  const notes = isHci
    ? `# Human-Computer Interaction (HCI) — Quick Exam Notes

**Topic:** ${topic || "Human-Computer Interaction"}
**Class Level:** ${classLevel || "-"}
**Exam Type:** ${examType || "-"}

## ⭐ Very Important
- **Usability:** effectiveness, efficiency, satisfaction
- **Feedback:** system status, progress, confirmations, errors
- **Gulf of Execution/Evaluation:** gap between user goal ↔ system response
- **Nielsen Heuristics (examples):** visibility, consistency, error prevention, recognition over recall

## ⭐⭐ Important
- **UCD Process:** research → requirements → design → prototype → test → iterate
- **Affordance vs Signifier:** possible action vs cue for action
- **Fitts’s Law:** faster to click bigger/closer targets
- **Hick’s Law:** more choices = slower decision

## ⭐⭐⭐ Frequently Asked
- **Accessibility:** keyboard navigation, contrast, labels, focus states
- **Usability Testing:** tasks, think-aloud, metrics (time, success rate, errors)

---
_AI was temporarily unavailable, so SmartNotes returned fallback notes._`
    : `# ${topic || "Notes"} — Fallback Exam Notes

**Topic:** ${topic || "-"}
**Class Level:** ${classLevel || "-"}
**Exam Type:** ${examType || "-"}

## ⭐ Key Points
- Definition + 2 key terms
- One real-life example
- Common exam questions

## Quick Revision
- 5 bullet points you can revise in 2 minutes
- 1 diagram idea (if applicable)

---
_AI was temporarily unavailable, so SmartNotes returned fallback notes._`;

  const diagram = includeDiagram
    ? {
        type: "flowchart",
        data: isHci
          ? "graph TD\n  A[User] --> B[Interface]\n  B --> C[System]\n  C --> D[Feedback]\n  D --> A"
          : `graph TD\n  A[${topic || "Topic"}] --> B[Definition]\n  A --> C[Key Points]\n  A --> D[Examples]`,
      }
    : { type: "flowchart", data: "" };

  const charts = includeChart
    ? [
        {
          type: "bar",
          title: isHci ? "HCI Exam Weightage (Sample)" : "Exam Focus (Sample)",
          data: isHci
            ? [
                { name: "Usability", value: 35 },
                { name: "Heuristics", value: 25 },
                { name: "UCD", value: 20 },
                { name: "Accessibility", value: 20 },
              ]
            : [
                { name: "Basics", value: 40 },
                { name: "Examples", value: 30 },
                { name: "Questions", value: 30 },
              ],
        },
      ]
    : [];

  return {
    subTopics,
    importance: "⭐",
    notes,
    revisionPoints,
    questions,
    diagram,
    charts,
    meta: {
      fallback: true,
      reason: reason || "Gemini request failed",
    },
  };
};

export const generateNotes = async (req, res) => {
  try {
    const {
      topic,
      classLevel,
      examType,
      revisionMode = false,
      includeDiagram = false,
      includeChart = false,
    } = req.body;

    // Fix: validate inputs so we don't return opaque 500s for missing fields.
    if (!isNonEmptyString(topic)) {
      return res.status(400).json({ message: "topic is required (non-empty string)" });
    }
    if (!isNonEmptyString(classLevel)) {
      return res.status(400).json({ message: "classLevel is required (non-empty string)" });
    }
    if (!isNonEmptyString(examType)) {
      return res.status(400).json({ message: "examType is required (non-empty string)" });
    }
    if (
      typeof revisionMode !== "boolean" ||
      typeof includeDiagram !== "boolean" ||
      typeof includeChart !== "boolean"
    ) {
      return res.status(400).json({
        message: "revisionMode/includeDiagram/includeChart must be boolean",
      });
    }

    // Fix: return a clean 503 if Atlas is down (ETIMEDOUT) instead of hanging.
    const dbReady =
      req.app?.locals?.dbConnected === true || mongoose.connection.readyState === 1;
    if (!dbReady) {
      return res.status(503).json({
        message:
          "Database connection is not ready. Check MongoDB Atlas Network Access (IP whitelist) and MONGODB_URL.",
      });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }

    const prompt = buildPrompt({
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
    });

    let aiResponse = null;
    let usedFallback = false;

    try {
      aiResponse = await generateGeminiResponse(prompt);
    } catch (aiError) {
      // Fix: Gemini 503 should not crash the request — return fallback notes.
      usedFallback = true;
      console.error("[gemini] generate-notes failed:", aiError?.message || aiError);
      aiResponse = buildFallbackResult({
        topic,
        classLevel,
        examType,
        includeDiagram,
        includeChart,
        reason: aiError?.message || "Gemini request failed",
      });
    }

    const notesDoc = await Notes.create({
      user: user._id,
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
      content: aiResponse,
    });

    if (!Array.isArray(user.notes)) user.notes = [];
    user.notes.push(notesDoc._id);
    await user.save();

    // Response always contains valid JSON and is safe for the React UI.
    return res.status(200).json({
      notes: String(aiResponse?.notes || ""),
      result: aiResponse,
      noteId: notesDoc._id,
      fallback: usedFallback,
    });
  } catch (error) {
    console.error("[generate-notes] error:", error);
    const status =
      error?.statusCode && Number.isFinite(error.statusCode) ? error.statusCode : 500;
    return res.status(status).json({
      message: error?.message || "Generate notes failed",
      details: error?.details,
    });
  }
};
