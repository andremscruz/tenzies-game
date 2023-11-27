import React, { useState, useEffect } from "react"
import Confetti from "react-confetti"
import Die from "./Die"
import tenzie from "./service/tenzies"


function App() {
    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [count, setCount] = useState(0)
    const [scores, setScores] = useState([])
    const [name, setName] = useState("")
   
    useEffect(() => {
        tenzie.getAll().then(initalTenzies => setScores(initalTenzies))
    },[])

    useEffect(() => {
        const firstValue = dice[0].value
        const allHeld = dice.every(die => die.held)
        const allSameNumber = dice.every(die => die.value === firstValue)
        if(allHeld && allSameNumber) {
            setTenzies(true)
        }
    }, [dice])

    function handleChange(event){
        setName(event.target.value)
    }
    
    function randomDieValue() {
        return Math.ceil(Math.random() * 6)
    }

    function allNewDice() {
        const newArray = []
        for(let i = 0; i < 10; i++) {
            const newDie = {
                value: randomDieValue(),
                held: false,
                id: i + 1
            }
            newArray.push(newDie)
        }
        return newArray
    }

    function rollUnheldDice() {
        if (!tenzies) {
            setDice((oldDice) => oldDice.map((die, i) =>
                die.held ? 
                    die : 
                    { value: randomDieValue(), held: false, id: i + 1 }
            ))
            setCount(prevCount => prevCount + 1)
        } else {
            setDice(allNewDice())
            setTenzies(false)
            const scoreObject = {
                name: name,
                score: count
            }
            tenzie
            .create(scoreObject)
            .then(returnedScore => setScores(scores.concat(returnedScore)))
            .then(setCount(0))
            .then(setName(''))
        }
    }

    function holdDice(id) {
        setDice(prevDice => prevDice.map(die => 
            die.id === id ? 
                {...die, held: !die.held} : 
                die
        ))
    }

    const diceElements = dice.map(die => 
        <Die key={die.id} {...die} hold={() => holdDice(die.id)} />
    )
    
    const sortedScores = scores.sort((a, b) => a.score - b.score)
    const bestScores = sortedScores.slice(0, 3)

    return (
        <>
        <main>
            {tenzies && <Confetti />}
            <h1>Tenzies</h1>
            <p>Name: <input type="text" value={name} onChange={handleChange}></input></p>
            <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="die-container">{diceElements}</div>
            <p>Your number of rolls: {count}</p>
            <button className="roll-dice" onClick={rollUnheldDice}>
                {tenzies ? "Reset Game" : "Roll"}
            </button>
        </main>
        <p className="scores">Top Scores(least rolls): {bestScores.map(score => <p>{score.name} : {score.score}</p> )}</p> 
        </>
        
    )
}

export default App
