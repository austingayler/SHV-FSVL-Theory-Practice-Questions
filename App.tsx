import { StatusBar } from "expo-status-bar";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import React, { useMemo, useState } from "react";

import aerodynamics from "./questions/aerodynamics.json";
import legislation from "./questions/legislation.json";
import materials from "./questions/materials.json";
import meteorology from "./questions/meteorology.json";
import practice from "./questions/practice.json";

import { Question } from "./src/types";
import { useHotkeys } from "react-hotkeys-hook";

import Checkbox from "expo-checkbox";

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

  const [showAnswer, setShowAnswer] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(true);

  const [notes, setNotes] = useState("");

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
      // console.log(notes);
      // localStorage.setItem(`q-${selectedQuestion?.ID}`, notes);
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
    // const n = localStorage.getItem(`q-${nextQuestion.ID}`);
    // if (n) setNotes(n || "");
    // else setNotes("");
  };

  // useHotkeys("k", () => handleChangeQuestionClick(false));
  // useHotkeys("j", () => handleChangeQuestionClick(true));
  // useHotkeys("n,f", () => setShowAnswer(!showAnswer));

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
              // {
              //   fontWeight: c === category ? "bold" : "normal",
              //   marginRight: 8,
              //   cursor: "pointer",
              // },
            ]}
            onPress={() => handleCategoryChangeClick(c)}
          >
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          key="help"
          style={[
            styles.categoryItem,
            // { opacity: 0.6, cursor: "pointer", marginRight: 8 },
          ]}
          onPress={showHelp}
        >
          <Text>help</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <Button
          onPress={() => setOrdering("random")}
          title="random"
          // style={[
          // styles.button,
          // {
          //   fontWeight: ordering === "random" ? "bold" : "normal",
          //   marginRight: 8,
          //   cursor: "pointer",
          // },
          // ]}
        />
        <Button
          onPress={() => setOrdering("sequential")}
          title="sequential"
          // style={[
          //   styles.button,
          //   {
          //     fontWeight: ordering === "sequential" ? "bold" : "normal",
          //     marginRight: 8,
          //     cursor: "pointer",
          //   },
          // ]}
        />
        <Checkbox
          value={showAnswer}
          onChange={() => setShowAnswer((v) => !v)}
        />
        <Checkbox
          value={revealAnswer}
          onChange={() => setRevealAnswer((v) => !v)}
        />
      </View>

      <View style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text>
            {selectedQuestionIndex + 1} of {eligibleQuestions.length}
          </Text>
          <Text>{selectedQuestion?.Question}</Text>

          <View style={styles.imageContainer}>
            {selectedQuestion?.ImageID && (
              <Image
                style={styles.image}
                source={{ uri: `images/${selectedQuestion.ImageID}.jpg` }}
                resizeMode="contain"
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
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.previousButton]}
          onPress={() => handleChangeQuestionClick(false)}
        >
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={() => handleChangeQuestionClick(true)}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  categoryList: {
    listStyle: "none",
    flexDirection: "row",
    flexGrow: 0,
  },
  categoryItem: {
    marginRight: 8,
  },
  buttonsContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    border: "1px solid gray",
    padding: 8,
    borderRadius: 8,
    width: 300,
  },
  imageContainer: {
    maxHeight: 300,
  },
  image: {
    flex: 1,
    width: "100%",
  },
  answersContainer: {
    paddingVertical: 8,
  },
  notesContainer: {
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 8,
    minHeight: 100,
  },
  previousButton: {
    backgroundColor: "gray",
    height: 24,
  },
  nextButton: {
    backgroundColor: "gray",
  },
});

export default App;
