import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  requireNativeComponent,
} from "react-native";

import React, { useMemo, useState } from "react";

import aerodynamics from "./questions/aerodynamics.json";
import legislation from "./questions/legislation.json";
import materials from "./questions/materials.json";
import meteorology from "./questions/meteorology.json";
import practice from "./questions/practice.json";

import { Question } from "./src/types";

import Checkbox from "expo-checkbox";
import { useResponsiveVisibility, useHotkeys } from "./src/hooks";
import store from "./src/store";
import { AutoHeightImage } from "./src/ui/AutoHeightImage";

const categories = {
  all: "all",
  aerodynamics: "aerodynamics",
  legislation: "legislation",
  materials: "materials",
  meteorology: "meteorology",
  practice: "practice",
};

const allQuestions = [
  ...aerodynamics.map((q) => ({ ...q, category: categories.aerodynamics })),
  ...legislation.map((q) => ({ ...q, category: categories.legislation })),
  ...materials.map((q) => ({ ...q, category: categories.materials })),
  ...meteorology.map((q) => ({ ...q, category: categories.meteorology })),
  ...practice.map((q) => ({ ...q, category: categories.practice })),
];

function App() {
  const [ordering, setOrdering] = useState<"random" | "sequential">(
    "sequential"
  );
  const [category, setCategory] = useState(categories.all);
  const [selectedQuestion, setSelectedQuestion] = useState<null | Question>(
    allQuestions[0]
  );

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  //Do we show the answer by default, always?
  const [showAnswer, setShowAnswer] = useState(false);
  //Do we "reveal" the answer when the user clicks "Next"?
  const [revealAnswer, setRevealAnswer] = useState(true);

  //Notes stored locally for the currently loaded question
  const [notes, setNotes] = useState("");

  // we'll just use a single breakpoint
  const isLargeScreen = useResponsiveVisibility(450);

  const eligibleQuestions = useMemo(() => {
    if (category === categories.all) return allQuestions;
    return allQuestions.filter((q) => q.category === category);
  }, [category]);

  const handleCategoryChangeClick = (category: string) => {
    // console.log(category);
    setCategory(category);
    setSelectedQuestionIndex(0);
    setSelectedQuestion(
      category === categories.all
        ? allQuestions[0]
        : allQuestions.filter((q) => q.category === category)[0]
    );
  };

  const handleChangeQuestionClick = (isNext = true) => {
    if (revealAnswer && !showAnswer) {
      setShowAnswer(true);
      return;
    }

    if (selectedQuestion?.ID) {
      console.log(notes);
      store.writeData(`q-${selectedQuestion?.ID}`, notes);
    }

    let nextQuestionIndex = 0;

    if (ordering === "random") {
      nextQuestionIndex = Math.floor(Math.random() * eligibleQuestions.length);
    } else {
      if (selectedQuestionIndex <= eligibleQuestions.length && isNext) {
        nextQuestionIndex = selectedQuestionIndex + 1;
      } else if (selectedQuestionIndex > 0 && !isNext) {
        nextQuestionIndex = selectedQuestionIndex - 1;
      }
    }

    const nextQuestion = eligibleQuestions[nextQuestionIndex];

    setSelectedQuestionIndex(nextQuestionIndex);
    setSelectedQuestion(nextQuestion);

    if (revealAnswer && showAnswer) {
      setShowAnswer(false);
    }

    // Notes
    store.getData(`q-${nextQuestion.ID}`).then((n) => setNotes(n));
  };

  useHotkeys("k", () => handleChangeQuestionClick(false));
  useHotkeys("j", () => handleChangeQuestionClick(true));
  useHotkeys("n,f", () => setShowAnswer(!showAnswer));

  const getQuestionStyles = (answer: number) => {
    const isAnswer = `${answer}` === `${selectedQuestion?.Answer}`;

    const a: {
      opacity: number;
      fontWeight: "bold" | "normal";
    } = {
      opacity: showAnswer ? (isAnswer ? 1 : 0.4) : 1,
      fontWeight: showAnswer ? (isAnswer ? "bold" : "normal") : "normal",
    };

    return a;
  };

  // TODO: could make this more sophisticated
  const showHelp = () => {
    return window.alert("j -> next \nk -> prev \nn,f -> show/hide answer");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.categoryList} horizontal>
        {Object.keys(categories).map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.categoryItem,
              {
                //@ts-ignore
                cursor: "pointer",
              },
            ]}
            onPress={() => handleCategoryChangeClick(c)}
          >
            <Text
              style={[
                {
                  fontWeight: c === category ? "bold" : "normal",
                  marginRight: 8,
                },
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          key="help"
          style={[styles.categoryItem, { opacity: 0.6, marginRight: 8 }]}
          onPress={showHelp}
        >
          <Text
            style={{
              //@ts-ignore
              cursor: "pointer",
            }}
          >
            help
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionCount}>
            {selectedQuestionIndex + 1} of {eligibleQuestions.length}
          </Text>
          <Text style={styles.questionText}>{selectedQuestion?.Question}</Text>

          <View style={styles.imageContainer}>
            {selectedQuestion?.ImageID && (
              <AutoHeightImage
                uri={require(`/assets/images/${selectedQuestion.ImageID}.jpg`)}
                style={{ maxHeight: 400 }}
              />
            )}
          </View>

          <View key={selectedQuestion?.ID} style={styles.answersContainer}>
            <Text style={getQuestionStyles(1)}>
              1. {selectedQuestion?.Answer1}
            </Text>
            <Text style={getQuestionStyles(2)}>
              2. {selectedQuestion?.Answer2}
            </Text>
            <Text style={getQuestionStyles(3)}>
              3. {selectedQuestion?.Answer3}
            </Text>
            <Text style={getQuestionStyles(4)}>
              4. {selectedQuestion?.Answer4}
            </Text>
          </View>

          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={(text) => setNotes(text)}
              multiline
              numberOfLines={2}
              placeholder="Your notes here..."
            />
          </View>
        </View>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          onPress={() => setOrdering("random")}
          style={[styles.actionButton]}
        >
          <Text style={styles.actionButtonText}>{`${
            ordering === "random" ? "✓" : ""
          } Random`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrdering("sequential")}
          style={[styles.actionButton]}
        >
          <Text style={styles.actionButtonText}>{`${
            ordering === "random" ? "" : "✓"
          } Sequential`}</Text>
        </TouchableOpacity>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={showAnswer}
            onChange={() => setShowAnswer((v) => !v)}
          />

          {isLargeScreen && (
            <Text style={styles.checkboxLabel}>Show answer</Text>
          )}
        </View>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={revealAnswer}
            onChange={() => setRevealAnswer((v) => !v)}
          />

          {isLargeScreen && (
            <Text style={styles.checkboxLabel}>Reveal answer</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.previousButton]}
          onPress={() => handleChangeQuestionClick(false)}
        >
          <Text style={styles.actionButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.nextButton]}
          onPress={() => handleChangeQuestionClick(true)}
        >
          <Text style={styles.actionButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    minWidth: 300,
  },
  categoryList: {
    listStyle: "none",
    flexDirection: "row",
    flexGrow: 0,
  },
  categoryItem: {
    marginRight: 8,
  },
  settingsContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  questionCard: {
    border: "1px solid lightgray",
    padding: 16,
    borderRadius: 8,
    width: "clamp(100px, 90vw, 800px)",
    display: "flex",
    flexDirection: "column",
  },
  imageContainer: {
    flex: 1,
  },
  questionCount: {
    color: "gray",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 18,
  },
  answersContainer: {
    paddingVertical: 8,
  },
  notesContainer: {
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 8,
    padding: 8,
  },
  buttonsContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 24,
  },
  actionButton: {
    fontFamily: "Roboto, sans-serif",
    fontSize: 14,
    color: "white",
    padding: 4,
    boxShadow: "rgb(0, 0, 0) 0px 0px 0px 0px",
    borderRadius: 8,
    transition: "1000ms",
    transform: "translateY(0)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    justifyContent: "center",
    cursor: "pointer",
  },
  actionButtonText: {
    color: "white",
    paddingHorizontal: 8,
  },
  previousButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  checkboxContainer: {
    border: "1px solid lightgray",
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
  },
  checkboxLabel: {
    marginLeft: 4,
  },
});

export default App;
