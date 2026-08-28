import mongoose from "mongoose";

import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateGeminiResponse } from "../services/gemini.services.js";
import { buildPrompt } from "../utils/promptBuilder.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeTopic = (value) => String(value || "").trim().toLowerCase();

const buildInterviewQuestion = ({ question, answer, example, tip }) =>
  `Question: ${question}\n\nDetailed Answer: ${answer}\n\nExample: ${example}\n\nInterview Tip: ${tip}`;

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
          "Fitts's Law (pointing) and Hick's Law (choice)",
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
        `Write a 2-3 line definition of ${topic}.`,
        "List key terms and one example.",
        "Prepare 3 short questions and 10 interview questions.",
      ];

  const questions = isHci
    ? {
        short: [
          "Define usability and its components.",
          "State any four Nielsen heuristics.",
          "Differentiate affordance and signifier.",
        ],
        long: [
          buildInterviewQuestion({
            question: "What is usability in HCI?",
            answer:
              "Usability describes how effectively, efficiently, and satisfactorily people can use a system to achieve their goals. It is used to evaluate whether an interface is easy to learn, easy to use, and free from unnecessary friction. In interviews, explain that usability is not only about appearance; it also includes task completion speed, error reduction, and user satisfaction.",
            example:
              "A banking app with clear navigation, readable labels, and a quick bill payment flow has high usability because users can complete actions with minimal confusion.",
            tip: "Remember the three core components: effectiveness, efficiency, and satisfaction.",
          }),
          buildInterviewQuestion({
            question: "What are Nielsen's heuristics?",
            answer:
              "Nielsen's heuristics are a set of general usability principles used to identify interface problems. They help designers create systems that match real-world expectations, provide feedback, prevent errors, and support user control. These heuristics are widely used in UI reviews and usability testing.",
            example:
              "A form showing inline validation and a clear error message follows the error prevention and error recovery principles.",
            tip: "Mention a few heuristics such as visibility of system status, consistency, and recognition over recall.",
          }),
          buildInterviewQuestion({
            question: "How does user-centered design improve interfaces?",
            answer:
              "User-centered design is a process that places user needs, behavior, and feedback at the center of design decisions. It improves interfaces by reducing guesswork, aligning features with real tasks, and validating ideas through prototyping and testing. In interviews, explain that UCD reduces redesign cost because issues are discovered early.",
            example:
              "If users struggle with a hidden settings menu, a designer may move the settings icon to a visible toolbar after testing.",
            tip: "Stress that UCD is iterative: research, design, test, refine.",
          }),
          buildInterviewQuestion({
            question: "What is the difference between affordance and signifier?",
            answer:
              "Affordance is the actual possible action an object supports, while a signifier is the cue that tells users what action is possible. For example, a button can be clicked because it affords clicking, but its color, shape, or label acts as the signifier. Interviewers often ask this to test whether you understand how users discover interactions.",
            example: "A raised button looks clickable, and the word 'Submit' tells users what it does.",
            tip: "Use a simple distinction: affordance = action, signifier = clue.",
          }),
          buildInterviewQuestion({
            question: "What is cognitive load in interface design?",
            answer:
              "Cognitive load is the amount of mental effort required to understand and use an interface. High cognitive load frustrates users, while lower cognitive load makes systems easier to learn and operate. Designers reduce cognitive load by using familiar patterns, clear labels, grouping related actions, and avoiding unnecessary information.",
            example:
              "A dashboard that shows only the most important metrics first is easier to use than one that displays every possible graph at once.",
            tip: "Explain that reducing cognitive load improves speed, accuracy, and user confidence.",
          }),
          buildInterviewQuestion({
            question: "What is the Gulf of Execution in HCI?",
            answer:
              "The Gulf of Execution is the gap between what a user wants to do and what actions the system makes available. If the interface is confusing, the user may not know how to start or complete a task. A good design reduces this gulf by making actions visible, intuitive, and easy to understand.",
            example:
              "If a user wants to delete a file but cannot find the delete option, the interface has a large gulf of execution.",
            tip: "Connect it to discoverability: users should quickly know how to act.",
          }),
          buildInterviewQuestion({
            question: "What is the Gulf of Evaluation in HCI?",
            answer:
              "The Gulf of Evaluation is the gap between the system's state and the user's ability to understand that state. If feedback is unclear, users cannot tell whether their action worked. Designers reduce this gap by showing clear confirmations, progress indicators, and informative error messages.",
            example: "After uploading a file, a message such as 'Upload complete' removes uncertainty.",
            tip: "Pair it with the Gulf of Execution in your answer for a stronger interview response.",
          }),
          buildInterviewQuestion({
            question: "Why is accessibility important in UI design?",
            answer:
              "Accessibility ensures that people with different abilities can use a system effectively. It matters because good interfaces should be inclusive, legal standards may require it, and accessible design often improves the experience for everyone. Common accessibility practices include sufficient contrast, keyboard navigation, screen-reader labels, and clear focus states.",
            example:
              "A form field with proper labels and keyboard focus support helps both visually impaired users and power users.",
            tip: "Mention WCAG, contrast, keyboard access, and semantic labels.",
          }),
          buildInterviewQuestion({
            question: "How do usability tests help improve a product?",
            answer:
              "Usability testing evaluates how real users complete tasks in a system. It reveals confusion, bottlenecks, errors, and areas where the design does not match user expectations. The findings help teams prioritize fixes based on evidence instead of assumptions.",
            example:
              "If most test users fail to find the checkout button, the button placement or wording likely needs improvement.",
            tip: "Say that usability testing measures success rate, time on task, and errors.",
          }),
          buildInterviewQuestion({
            question: "How would you explain HCI in a project interview?",
            answer:
              "HCI, or Human-Computer Interaction, is the study of how people interact with digital systems and how those systems can be designed to be usable, efficient, and satisfying. In a project interview, explain that HCI combines psychology, design, and technology to improve the user experience and reduce interaction problems.",
            example:
              "An e-learning app with simple navigation, readable content, and helpful feedback is a practical HCI-focused design.",
            tip: "Tie HCI to user needs, usability, and iterative design.",
          }),
        ],
        diagram: "Draw the interaction loop: user -> interface -> system feedback.",
      }
    : {
        short: [`Define ${topic}.`, `List important terms in ${topic}.`, `Give one example of ${topic}.`],
        long: [
          buildInterviewQuestion({
            question: `What is ${topic}?`,
            answer:
              `${topic} is the core concept being asked about in this topic. Explain what it means, why it matters, and where it is used in practice. A strong interview answer should include the definition, purpose, working idea, and how it helps in real situations.`,
            example:
              `For example, if ${topic} is a technical concept, describe one practical use case, workflow, or system where it appears.`,
            tip: "Start with a clear definition, then add practical usage and a real example.",
          }),
          buildInterviewQuestion({
            question: `Why is ${topic} important?`,
            answer:
              `The importance of ${topic} comes from the problems it solves and the value it adds in real-world systems. In an interview, explain the benefit, the efficiency it brings, and the situations where it becomes necessary. This shows both conceptual understanding and practical awareness.`,
            example:
              `A real-world example can be a product, workflow, or scenario where ${topic} saves time, improves accuracy, or reduces complexity.`,
            tip: "Link importance to outcomes such as performance, reliability, clarity, or usability.",
          }),
          buildInterviewQuestion({
            question: `How does ${topic} work?`,
            answer:
              `Describe the step-by-step mechanism of ${topic}. Explain the inputs, the process, and the output or result. If it is a theoretical topic, explain the concept flow. If it is a technical topic, explain the implementation flow. This style makes your answer interview-ready and complete.`,
            example:
              `Walk through one simple scenario showing how ${topic} behaves from start to finish.`,
            tip: "Break the explanation into steps so it is easy to follow.",
          }),
          buildInterviewQuestion({
            question: `When is ${topic} used?`,
            answer:
              `Explain the use cases where ${topic} is selected instead of other alternatives. Mention the conditions, advantages, and the type of problem it solves best. This demonstrates that you understand not just the concept, but also when to apply it.`,
            example:
              `Mention a practical situation where ${topic} is the right choice, and explain why it fits that case.`,
            tip: "Interviewers like answers that show judgment, not just memorized definitions.",
          }),
          buildInterviewQuestion({
            question: `What are the key components or characteristics of ${topic}?`,
            answer:
              `List the main parts, features, or properties of ${topic} and explain each one briefly. If the topic has stages, discuss the stages. If it has attributes, explain the most important ones. This helps present a structured and clear answer.`,
            example: "Use 2-4 specific components and connect them to the overall concept.",
            tip: "Organize the answer as a clean list or flow so the interviewer can follow it easily.",
          }),
          buildInterviewQuestion({
            question: `What are the advantages of ${topic}?`,
            answer:
              `The advantages of ${topic} usually include better performance, improved clarity, easier maintenance, stronger control, or a better user or developer experience depending on the subject. Explain the key benefits and why those benefits matter in practice.`,
            example: "Show how one advantage improves a real task or project outcome.",
            tip: "Do not just list advantages; connect each one to a practical gain.",
          }),
          buildInterviewQuestion({
            question: `What are the limitations or challenges of ${topic}?`,
            answer:
              `No concept is perfect, so it is important to explain the limitations of ${topic}. Discuss complexity, cost, learning curve, performance trade-offs, or edge cases if relevant. This shows balanced understanding and maturity in an interview.`,
            example: `Explain one situation where ${topic} may not be ideal or may need careful handling.`,
            tip: "Balanced answers sound stronger than one-sided praise.",
          }),
          buildInterviewQuestion({
            question: `Can you give a real-world example of ${topic}?`,
            answer:
              `A real-world example makes the concept easier to understand and proves that you can apply it. Choose an example that is simple, relevant, and directly related to the topic. Then explain how the concept appears in that example.`,
            example: `Use a product, app, process, or everyday scenario connected to ${topic}.`,
            tip: "A good example should be specific, not generic.",
          }),
          buildInterviewQuestion({
            question: `How does ${topic} compare with a related concept?`,
            answer:
              `Comparing ${topic} with a related concept helps show where it fits and what makes it different. Explain the major difference in purpose, behavior, structure, or usage. Interviewers often ask comparison questions to check conceptual clarity.`,
            example:
              `Compare ${topic} with a nearby idea from the same subject area and highlight one key difference.`,
            tip: "Use clear contrast words such as whereas, while, and in contrast.",
          }),
          buildInterviewQuestion({
            question: `What interview scenario could be asked about ${topic}?`,
            answer:
              `Scenario-based questions test whether you can apply ${topic} in a practical situation. Explain how you would analyze the problem, choose the right approach, and justify your decision. This type of answer shows problem-solving ability rather than memorization.`,
            example: `Describe a scenario where a team or user has a problem and show how ${topic} solves it.`,
            tip: "When answering scenarios, explain your reasoning step by step.",
          }),
        ],
        diagram: `Draw a neat diagram related to ${topic}.`,
      };

  const notes = isHci
    ? `# Human-Computer Interaction (HCI) - Quick Exam Notes

**Topic:** ${topic || "Human-Computer Interaction"}
**Class Level:** ${classLevel || "-"}
**Exam Type:** ${examType || "-"}

## ⭐ Very Important
- **Usability:** effectiveness, efficiency, satisfaction
- **Feedback:** system status, progress, confirmations, errors
- **Gulf of Execution/Evaluation:** gap between user goal -> system response
- **Nielsen Heuristics (examples):** visibility, consistency, error prevention, recognition over recall

## ⭐⭐ Important
- **UCD Process:** research -> requirements -> design -> prototype -> test -> iterate
- **Affordance vs Signifier:** possible action vs cue for action
- **Fitts's Law:** faster to click bigger/closer targets
- **Hick's Law:** more choices = slower decision

## ⭐⭐⭐ Frequently Asked
- **Accessibility:** keyboard navigation, contrast, labels, focus states
- **Usability Testing:** tasks, think-aloud, metrics (time, success rate, errors)

---
_AI was temporarily unavailable, so SmartNotes returned fallback notes._`
    : `# ${topic || "Notes"} - Fallback Exam Notes

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
      // Fix: Gemini 503 should not crash the request - return fallback notes.
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
