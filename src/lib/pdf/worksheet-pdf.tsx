import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { QuestionType, Difficulty } from "@prisma/client";

// Register fonts for RTL support (Urdu/Arabic)
// Using Noto Sans Arabic which supports Arabic script used in Urdu
Font.register({
  family: "Noto Sans Arabic",
  src: "https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvvnCBFQLaig.ttf",
});

// Define types
interface Topic {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
    icon: string | null;
  };
}

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: Record<string, string> | null;
  correctAnswer: string;
  explanation: string | null;
  marks: number;
  topic: Topic;
}

interface WorksheetQuestion {
  questionId: string;
  order: number;
  customMarks: number | null;
  question: Question;
}

interface Worksheet {
  id: string;
  title: string;
  schoolName: string | null;
  examName: string | null;
  className: string | null;
  date: string | null;
  totalMarks: number | null;
  createdAt: string;
  questions: WorksheetQuestion[];
  questionCount: number;
  calculatedTotalMarks: number;
}

// RTL subjects that need right-to-left text direction
const RTL_SUBJECTS = ["Urdu", "Islamiyat"];

const isRTLSubject = (subjectName: string): boolean => {
  return RTL_SUBJECTS.includes(subjectName);
};

// Format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format question type
const formatQuestionType = (type: QuestionType): string => {
  const labels: Record<QuestionType, string> = {
    MCQ: "Multiple Choice",
    FILL_BLANK: "Fill in the Blank",
    SHORT_ANSWER: "Short Answer",
    LONG_ANSWER: "Long Answer",
    TRUE_FALSE: "True/False",
  };
  return labels[type];
};

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  // Header styles
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  examName: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    fontSize: 10,
  },
  metadataItem: {
    fontSize: 10,
  },
  // Instructions
  instructions: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  instructionText: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 3,
  },
  // Question styles
  questionsContainer: {
    marginTop: 10,
  },
  questionBlock: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    borderBottomStyle: "dashed",
  },
  questionHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  questionNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  questionNumberText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  questionContent: {
    flex: 1,
  },
  questionMeta: {
    flexDirection: "row",
    marginBottom: 5,
  },
  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 8,
    color: "#374151",
  },
  questionText: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  questionTextRTL: {
    fontSize: 12,
    lineHeight: 1.8,
    marginBottom: 8,
    textAlign: "right",
    fontFamily: "Noto Sans Arabic",
  },
  marks: {
    fontSize: 9,
    color: "#666666",
    textAlign: "right",
    marginTop: 5,
  },
  // MCQ options
  optionsContainer: {
    marginLeft: 35,
    marginTop: 5,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  optionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  optionLetter: {
    fontSize: 9,
    color: "#374151",
  },
  optionText: {
    fontSize: 10,
    flex: 1,
  },
  optionTextRTL: {
    fontSize: 11,
    flex: 1,
    textAlign: "right",
    fontFamily: "Noto Sans Arabic",
  },
  // True/False options
  tfContainer: {
    flexDirection: "row",
    marginLeft: 35,
    marginTop: 8,
  },
  tfOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },
  tfCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    marginRight: 6,
  },
  tfText: {
    fontSize: 10,
  },
  // Fill in the blank
  blankLine: {
    marginLeft: 35,
    marginTop: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#9ca3af",
    borderBottomStyle: "dashed",
    height: 25,
  },
  // Answer lines for short/long answer
  answerLinesContainer: {
    marginLeft: 35,
    marginTop: 10,
  },
  answerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    height: 22,
    marginBottom: 2,
  },
  // Answer key styles
  answerKeyHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
    fontFamily: "Helvetica-Bold",
  },
  answerKeyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  answerKeyItem: {
    width: "20%",
    padding: 8,
    marginBottom: 5,
  },
  answerKeyQuestion: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  answerKeyAnswer: {
    fontSize: 9,
    color: "#059669",
  },
  answerKeyAnswerLong: {
    fontSize: 9,
    color: "#059669",
    lineHeight: 1.4,
  },
  // Long answer detail section
  answerKeyDetailSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  answerKeyDetailTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  answerKeyDetailItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  answerKeyDetailQuestion: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  answerKeyDetailAnswer: {
    fontSize: 9,
    color: "#059669",
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#9ca3af",
  },
});

// Question component
interface QuestionBlockProps {
  worksheetQuestion: WorksheetQuestion;
  index: number;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  worksheetQuestion,
  index,
}) => {
  const { question, customMarks } = worksheetQuestion;
  const marks = customMarks ?? question.marks;
  const isRTL = isRTLSubject(question.topic.subject.name);

  return (
    <View style={styles.questionBlock} wrap={false}>
      <View style={styles.questionHeader}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.questionContent}>
          {/* Question metadata */}
          <View style={styles.questionMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {formatQuestionType(question.questionType)}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{question.difficulty}</Text>
            </View>
          </View>

          {/* Question text */}
          <Text style={isRTL ? styles.questionTextRTL : styles.questionText}>
            {question.questionText}
          </Text>

          {/* MCQ Options */}
          {question.questionType === "MCQ" && question.options && (
            <View style={styles.optionsContainer}>
              {Object.entries(question.options).map(([key, value]) => (
                <View key={key} style={styles.optionRow}>
                  <View style={styles.optionCircle}>
                    <Text style={styles.optionLetter}>{key}</Text>
                  </View>
                  <Text style={isRTL ? styles.optionTextRTL : styles.optionText}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* True/False Options */}
          {question.questionType === "TRUE_FALSE" && (
            <View style={styles.tfContainer}>
              <View style={styles.tfOption}>
                <View style={styles.tfCircle} />
                <Text style={styles.tfText}>True</Text>
              </View>
              <View style={styles.tfOption}>
                <View style={styles.tfCircle} />
                <Text style={styles.tfText}>False</Text>
              </View>
            </View>
          )}

          {/* Fill in the Blank */}
          {question.questionType === "FILL_BLANK" && (
            <View style={styles.blankLine} />
          )}

          {/* Short Answer */}
          {question.questionType === "SHORT_ANSWER" && (
            <View style={styles.answerLinesContainer}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={styles.answerLine} />
              ))}
            </View>
          )}

          {/* Long Answer */}
          {question.questionType === "LONG_ANSWER" && (
            <View style={styles.answerLinesContainer}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.answerLine} />
              ))}
            </View>
          )}

          {/* Marks */}
          <Text style={styles.marks}>
            [{marks} mark{marks > 1 ? "s" : ""}]
          </Text>
        </View>
      </View>
    </View>
  );
};

