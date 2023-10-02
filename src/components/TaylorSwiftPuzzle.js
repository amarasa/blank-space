import React, { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const questions = [
	{
		hint: "Which album has the song 'Lucky One' and is also Taylor's lucky number?",
		answer: "13 (Album: Red)",
	},
	{
		hint: "How many tracks are there on the standard edition of 'Fearless' plus one?",
		answer: "13 (12 tracks + 1)",
	},
	{
		hint: "Taylor was born in December. What's the sum of the digits in her birthdate?",
		answer: "13 (12/13/1989 -> 1+2 = 13)",
	},
	{
		hint: "How many songs are in the 'Speak Now' album minus one?",
		answer: "13 (14 songs - 1)",
	},
	{
		hint: "Take the last digit of Taylor's birth year and add it to the first.",
		answer: "13 (1+9+8+9 = 27, 1+9 = 10, 10+3 = 13)",
	},
	{
		hint: "In 'Love Story,' how many times does Taylor say the word 'Romeo' plus one?",
		answer: "13 (12 times + 1)",
	},
	{
		hint: "How old was Taylor when she released her first album?",
		answer: "13 (She was 16, but 1+6 = 7, 7*2 = 14, 14-1 = 13)",
	},
	{
		hint: "How many Grammy Awards has Taylor won as of 2022 minus one?",
		answer: "13 (11 Grammy Awards + 3 - 1)",
	},
	{
		hint: "How many tracks are there in the 'Red (Taylor's Version)' Deluxe edition divided by 2?",
		answer: "13 (26 tracks / 2)",
	},
	{
		hint: "What's the sum of the ASCII values of Taylor's initials (T.S.)?",
		answer: "13 (T=84, S=83, 8+4+8+3 = 23, 2+3 = 5, 5+8 = 13)",
	},
];

const TaylorSwiftPuzzle = () => {
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [showAnswer, setShowAnswer] = useState(false);

	const getRandomQuestion = () => {
		const randomIndex = Math.floor(Math.random() * questions.length);
		setSelectedQuestion(questions[randomIndex]);
		setShowAnswer(false);
	};

	return (
		<Box sx={{ p: 3 }}>
			<Button
				variant='contained'
				color='primary'
				onClick={getRandomQuestion}
			>
				Get Random Hint
			</Button>
			{selectedQuestion && (
				<Paper elevation={3} sx={{ mt: 3, p: 3 }}>
					<Typography variant='h6'>
						Hint: {selectedQuestion.hint}
					</Typography>
					<Box sx={{ mt: 2 }}>
						<Button
							variant='contained'
							color='secondary'
							onClick={() => setShowAnswer(true)}
						>
							Show Answer
						</Button>
					</Box>
					{showAnswer && (
						<Typography variant='body1' sx={{ mt: 2 }}>
							Answer: {selectedQuestion.answer}
						</Typography>
					)}
				</Paper>
			)}
		</Box>
	);
};

export default TaylorSwiftPuzzle;
