import React, { useState, useEffect } from "react"
import Confetti from "react-confetti"
import Die from "./Die"


function App() {
    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [count, setCount] = useState(0)
    const [topScore, setTopScore] = useState(JSON.parse(localStorage.getItem("top")))
    
 useEffect(() => {
        const firstValue = dice[0].value
        const allHeld = dice.every(die => die.held)
        const allSameNumber = dice.every(die => die.value === firstValue)
        if(allHeld && allSameNumber) {
            setTenzies(true)
        }
    }, [dice])

    
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
            setCount(0)
            if(count < topScore || topScore === null){
                setTopScore(count)
                localStorage.setItem("top", JSON.stringify(count))
            }
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

    return (
        <main>
            {tenzies && <Confetti />}
            <h1>Tenzies</h1>
            <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="die-container">{diceElements}</div>
            <div className="score"><p>Top Score(least rolls): {topScore}</p> <p>Your number of rolls: {count}</p></div>
            <button className="roll-dice" onClick={rollUnheldDice}>
                {tenzies ? "Reset Game" : "Roll"}
            </button>
        </main>
    )
}

export default App