// Main PDF Document component
interface WorksheetPDFProps {
  worksheet: Worksheet;
}

const WorksheetPDF: React.FC<WorksheetPDFProps> = ({ worksheet }) => {
  // Separate questions that need detailed answers in answer key
  const shortAnswers = worksheet.questions.filter(
    (wq) =>
      wq.question.questionType === "SHORT_ANSWER" ||
      wq.question.questionType === "LONG_ANSWER" ||
      wq.question.questionType === "FILL_BLANK"
  );

  return (
    <Document>
      {/* Questions Page(s) */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {worksheet.schoolName && (
            <Text style={styles.schoolName}>{worksheet.schoolName}</Text>
          )}
          {worksheet.examName && (
            <Text style={styles.examName}>{worksheet.examName}</Text>
          )}
          <View style={styles.metadataRow}>
            {worksheet.className && (
              <Text style={styles.metadataItem}>
                Class: {worksheet.className}
              </Text>
            )}
            <Text style={styles.metadataItem}>
              Total Marks: {worksheet.calculatedTotalMarks}
            </Text>
            {worksheet.date && (
              <Text style={styles.metadataItem}>
                Date: {formatDate(worksheet.date)}
              </Text>
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Instructions: Answer all questions. Write your answers clearly.
          </Text>
          <Text style={styles.instructionText}>
            Time: _______ minutes | Total Questions: {worksheet.questionCount}
          </Text>
        </View>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          {worksheet.questions.map((wq, index) => (
            <QuestionBlock
              key={wq.question.id}
              worksheetQuestion={wq}
              index={index}
            />
          ))}
        </View>

        {/* Footer */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Answer Key Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.answerKeyHeader}>Answer Key</Text>

        {/* Header info */}
        <View style={styles.metadataRow}>
          {worksheet.schoolName && (
            <Text style={styles.metadataItem}>{worksheet.schoolName}</Text>
          )}
          {worksheet.examName && (
            <Text style={styles.metadataItem}>{worksheet.examName}</Text>
          )}
          {worksheet.className && (
            <Text style={styles.metadataItem}>Class: {worksheet.className}</Text>
          )}
        </View>

        {/* Quick Answer Grid (for MCQ and True/False) */}
        <View style={[styles.answerKeyGrid, { marginTop: 20 }]}>
          {worksheet.questions.map((wq, index) => {
            const isLongAnswer =
              wq.question.questionType === "SHORT_ANSWER" ||
              wq.question.questionType === "LONG_ANSWER";
            const answer = isLongAnswer
              ? "(See below)"
              : wq.question.correctAnswer;
            const displayAnswer =
              answer.length > 15 ? answer.substring(0, 15) + "..." : answer;

            return (
              <View key={wq.question.id} style={styles.answerKeyItem}>
                <Text style={styles.answerKeyQuestion}>Q{index + 1}:</Text>
                <Text style={styles.answerKeyAnswer}>{displayAnswer}</Text>
              </View>
            );
          })}
        </View>

        {/* Detailed Answers Section (for short/long answer questions) */}
        {shortAnswers.length > 0 && (
          <View style={styles.answerKeyDetailSection}>
            <Text style={styles.answerKeyDetailTitle}>
              Detailed Answers (Short Answer, Long Answer, Fill in the Blank)
            </Text>
            {shortAnswers.map((wq) => {
              const index = worksheet.questions.findIndex(
                (q) => q.question.id === wq.question.id
              );
              const isRTL = isRTLSubject(wq.question.topic.subject.name);
              return (
                <View key={wq.question.id} style={styles.answerKeyDetailItem}>
                  <Text style={styles.answerKeyDetailQuestion}>
                    Q{index + 1}. {wq.question.questionText.substring(0, 50)}
                    {wq.question.questionText.length > 50 ? "..." : ""}
                  </Text>
                  <Text
                    style={
                      isRTL
                        ? [styles.answerKeyDetailAnswer, { textAlign: "right", fontFamily: "Noto Sans Arabic" }]
                        : styles.answerKeyDetailAnswer
                    }
                  >
                    {wq.question.correctAnswer}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by QuestionForge - AI-Powered Educational Content
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// Helper function to create the PDF document element
// This ensures proper typing for renderToBuffer
export function createWorksheetPDF(worksheet: Worksheet) {
  return <WorksheetPDF worksheet={worksheet} />;
}

export default WorksheetPDF;
